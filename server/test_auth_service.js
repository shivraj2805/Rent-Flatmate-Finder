const mongoose = require('mongoose')
const dotenv = require('dotenv')
const path = require('path')

// Load environment variables
dotenv.config()

const authService = require('./services/authService')
const User = require('./models/User')

async function runTests() {
  console.log('--- Starting Auth Service Tests ---')
  const mongoUri = process.env.MONGO_URI
  if (!mongoUri) {
    console.error('Error: MONGO_URI is not defined in server/.env.')
    process.exit(1)
  }

  try {
    await mongoose.connect(mongoUri)
    console.log('Connected to MongoDB successfully.')

    const testEmail = 'test_runner_unique@example.com'
    await User.deleteMany({ email: testEmail })
    console.log('Cleaned up previous test users.')

    // Test 1: Successful Registration
    console.log('\nTest 1: Registering new user...')
    const regResult = await authService.register({
      name: 'Test Runner',
      email: testEmail,
      password: 'SecurePassword123',
      role: 'tenant',
    })
    console.log('✓ Registration successful!')
    console.log('Token generated:', regResult.token ? 'Yes' : 'No')
    console.log('User response:', JSON.stringify(regResult.user))

    // Test 2: Duplicate Registration (Should fail)
    console.log('\nTest 2: Registering duplicate user...')
    try {
      await authService.register({
        name: 'Test Runner Dup',
        email: testEmail,
        password: 'SecurePassword123',
        role: 'tenant',
      })
      console.error('✗ Test failed: Duplicate registration should have thrown an error.')
    } catch (err) {
      if (err.statusCode === 409) {
        console.log('✓ Correctly failed with status 409:', err.message)
      } else {
        console.error('✗ Failed with unexpected error:', err.message)
      }
    }

    // Test 3: Successful Login
    console.log('\nTest 3: Logging in with valid credentials...')
    const loginResult = await authService.login({
      email: testEmail,
      password: 'SecurePassword123',
    })
    console.log('✓ Login successful!')
    console.log('Token generated:', loginResult.token ? 'Yes' : 'No')
    console.log('User response:', JSON.stringify(loginResult.user))

    // Test 4: Login with Invalid Password
    console.log('\nTest 4: Logging in with invalid password...')
    try {
      await authService.login({
        email: testEmail,
        password: 'WrongPassword123',
      })
      console.error('✗ Test failed: Login with invalid password should have failed.')
    } catch (err) {
      if (err.statusCode === 401) {
        console.log('✓ Correctly failed with status 401:', err.message)
      } else {
        console.error('✗ Failed with unexpected error:', err.message)
      }
    }

    // Test 5: Get User Profile
    console.log('\nTest 5: Retrieving user profile...')
    const profile = await authService.getUserById(regResult.user.id)
    console.log('✓ Profile retrieved successfully!')
    console.log('Profile:', JSON.stringify(profile))

    // Clean up
    await User.deleteMany({ email: testEmail })
    console.log('\nCleaned up test data.')
    console.log('\n--- All Auth Service Tests Passed successfully! ---')

  } catch (error) {
    console.error('Test suite failed with error:', error)
  } finally {
    await mongoose.disconnect()
    console.log('Disconnected from MongoDB.')
  }
}

runTests()
