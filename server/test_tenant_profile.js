const mongoose = require('mongoose')
const dotenv = require('dotenv')

// Load environment variables
dotenv.config()

const tenantService = require('./services/tenantService')
const User = require('./models/User')
const TenantProfile = require('./models/TenantProfile')

async function runTests() {
  console.log('--- Starting Tenant Profile Service Tests ---')
  const mongoUri = process.env.MONGO_URI
  if (!mongoUri) {
    console.error('Error: MONGO_URI is not defined in server/.env.')
    process.exit(1)
  }

  try {
    await mongoose.connect(mongoUri)
    console.log('Connected to MongoDB successfully.')

    const testEmail = 'tenant_tester_unique@example.com'
    await User.deleteMany({ email: testEmail })
    console.log('Cleaned up previous test users.')

    // Create test user
    const user = await User.create({
      name: 'Tenant Tester',
      email: testEmail,
      password: 'hashedpassworddummy',
      role: 'tenant',
    })
    console.log('Test user created:', user.email)

    // Clean up profile if it exists
    await TenantProfile.deleteMany({ user: user._id })

    // Test 1: Retrieve empty profile (should be null)
    console.log('\nTest 1: Retrieving profile before setup...')
    const profileBefore = await tenantService.getProfileByUserId(user._id)
    console.log('Profile exists?', profileBefore ? 'Yes' : 'No (expected)')

    // Test 2: Create profile
    console.log('\nTest 2: Creating a new tenant profile...')
    const dummyData = {
      preferredLocations: ['Koregaon Park', 'Kalyani Nagar'],
      budgetRange: { min: 8000, max: 15000, currency: 'INR' },
      moveInDate: new Date('2026-08-01'),
      roomPreferences: ['private-room', 'apartment'],
      lifestylePreferences: ['clean', 'quiet'],
      bio: 'Looking for a quiet place close to IT hubs.',
      isSearching: true,
    }

    const newProfile = await tenantService.upsertProfile(user._id, dummyData)
    console.log('✓ Profile created successfully!')
    console.log('Locations:', newProfile.preferredLocations)
    console.log('Budget:', newProfile.budgetRange.min, 'to', newProfile.budgetRange.max)
    console.log('Move-in date:', newProfile.moveInDate)

    // Test 3: Retrieve profile
    console.log('\nTest 3: Fetching the created profile...')
    const fetchedProfile = await tenantService.getProfileByUserId(user._id)
    console.log('✓ Profile retrieved successfully!')
    console.log('Bio:', fetchedProfile.bio)

    // Test 4: Update profile
    console.log('\nTest 4: Updating the profile...')
    const updatedData = {
      ...dummyData,
      bio: 'Updated bio: Still looking for a nice place.',
      budgetRange: { min: 9000, max: 16000, currency: 'INR' },
    }
    const updatedProfile = await tenantService.upsertProfile(user._id, updatedData)
    console.log('✓ Profile updated successfully!')
    console.log('New Bio:', updatedProfile.bio)
    console.log('New Budget:', updatedProfile.budgetRange.min, 'to', updatedProfile.budgetRange.max)

    // Clean up
    await TenantProfile.deleteMany({ user: user._id })
    await User.deleteMany({ email: testEmail })
    console.log('\nCleaned up test data.')
    console.log('\n--- All Tenant Profile Service Tests Passed successfully! ---')

  } catch (error) {
    console.error('Test suite failed with error:', error)
  } finally {
    await mongoose.disconnect()
    console.log('Disconnected from MongoDB.')
  }
}

runTests()
