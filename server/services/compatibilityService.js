const Compatibility = require('../models/Compatibility')
const Listing = require('../models/Listing')
const TenantProfile = require('../models/TenantProfile')

/**
 * Generate AI score using Google Gemini API (gemini-1.5-flash)
 * @param {object} listing - Listing Mongoose document
 * @param {object} profile - TenantProfile Mongoose document
 * @returns {Promise<{score: number, explanation: string}>}
 */
const generateAIScore = async (listing, profile) => {
  const apiKey = process.env.GEMINI_API_KEY
  if (!apiKey) {
    throw new Error('GEMINI_API_KEY environment variable is missing.')
  }

  const promptText = `
You are an expert real estate matching assistant. Calculate a compatibility score (0 to 100) and provide a concise explanation (max 2-3 sentences) indicating how well a tenant's preferences match a listed room.

Room Listing details:
- Location: ${listing.location}
- Monthly Rent: ₹${listing.rent}
- Available Date: ${listing.availableFrom}
- Room Type: ${listing.roomType}

Tenant Profile details:
- Preferred Locations: ${profile.preferredLocations.join(', ')}
- Budget Range: ₹${profile.budgetRange.min} to ₹${profile.budgetRange.max}
- Target Move-in Date: ${profile.moveInDate}

Evaluation criteria:
1. Budget Match: Rent should ideally fall within the budget range.
2. Location Match: Listing location should match or be close to the tenant's preferred locations.
3. Move-in Date Match: Listing available date should be near or before the tenant's target move-in date.

Return ONLY a JSON object with this exact structure:
{
  "score": <integer score from 0 to 100>,
  "explanation": "<concise explanation detail>"
}
`

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
    const parsed = JSON.parse(textContent.trim())
    return {
      score: Math.min(100, Math.max(0, Number(parsed.score) || 0)),
      explanation: String(parsed.explanation || 'No explanation provided').trim(),
    }
  } catch (err) {
    throw new Error(`Failed to parse Gemini response as JSON: ${textContent}`)
  }
}

/**
 * Rule-based fallback compatibility score calculation
 * @param {object} listing
 * @param {object} profile
 * @returns {{score: number, explanation: string}}
 */
const calculateRuleBasedScore = (listing, profile) => {
  let budgetScore = 0
  let locationScore = 0
  let dateScore = 0

  // 1. Budget Match (40 pts)
  const rent = Number(listing.rent) || 0
  const minBudget = Number(profile.budgetRange?.min) || 0
  const maxBudget = Number(profile.budgetRange?.max) || 0

  if (rent >= minBudget && rent <= maxBudget) {
    budgetScore = 40
  } else if (rent < minBudget) {
    budgetScore = 40 // Cheaper is good
  } else if (maxBudget > 0) {
    const overage = rent - maxBudget
    const pctOverage = overage / maxBudget
    budgetScore = Math.max(0, 40 - Math.round(pctOverage * 40))
  }

  // 2. Location Match (40 pts)
  const listingLoc = (listing.location || '').toLowerCase()
  const preferredLocs = Array.isArray(profile.preferredLocations) ? profile.preferredLocations : []
  const hasLocationMatch = preferredLocs.some((loc) => {
    const cleanLoc = String(loc).toLowerCase().trim()
    return cleanLoc && (listingLoc.includes(cleanLoc) || cleanLoc.includes(listingLoc))
  })

  if (hasLocationMatch) {
    locationScore = 40
  }

  // 3. Move-in Date Match (20 pts)
  const availableDate = new Date(listing.availableFrom)
  const targetDate = new Date(profile.moveInDate)

  if (!isNaN(availableDate.getTime()) && !isNaN(targetDate.getTime())) {
    if (availableDate <= targetDate) {
      dateScore = 20
    } else {
      const diffTime = Math.abs(availableDate - targetDate)
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
      if (diffDays <= 7) {
        dateScore = 10
      } else if (diffDays <= 14) {
        dateScore = 5
      } else {
        dateScore = 0
      }
    }
  } else {
    dateScore = 20 // Fallback if dates are invalid
  }

  const score = budgetScore + locationScore + dateScore
  
  // Explanation text
  const matchDetails = []
  if (rent <= maxBudget) {
    matchDetails.push(`Rent of ₹${rent.toLocaleString()} fits your budget range (up to ₹${maxBudget.toLocaleString()}).`)
  } else {
    matchDetails.push(`Rent of ₹${rent.toLocaleString()} exceeds your maximum budget of ₹${maxBudget.toLocaleString()}.`)
  }

  if (hasLocationMatch) {
    matchDetails.push(`Listing location is in your preferred areas.`)
  } else {
    matchDetails.push(`Listing location is outside your preferred areas.`)
  }

  if (!isNaN(availableDate.getTime()) && !isNaN(targetDate.getTime())) {
    if (availableDate <= targetDate) {
      matchDetails.push(`Available on time (listed from ${availableDate.toLocaleDateString('en-IN')}).`)
    } else {
      const diffDays = Math.ceil(Math.abs(availableDate - targetDate) / (1000 * 60 * 60 * 24))
      matchDetails.push(`Available ${diffDays} days after your target move-in date.`)
    }
  }

  const explanation = `Rule-Based Evaluation: ${matchDetails.join(' ')}`

  return {
    score,
    explanation,
  }
}

/**
 * Evaluates compatibility and upserts to MongoDB
 */
const evaluateAndSaveCompatibility = async (listingId, tenantProfileId) => {
  try {
    const listing = await Listing.findById(listingId)
    const profile = await TenantProfile.findById(tenantProfileId)

    if (!listing || !profile) return

    let score, explanation, source
    try {
      const result = await generateAIScore(listing, profile)
      score = result.score
      explanation = result.explanation
      source = 'ai'
    } catch (aiError) {
      console.warn(`[AI Compatibility Warning] AI calculation failed, falling back to rule-based:`, aiError.message)
      const fallback = calculateRuleBasedScore(listing, profile)
      score = fallback.score
      explanation = fallback.explanation
      source = 'rule-based'
    }

    const compat = await Compatibility.findOneAndUpdate(
      { listing: listingId, tenantProfile: tenantProfileId },
      {
        $set: {
          score,
          explanation,
          source,
          evaluatedAt: new Date(),
        },
      },
      { upsert: true, returnDocument: 'after' }
    )
    console.log(`[Compatibility] Evaluated ${source} score ${score}% for Listing ${listingId} and Profile ${tenantProfileId}`)
    return compat
  } catch (error) {
    console.error(`[Compatibility Error] Failed to evaluate for Listing ${listingId} and Profile ${tenantProfileId}:`, error.message)
    throw error
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
        // Log individual errors but continue evaluating other listings
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
        // Log individual errors but continue evaluating other profiles
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
