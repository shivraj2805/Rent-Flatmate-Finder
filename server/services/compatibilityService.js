const Compatibility = require('../models/Compatibility')
const Listing = require('../models/Listing')
const TenantProfile = require('../models/TenantProfile')

// Global in-memory set to prevent duplicate concurrent evaluations
const inProgressEvaluations = new Set()

/**
 * Generate AI score using Google Gemini API (gemini-2.5-flash)
 * @param {object} listing - Listing Mongoose document
 * @param {object} profile - TenantProfile Mongoose document
 * @returns {Promise<{
 *   score: number,
 *   budgetScore: number,
 *   locationScore: number,
 *   dateScore: number,
 *   roomTypeScore: number,
 *   strengths: string[],
 *   weaknesses: string[],
 *   explanation: string
 * }>}
 */
const generateAIScore = async (listing, profile) => {
  const apiKey = process.env.GEMINI_API_KEY
  if (!apiKey) {
    throw new Error('GEMINI_API_KEY environment variable is missing.')
  }

  // Format dates for readability in the prompt
  const availableDateStr = new Date(listing.availableFrom).toLocaleDateString('en-IN')
  const moveInDateStr = new Date(profile.moveInDate).toLocaleDateString('en-IN')

  const promptText = `
You are an expert real estate matching assistant. Calculate a compatibility score (0 to 100) and provide a structured JSON response evaluating how well a tenant's preferences match a listed room.

Room Listing details:
- Title: "${listing.title}"
- Location: "${listing.location}"
- Monthly Rent: ₹${listing.rent}
- Available Date: ${availableDateStr}
- Room Type: "${listing.roomType}"
- Furnished Status: ${listing.furnished ? 'Furnished' : 'Unfurnished'}
- Amenities: ${Array.isArray(listing.amenities) ? listing.amenities.join(', ') : 'None'}
- Description: "${listing.description}"

Tenant Profile details:
- Preferred Locations: ${Array.isArray(profile.preferredLocations) ? profile.preferredLocations.join(', ') : 'None'}
- Budget Range: ₹${profile.budgetRange.min} to ₹${profile.budgetRange.max}
- Target Move-in Date: ${moveInDateStr}
- Room Type Preferences: ${Array.isArray(profile.roomPreferences) ? profile.roomPreferences.join(', ') : 'None'}
- Lifestyle Preferences: ${Array.isArray(profile.lifestylePreferences) ? profile.lifestylePreferences.join(', ') : 'None'}
- Bio: "${profile.bio || ''}"
- Gender: "${profile.gender}"

Evaluation Criteria & Point Weights (Total 100 points):
1. Budget Match (Max 40 points): Compare listing rent against the tenant's budget range. Rent within or below the budget range gets full marks. Deduct points proportionally if rent exceeds the max budget.
2. Preferred Location Match (Max 30 points): Evaluate if the listing location is within or close to the tenant's preferred locations in Pune.
3. Available Date vs Move-in Date (Max 20 points): Compare listing available date and tenant's target move-in date. Full marks if available on or before. Deduct points if available after the target date.
4. Room Type & Furnishing Match (Max 10 points): Compare listing room type and furnished status with the tenant's room preferences, lifestyle preferences, and bio. If the tenant expresses no specific room type or furnishing preference in their profile or bio, assume they are fully compatible and assign full marks.

Response requirements:
- Return ONLY a JSON object. No extra conversational text or markdown code blocks (e.g. do NOT include \`\`\`json).
- The JSON object must match this exact structure:
{
  "score": <integer from 0 to 100, which MUST be the sum of budgetScore, locationScore, dateScore, and roomTypeScore>,
  "budgetScore": <integer from 0 to 40>,
  "locationScore": <integer from 0 to 30>,
  "dateScore": <integer from 0 to 20>,
  "roomTypeScore": <integer from 0 to 10>,
  "strengths": [<array of strings specifying matching points, e.g. "Rent fits your budget range", "Located in your preferred area">],
  "weaknesses": [<array of strings specifying mismatches or drawbacks, e.g. "Rent exceeds budget", "Available after move-in date">],
  "explanation": "<concise summary explanation, 2-3 sentences max>"
}
`

  // Using gemini-2.5-flash as implemented in index.js / config
  const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`

  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      contents: [
        {
          parts: [
            {
              text: promptText,
            },
          ],
        },
      ],
      generationConfig: {
        responseMimeType: 'application/json',
      },
    }),
  })

  if (!response.ok) {
    const errorText = await response.text()
    throw new Error(`Gemini API error: ${response.status} - ${errorText}`)
  }

  const data = await response.json()
  const textContent = data.candidates?.[0]?.content?.parts?.[0]?.text
  if (!textContent) {
    throw new Error('Invalid response structure from Gemini API')
  }

  try {
    let cleanText = textContent.trim()
    // Robust cleanup of markdown blocks in case the model ignored output formats
    if (cleanText.startsWith('```')) {
      cleanText = cleanText.replace(/^```(json)?/, '').replace(/```$/, '').trim()
    }

    const parsed = JSON.parse(cleanText)
    const budgetScore = Math.min(40, Math.max(0, Number(parsed.budgetScore) || 0))
    const locationScore = Math.min(30, Math.max(0, Number(parsed.locationScore) || 0))
    const dateScore = Math.min(20, Math.max(0, Number(parsed.dateScore) || 0))
    const roomTypeScore = Math.min(10, Math.max(0, Number(parsed.roomTypeScore) || 0))
    const computedScore = budgetScore + locationScore + dateScore + roomTypeScore

    return {
      score: Math.min(100, Math.max(0, computedScore || Number(parsed.score) || 0)),
      budgetScore,
      locationScore,
      dateScore,
      roomTypeScore,
      strengths: Array.isArray(parsed.strengths) ? parsed.strengths.map(String) : [],
      weaknesses: Array.isArray(parsed.weaknesses) ? parsed.weaknesses.map(String) : [],
      explanation: String(parsed.explanation || 'No explanation provided').trim(),
    }
  } catch (err) {
    throw new Error(`Failed to parse Gemini response as JSON: ${textContent} (Error: ${err.message})`)
  }
}

/**
 * Rule-based fallback compatibility score calculation
 * Weights: Budget: 40, Location: 30, Move-in Date: 20, Room Type: 10
 * @param {object} listing - Listing Mongoose document
 * @param {object} profile - TenantProfile Mongoose document
 * @returns {{
 *   score: number,
 *   budgetScore: number,
 *   locationScore: number,
 *   dateScore: number,
 *   roomTypeScore: number,
 *   strengths: string[],
 *   weaknesses: string[],
 *   explanation: string
 * }}
 */
const calculateRuleBasedScore = (listing, profile) => {
  let budgetScore = 0
  let locationScore = 0
  let dateScore = 0
  let roomTypeScore = 0

  const strengths = []
  const weaknesses = []

  // 1. Budget Match (40 pts)
  const rent = Number(listing.rent) || 0
  const minBudget = Number(profile.budgetRange?.min) || 0
  const maxBudget = Number(profile.budgetRange?.max) || 0

  if (rent <= maxBudget) {
    budgetScore = 40
    strengths.push(`Monthly rent of ₹${rent.toLocaleString()} is within your budget range (up to ₹${maxBudget.toLocaleString()}).`)
  } else if (maxBudget > 0) {
    const overage = rent - maxBudget
    const pctOverage = overage / maxBudget
    budgetScore = Math.max(0, 40 - Math.round(pctOverage * 40))
    weaknesses.push(`Monthly rent of ₹${rent.toLocaleString()} exceeds your maximum budget of ₹${maxBudget.toLocaleString()} by ₹${overage.toLocaleString()}.`)
  } else {
    budgetScore = 40 // Default fallback if no max budget set
    strengths.push(`Rent details: ₹${rent.toLocaleString()}/month.`)
  }

  // 2. Location Match (30 pts)
  const listingLoc = (listing.location || '').toLowerCase()
  const preferredLocs = Array.isArray(profile.preferredLocations) ? profile.preferredLocations : []
  const hasLocationMatch = preferredLocs.some((loc) => {
    const cleanLoc = String(loc).toLowerCase().trim()
    return cleanLoc && (listingLoc.includes(cleanLoc) || cleanLoc.includes(listingLoc))
  })

  if (hasLocationMatch) {
    locationScore = 30
    strengths.push(`Room location (${listing.location}) matches your preferred areas.`)
  } else {
    locationScore = 0
    weaknesses.push(`Room location is in "${listing.location}", which is outside your preferred search areas.`)
  }

  // 3. Move-in Date Match (20 pts)
  const availableDate = new Date(listing.availableFrom)
  const targetDate = new Date(profile.moveInDate)

  if (!isNaN(availableDate.getTime()) && !isNaN(targetDate.getTime())) {
    if (availableDate <= targetDate) {
      dateScore = 20
      strengths.push(`Available on time (listed from ${availableDate.toLocaleDateString('en-IN')}, target move-in is ${targetDate.toLocaleDateString('en-IN')}).`)
    } else {
      const diffTime = Math.abs(availableDate - targetDate)
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
      if (diffDays <= 7) {
        dateScore = 10
        weaknesses.push(`Available 1-7 days after your target move-in date (differs by ${diffDays} days).`)
      } else if (diffDays <= 14) {
        dateScore = 5
        weaknesses.push(`Available 8-14 days after your target move-in date (differs by ${diffDays} days).`)
      } else {
        dateScore = 0
        weaknesses.push(`Available more than 2 weeks after your target move-in date (differs by ${diffDays} days).`)
      }
    }
  } else {
    dateScore = 20 // Default fallback if dates are invalid
    strengths.push(`Timeline matching is assumed compatible.`)
  }

  // 4. Room Type & Furnishing Match (10 pts)
  const roomPreferences = Array.isArray(profile.roomPreferences) ? profile.roomPreferences : []
  const roomTypeMatches = roomPreferences.length === 0 || roomPreferences.includes(listing.roomType)
  
  // Check furnishing keyword matching in tenant bio or lifestyle preferences
  const mentionsFurnished = 
    (profile.bio || '').toLowerCase().includes('furnished') ||
    (profile.roomPreferences || []).some(p => p.toLowerCase().includes('furnished')) ||
    (profile.lifestylePreferences || []).some(l => l.toLowerCase().includes('furnished'))
  
  const furnishingCompatible = !mentionsFurnished || (mentionsFurnished && listing.furnished)

  if (roomTypeMatches && furnishingCompatible) {
    roomTypeScore = 10
    strengths.push(`Room type (${listing.roomType}) and furnishing align with your profile configuration.`)
  } else {
    roomTypeScore = 0
    if (!roomTypeMatches) {
      weaknesses.push(`Room type "${listing.roomType}" does not match your preferences (${roomPreferences.join(', ')}).`)
    }
    if (!furnishingCompatible) {
      weaknesses.push(`Listing is Unfurnished, but your profile mentions a preference for furnished properties.`)
    }
  }

  const score = budgetScore + locationScore + dateScore + roomTypeScore

  // Generate dynamic cohesive narrative explanation
  const strengthsSummary = strengths.length > 0 ? 'Budget and location preferences align nicely.' : ''
  const weaknessesSummary = weaknesses.length > 0 ? 'Timeline or budget misalignments exist.' : ''
  const explanation = `Rule-Based Evaluation: ${strengthsSummary} ${weaknessesSummary} Overall compatibility score is calculated locally at ${score}% based on room specs vs tenant settings.`

  return {
    score,
    budgetScore,
    locationScore,
    dateScore,
    roomTypeScore,
    strengths,
    weaknesses,
    explanation,
  }
}

/**
 * Evaluates compatibility and upserts to MongoDB
 * @param {string} listingId
 * @param {string} tenantProfileId
 * @returns {Promise<object>}
 */
const evaluateAndSaveCompatibility = async (listingId, tenantProfileId) => {
  // Prevent parallel duplicate calculations
  const cacheKey = `${listingId.toString()}-${tenantProfileId.toString()}`
  if (inProgressEvaluations.has(cacheKey)) {
    console.log(`[Compatibility] Score evaluation already in progress for ${cacheKey}. Skipping duplicate call.`)
    return
  }
  inProgressEvaluations.add(cacheKey)

  try {
    const listing = await Listing.findById(listingId)
    const profile = await TenantProfile.findById(tenantProfileId)

    if (!listing || !profile) return

    let score, explanation, strengths, weaknesses, budgetScore, locationScore, dateScore, roomTypeScore
    let scoringMethod = 'LLM'
    let llmProvider = null

    try {
      const result = await generateAIScore(listing, profile)
      score = result.score
      budgetScore = result.budgetScore
      locationScore = result.locationScore
      dateScore = result.dateScore
      roomTypeScore = result.roomTypeScore
      strengths = result.strengths
      weaknesses = result.weaknesses
      explanation = result.explanation
      scoringMethod = 'LLM'
      llmProvider = 'Gemini'
    } catch (aiError) {
      console.warn(`[AI Compatibility Warning] AI calculation failed, falling back to rule-based:`, aiError.message)
      const fallback = calculateRuleBasedScore(listing, profile)
      score = fallback.score
      budgetScore = fallback.budgetScore
      locationScore = fallback.locationScore
      dateScore = fallback.dateScore
      roomTypeScore = fallback.roomTypeScore
      strengths = fallback.strengths
      weaknesses = fallback.weaknesses
      explanation = fallback.explanation
      scoringMethod = 'Rule-Based'
      llmProvider = null
    }

    const compat = await Compatibility.findOneAndUpdate(
      { listing: listingId, tenantProfile: tenantProfileId },
      {
        $set: {
          // Keeping old fields for backward compatibility
          listing: listingId,
          tenantProfile: tenantProfileId,
          source: scoringMethod === 'LLM' ? 'ai' : 'rule-based',
          evaluatedAt: new Date(),

          // New fields
          listingId: listingId,
          tenantId: profile.user, // the User ID associated with the TenantProfile
          score,
          explanation,
          strengths,
          weaknesses,
          scoringBreakdown: {
            budgetScore,
            locationScore,
            dateScore,
            roomTypeScore,
          },
          llmProvider,
          scoringMethod,
        },
      },
      { upsert: true, returnDocument: 'after' }
    )
    console.log(`[Compatibility] Evaluated (${scoringMethod}) score ${score}% for Listing ${listingId} and Profile ${tenantProfileId}`)
    return compat
  } catch (error) {
    console.error(`[Compatibility Error] Failed to evaluate for Listing ${listingId} and Profile ${tenantProfileId}:`, error.message)
    throw error
  } finally {
    inProgressEvaluations.delete(cacheKey)
  }
}

/**
 * Recalculates compatibility between a profile and all active listings (sequentially to prevent rate limits)
 */
const recalculateForTenantProfile = async (tenantProfileId) => {
  try {
    const listings = await Listing.find({ isActive: true, status: 'active' })
    console.log(`[Compatibility] Recalculating score for Profile ${tenantProfileId} across ${listings.length} listings...`)
    
    for (const listing of listings) {
      try {
        await evaluateAndSaveCompatibility(listing._id, tenantProfileId)
      } catch (err) {
        console.error(`[Compatibility Recalc Error] Listing ${listing._id}:`, err.message)
      }
    }
  } catch (err) {
    console.error(`[Compatibility Recalc Profile Error] Profile ${tenantProfileId}:`, err.message)
  }
}

/**
 * Recalculates compatibility between a listing and all searching tenant profiles (sequentially to prevent rate limits)
 */
const recalculateForListing = async (listingId) => {
  try {
    const profiles = await TenantProfile.find({ isSearching: true })
    console.log(`[Compatibility] Recalculating score for Listing ${listingId} across ${profiles.length} tenant profiles...`)
    
    for (const profile of profiles) {
      try {
        await evaluateAndSaveCompatibility(listingId, profile._id)
      } catch (err) {
        console.error(`[Compatibility Recalc Error] Profile ${profile._id}:`, err.message)
      }
    }
  } catch (err) {
    console.error(`[Compatibility Recalc Listing Error] Listing ${listingId}:`, err.message)
  }
}

module.exports = {
  generateAIScore,
  calculateRuleBasedScore,
  evaluateAndSaveCompatibility,
  recalculateForTenantProfile,
  recalculateForListing,
}
