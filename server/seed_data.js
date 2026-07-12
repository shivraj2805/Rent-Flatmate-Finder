const mongoose = require('mongoose')
const dotenv = require('dotenv')
const bcrypt = require('bcryptjs')

dotenv.config()

const User = require('./models/User')
const Listing = require('./models/Listing')
const TenantProfile = require('./models/TenantProfile')
const Compatibility = require('./models/Compatibility')
const Chat = require('./models/Chat')
const Message = require('./models/Message')
const Notification = require('./models/Notification')

const seedDatabase = async () => {
  console.log('[Seeder] Connecting to database...')
  const mongoUri = process.env.MONGO_URI
  if (!mongoUri) {
    console.error('MONGO_URI is missing!')
    process.exit(1)
  }

  try {
    await mongoose.connect(mongoUri)
    console.log('[Seeder] Connected successfully.')

    // List of emails to clean up
    const emails = [
      'rohan.mehta@example.com',
      'priya.sharma@example.com',
      'amit.patel@example.com',
      'neha.joshi@example.com',
      'vikram.singh@example.com',
      'ananya.roy@example.com',
      'rahul.deshmukh@example.com'
    ]

    console.log('[Seeder] Cleaning up stale dummy accounts...')
    const staleUsers = await User.find({ email: { $in: emails } })
    const staleUserIds = staleUsers.map(u => u._id)

    // Remove listings, profiles, chats, compatibility, and users
    await Listing.deleteMany({ owner: { $in: staleUserIds } })
    await TenantProfile.deleteMany({ user: { $in: staleUserIds } })
    await Compatibility.deleteMany({ tenantProfile: { $in: staleUserIds } })
    await Chat.deleteMany({ $or: [{ owner: { $in: staleUserIds } }, { tenant: { $in: staleUserIds } }] })
    await Notification.deleteMany({ recipient: { $in: staleUserIds } })
    await User.deleteMany({ email: { $in: emails } })
    console.log('[Seeder] Cleanup complete.')

    const passwordHash = await bcrypt.hash('password123', 12)

    // 1. Create Owners
    console.log('[Seeder] Creating dummy Owners...')
    const rohan = await User.create({
      name: 'Rohan Mehta',
      email: 'rohan.mehta@example.com',
      password: passwordHash,
      role: 'owner',
      avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150'
    })
    const priya = await User.create({
      name: 'Priya Sharma',
      email: 'priya.sharma@example.com',
      password: passwordHash,
      role: 'owner',
      avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150'
    })
    const amit = await User.create({
      name: 'Amit Patel',
      email: 'amit.patel@example.com',
      password: passwordHash,
      role: 'owner',
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150'
    })
    const neha = await User.create({
      name: 'Neha Joshi',
      email: 'neha.joshi@example.com',
      password: passwordHash,
      role: 'owner',
      avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150'
    })
    console.log('✓ Created 4 Owners.')

    // 2. Create Listings in Pune
    console.log('[Seeder] Creating Listings in Pune...')
    const listing1 = await Listing.create({
      owner: rohan._id,
      title: 'Modern 1BHK Apartment in Koregaon Park',
      description: 'Well-ventilated, newly painted 1BHK in Lane 5 Koregaon Park. Close to Starbucks, popular restaurants, and public parks. Fully furnished with modular kitchen, double bed, smart TV, and 24/7 water supply.',
      location: 'Lane 5, Koregaon Park, Pune',
      rent: 18000,
      roomType: 'apartment',
      genderPreference: 'any',
      furnished: true,
      availableFrom: new Date('2026-08-01'),
      amenities: ['wifi', 'ac', 'parking', 'kitchen', 'washing-machine'],
      images: [
        { url: 'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=800', publicId: 'dummy_pk_1' },
        { url: 'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=800', publicId: 'dummy_pk_2' }
      ]
    })

    const listing2 = await Listing.create({
      owner: priya._id,
      title: 'Cozy Private Room in Kalyani Nagar',
      description: 'Looking for a female flatmate to share a spacious 2BHK flat. Private bedroom with attached bathroom and balcony. Shared living room and kitchen. Located in a premium gated society with high security.',
      location: 'Kalyani Nagar, Pune',
      rent: 12000,
      roomType: 'private-room',
      genderPreference: 'female',
      furnished: true,
      availableFrom: new Date('2026-07-20'),
      amenities: ['wifi', 'kitchen', 'balcony', 'gym', 'parking'],
      images: [
        { url: 'https://images.unsplash.com/photo-1598928506311-c55ded91a20c?w=800', publicId: 'dummy_kn_1' }
      ]
    })

    const listing3 = await Listing.create({
      owner: amit._id,
      title: 'Premium Studio Flat near Viman Nagar',
      description: 'Beautiful, self-contained studio flat near Phoenix Marketcity, Viman Nagar. Rent is inclusive of society maintenance and WiFi. Perfect for students or working professionals seeking absolute privacy.',
      location: 'Near Datta Mandir Chowk, Viman Nagar, Pune',
      rent: 15500,
      roomType: 'studio',
      genderPreference: 'any',
      furnished: true,
      availableFrom: new Date('2026-08-15'),
      amenities: ['wifi', 'ac', 'gym', 'washing-machine', 'parking'],
      images: [
        { url: 'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=800', publicId: 'dummy_vn_1' }
      ]
    })

    const listing4 = await Listing.create({
      owner: neha._id,
      title: 'Spacious Shared Flat in Hinjewadi Phase 1',
      description: 'Shared room option in a double occupancy master bedroom. Walking distance from major IT companies in Hinjewadi Phase 1. Highly affordable flat with dynamic amenities, 24/7 security and housekeeping service.',
      location: 'Hinjewadi Phase 1, Pune',
      rent: 8500,
      roomType: 'shared-room',
      genderPreference: 'female',
      furnished: false,
      availableFrom: new Date('2026-08-01'),
      amenities: ['wifi', 'parking', 'gym', 'kitchen'],
      images: [
        { url: 'https://images.unsplash.com/photo-1505691938895-1758d7feb511?w=800', publicId: 'dummy_hj_1' }
      ]
    })
    console.log('✓ Created 4 Pune Listings.')

    // 3. Create Tenants & Profiles
    console.log('[Seeder] Creating dummy Tenants & Profiles...')
    
    // Tenant 1
    const vikram = await User.create({
      name: 'Vikram Singh',
      email: 'vikram.singh@example.com',
      password: passwordHash,
      role: 'tenant',
      avatar: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=150'
    })
    await TenantProfile.create({
      user: vikram._id,
      preferredLocations: ['Koregaon Park', 'Viman Nagar'],
      budgetRange: { min: 14000, max: 20000, currency: 'INR' },
      moveInDate: new Date('2026-08-01'),
      roomPreferences: ['studio', 'apartment'],
      lifestylePreferences: ['clean', 'quiet', 'vegetarian'],
      bio: 'Software development engineer working at Kalyani Nagar. Looking for a neat 1BHK or studio apartment with high-speed internet and parking space. Mostly quiet during weekdays.',
      gender: 'male',
      isSearching: true
    })

    // Tenant 2
    const ananya = await User.create({
      name: 'Ananya Roy',
      email: 'ananya.roy@example.com',
      password: passwordHash,
      role: 'tenant',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150'
    })
    await TenantProfile.create({
      user: ananya._id,
      preferredLocations: ['Kalyani Nagar', 'Viman Nagar', 'Koregaon Park'],
      budgetRange: { min: 10000, max: 16000, currency: 'INR' },
      moveInDate: new Date('2026-07-25'),
      roomPreferences: ['private-room', 'studio'],
      lifestylePreferences: ['social', 'pet-friendly', 'non-smoker'],
      bio: 'Creative UI/UX designer. Enjoys painting and listening to music. Looking for a private bedroom in a friendly flatshare with chill, like-minded housemates.',
      gender: 'female',
      isSearching: true
    })

    // Tenant 3
    const rahul = await User.create({
      name: 'Rahul Deshmukh',
      email: 'rahul.deshmukh@example.com',
      password: passwordHash,
      role: 'tenant',
      avatar: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=150'
    })
    await TenantProfile.create({
      user: rahul._id,
      preferredLocations: ['Hinjewadi Phase 1'],
      budgetRange: { min: 7000, max: 11000, currency: 'INR' },
      moveInDate: new Date('2026-08-05'),
      roomPreferences: ['shared-room', 'private-room'],
      lifestylePreferences: ['quiet', 'non-smoker', 'clean'],
      bio: 'Recent graduate starting an associate consulting role in Hinjewadi. Very organized, clean, and cooperative. Prefers shared flat setups near my office to save commute time.',
      gender: 'male',
      isSearching: true
    })

    console.log('✓ Created 3 Tenants and complete Profiles.')

    console.log('\n--- Database Seeding Completed Successfully! ---')

  } catch (error) {
    console.error('[Seeder Error] Failed to seed database:', error.message || error)
  } finally {
    await mongoose.disconnect()
    console.log('[Seeder] Disconnected from MongoDB.')
  }
}

seedDatabase()
