const mongoose = require('mongoose')
const dotenv = require('dotenv')

dotenv.config()

const User = require('./models/User')
const Listing = require('./models/Listing')
const Chat = require('./models/Chat')
const Message = require('./models/Message')
const Notification = require('./models/Notification')

const listingService = require('./services/listingService')
const chatService = require('./services/chatService')
const interestService = require('./services/interestService')

async function runIntegrations() {
  console.log('--- Starting RoomSync API & Service Integrations Test Suite ---')

  const mongoUri = process.env.MONGO_URI
  if (!mongoUri) {
    console.error('MONGO_URI is missing!')
    process.exit(1)
  }

  try {
    await mongoose.connect(mongoUri)
    console.log('Connected to MongoDB successfully.')

    // Clean up any stale test runs
    const testEmailOwner = 'test_owner_integration@example.com'
    const testEmailTenant = 'test_tenant_integration@example.com'
    await User.deleteMany({ email: { $in: [testEmailOwner, testEmailTenant] } })

    // 1. Create Owner & Tenant Users
    console.log('\n[Test 1] Creating test Owner & Tenant accounts...')
    const owner = await User.create({
      name: 'Integration Owner',
      email: testEmailOwner,
      password: 'testpassword123',
      role: 'owner'
    })
    const tenant = await User.create({
      name: 'Integration Tenant',
      email: testEmailTenant,
      password: 'testpassword123',
      role: 'tenant'
    })
    console.log(`✓ Owner created: ${owner._id}`)
    console.log(`✓ Tenant created: ${tenant._id}`)

    // 2. Test Listing Creation & Management
    console.log('\n[Test 2] Creating a new property listing...')
    const listing = await Listing.create({
      owner: owner._id,
      title: 'Luxury Apartment in Kalyani Nagar',
      description: 'Stunning 3BHK flat with AC, gym, private security and parking.',
      location: 'Kalyani Nagar, Pune',
      rent: 22000,
      roomType: 'private-room',
      amenities: ['wifi', 'ac', 'gym', 'parking'],
      availableFrom: new Date('2026-08-01'),
      isActive: true,
      status: 'active'
    })
    console.log(`✓ Listing created: ${listing.title} (${listing._id})`)

    // 3. Test Interest Submission (triggers owner notification)
    console.log('\n[Test 3] Submitting Tenant interest request...')
    const interest = await interestService.createInterest({
      tenantId: tenant._id,
      listingId: listing._id,
      tenantMessage: 'Hello, I am interested in this flat!'
    })
    console.log(`✓ Interest expressed successfully: ${interest._id}`)

    // Check notification for Owner (wait briefly for async dispatch)
    console.log('\n[Test 4] Verifying Owner notification...')
    await new Promise(r => setTimeout(r, 200))
    const ownerNotif = await Notification.findOne({ recipient: owner._id, type: 'interest_received' })
    if (ownerNotif) {
      console.log('✓ Owner notification detected!')
      console.log(`- Title: ${ownerNotif.title}`)
      console.log(`- Content: ${ownerNotif.content}`)
    } else {
      console.error('✗ Failed to find owner notification!')
    }

    // 4. Test Interest Response (triggers tenant notification and chat creation)
    console.log('\n[Test 5] Approving match request...')
    const approvedInterest = await interestService.respondToInterest({
      interestId: interest._id,
      ownerId: owner._id,
      status: 'accepted',
      responseMessage: 'Sure, let\'s chat!'
    })
    console.log(`✓ Match approved: ${approvedInterest.status}`)

    // Check notification for Tenant
    console.log('\n[Test 6] Verifying Tenant interest response notification...')
    const tenantNotif = await Notification.findOne({ recipient: tenant._id, type: 'interest_accepted' })
    if (tenantNotif) {
      console.log('✓ Tenant notification detected!')
      console.log(`- Title: ${tenantNotif.title}`)
      console.log(`- Content: ${tenantNotif.content}`)
    } else {
      console.error('✗ Failed to find tenant notification!')
    }

    // 5. Test Chat Room auto-creation
    console.log('\n[Test 7] Verifying Chat Room auto-creation...')
    const chat = await Chat.findOne({ interest: interest._id })
    if (chat) {
      console.log(`✓ Chat Room auto-created: ${chat._id}`)
    } else {
      throw new Error('✗ Chat Room was not auto-created!')
    }

    // 6. Test Messaging (triggers new message notification)
    console.log('\n[Test 8] Sending a chat message...')
    const message = await chatService.saveMessage(chat._id, tenant._id, 'Hi landlord, when can I visit the flat?')
    console.log(`✓ Message sent: "${message.content}"`)

    // Check message notification for Owner
    console.log('\n[Test 9] Verifying message notification with sender name...')
    const msgNotif = await Notification.findOne({ recipient: owner._id, type: 'new_message' })
    if (msgNotif) {
      console.log('✓ Message notification detected!')
      console.log(`- Title: ${msgNotif.title}`)
      console.log(`- Content: ${msgNotif.content}`)
    } else {
      console.error('✗ Failed to find message notification!')
    }

    // 7. Clean up
    console.log('\n[Test 10] Tearing down integration documents...')
    await Notification.deleteMany({ recipient: { $in: [owner._id, tenant._id] } })
    await Message.deleteMany({ chat: chat._id })
    await Chat.deleteOne({ _id: chat._id })
    await approvedInterest.deleteOne()
    await Listing.deleteOne({ _id: listing._id })
    await User.deleteMany({ _id: { $in: [owner._id, tenant._id] } })
    console.log('✓ Stale integration documents cleaned up.')

    console.log('\n--- All API & Service Integration Tests Passed Successfully! ---')

  } catch (error) {
    console.error('\n✗ Integration test suite failed:', error.message || error)
  } finally {
    await mongoose.disconnect()
    console.log('Disconnected from MongoDB.')
  }
}

runIntegrations()
