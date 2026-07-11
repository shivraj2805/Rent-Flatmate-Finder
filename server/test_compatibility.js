const mongoose = require('mongoose')
const dotenv = require('dotenv')

// Load environment variables
dotenv.config()

const compatibilityService = require('./services/compatibilityService')
const Listing = require('./models/Listing')
const TenantProfile = require('./models/TenantProfile')
const User = require('./models/User')
const Compatibility = require('./models/Compatibility')

async function runTests() {
  console.log('--- Starting Gemini AI Compatibility Service Tests ---')
  
  const apiKey = process.env.GEMINI_API_KEY
  if (!apiKey) {
    console.error('Error: GEMINI_API_KEY is not defined in server/.env.')
    console.log('Please add your Gemini API key in the format: GEMINI_API_KEY=your_key_here')
    process.exit(1)
  }

  const mongoUri = process.env.MONGO_URI
  if (!mongoUri) {
    console.error('Error: MONGO_URI is not defined in server/.env.')
    process.exit(1)
  }

  try {
    await mongoose.connect(mongoUri)
    console.log('Connected to MongoDB successfully.')

    // 1. Create dummy documents
    const dummyOwner = await User.create({
      name: 'Owner Tester',
      email: 'owner_tester_unique_ai@example.com',
      password: 'dummy_hash_value',
      role: 'owner',
    })

    const dummyTenant = await User.create({
      name: 'Tenant Tester',
      email: 'tenant_tester_unique_ai@example.com',
      password: 'dummy_hash_value',
      role: 'tenant',
    })

    const dummyListing = await Listing.create({
      owner: dummyOwner._id,
      title: 'Beautiful Studio near Koregaon Park',
      description: 'Fully furnished, high-speed WiFi, spacious balcony, close to IT parks and cafes.',
      location: 'Koregaon Park, Pune',
      rent: 14000,
      availableFrom: new Date('2026-08-01'),
      roomType: 'studio',
      amenities: ['wifi', 'ac', 'balcony'],
      images: [{ url: 'http://example.com/img.jpg', publicId: 'dummy_public_id' }],
    })

    const dummyProfile = await TenantProfile.create({
      user: dummyTenant._id,
      preferredLocations: ['Koregaon Park', 'Kalyani Nagar'],
      budgetRange: { min: 10000, max: 15000, currency: 'INR' },
      moveInDate: new Date('2026-08-01'),
      roomPreferences: ['studio', 'private-room'],
      lifestylePreferences: ['clean', 'quiet'],
      bio: 'Professional looking for a quiet studio in Koregaon Park.',
    })

    console.log('✓ Created dummy Listing and TenantProfile documents.')

    // 2. Test generateAIScore directly
    console.log('\nTest 2: Calling Google Gemini API (gemini-1.5-flash)...')
    const result = await compatibilityService.generateAIScore(dummyListing, dummyProfile)
    console.log('✓ Gemini API response received!')
    console.log('Score:', result.score)
    console.log('Explanation:', result.explanation)

    // 3. Test evaluateAndSaveCompatibility
    console.log('\nTest 3: Evaluating and saving to Compatibility collection...')
    const savedCompat = await compatibilityService.evaluateAndSaveCompatibility(dummyListing._id, dummyProfile._id)
    console.log('✓ Saved Compatibility details:')
    console.log('- Listing ID:', savedCompat.listing)
    console.log('- TenantProfile ID:', savedCompat.tenantProfile)
    console.log('- Score:', savedCompat.score)
    console.log('- Explanation:', savedCompat.explanation)
    console.log('- Source:', savedCompat.source)

    // 4. Clean up
    await Compatibility.deleteOne({ _id: savedCompat._id })
    await TenantProfile.deleteOne({ _id: dummyProfile._id })
    await Listing.deleteOne({ _id: dummyListing._id })
    await User.deleteMany({ _id: { $in: [dummyOwner._id, dummyTenant._id] } })
    console.log('\n✓ Cleaned up all test documents.')
    console.log('\n--- Gemini AI Compatibility Service Tests Completed Successfully! ---')

  } catch (error) {
    console.error('Test suite failed with error:', error)
  } finally {
    await mongoose.disconnect()
    console.log('Disconnected from MongoDB.')
  }
}

runTests()
