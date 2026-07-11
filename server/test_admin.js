const mongoose = require('mongoose')
const dotenv = require('dotenv')
const adminService = require('./services/adminService')

dotenv.config()

const runTest = async () => {
  console.log('[Test] Connecting to MongoDB...')
  if (!process.env.MONGO_URI) {
    console.error('MONGO_URI is missing!')
    process.exit(1)
  }

  await mongoose.connect(process.env.MONGO_URI)
  console.log('[Test] Database connected.')

  try {
    console.log('[Test] Querying Admin statistics...')
    const stats = await adminService.getStats()
    console.log('[Test] Statistics calculated successfully:')
    console.log(JSON.stringify(stats, null, 2))

    console.log('[Test] Listing Users...')
    const users = await adminService.getUsers()
    console.log(`[Test] Found ${users.length} users.`)

    console.log('[Test] Listing Listings...')
    const listings = await adminService.getListings()
    console.log(`[Test] Found ${listings.length} listings.`)

    console.log('[Test] All Admin Service queries passed successfully!')
  } catch (err) {
    console.error('[Test Error] Query failed:', err.message)
  } finally {
    await mongoose.disconnect()
    console.log('[Test] Database disconnected.')
  }
}

runTest()
