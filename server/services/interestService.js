const Interest = require('../models/Interest')
const Listing = require('../models/Listing')
const TenantProfile = require('../models/TenantProfile')
const { recordActivity } = require('./activityLogService')

const createError = (message, statusCode) => {
  const error = new Error(message)
  error.statusCode = statusCode
  return error
}

/**
 * Express interest in a listing
 */
const createInterest = async ({ tenantId, listingId, tenantMessage }) => {
  // Find the listing
  const listing = await Listing.findById(listingId)
  if (!listing) {
    throw createError('Listing not found', 404)
  }

  if (!listing.isActive || listing.status === 'filled') {
    throw createError('This listing is no longer active or has been filled', 400)
  }

  // Ensure owner is not the tenant
  if (listing.owner.toString() === tenantId.toString()) {
    throw createError('You cannot express interest in your own listing', 400)
  }

  // Check for duplicate interest
  const existingInterest = await Interest.findOne({ tenant: tenantId, listing: listingId })
  if (existingInterest) {
    throw createError('You have already expressed interest in this listing', 409)
  }

  const profile = await TenantProfile.findOne({ user: tenantId })
  if (!profile) {
    throw createError('Please create a tenant profile before expressing interest', 400)
  }

  // Validate gender matching if listing has gender preference
  if (listing.genderPreference && listing.genderPreference !== 'any') {
    if (profile.gender !== listing.genderPreference) {
      throw createError(`This room has a gender preference of ${listing.genderPreference}. Your profile gender (${profile.gender}) does not match.`, 400)
    }
  }

  // Create interest request
  const interest = await Interest.create({
    tenant: tenantId,
    listing: listingId,
    owner: listing.owner,
    tenantMessage: tenantMessage ? tenantMessage.trim() : '',
    status: 'pending',
  })

  // Trigger notification for listing owner
  const Notification = require('../models/Notification')
  const User = require('../models/User')
  const tenantUser = await User.findById(tenantId)
  const tenantName = tenantUser ? tenantUser.name : 'A tenant'

  Notification.create({
    recipient: listing.owner,
    sender: tenantId,
    type: 'interest_received',
    title: `Interest from ${tenantName}`,
    content: `${tenantName} has expressed interest in your listing: "${listing.title}"`,
    link: '/dashboard/owner/interests',
  }).catch(() => {})

  // Trigger high compatibility email notification to owner if score is above 80
  try {
    const Compatibility = require('../models/Compatibility')
    let compatibility = await Compatibility.findOne({ listing: listingId, tenantProfile: profile._id })

    // If not calculated yet, run calculation
    if (!compatibility) {
      const { evaluateAndSaveCompatibility } = require('./compatibilityService')
      compatibility = await evaluateAndSaveCompatibility(listingId, profile._id)
    }

    if (compatibility && compatibility.score > 80) {
      const emailService = require('./emailService')
      const ownerUser = await User.findById(listing.owner)
      if (ownerUser && tenantUser) {
        emailService.sendHighCompatibilityEmail(ownerUser, tenantUser, listing, compatibility.score, compatibility.explanation).catch((err) => {
          console.error(`[Interest High Compatibility Email Error] Async send failed:`, err.message)
        })
      }
    }
  } catch (err) {
    console.error(`[Interest High Compatibility Email Error] Setup failed:`, err.message)
  }

  return interest
}

/**
 * Get interests sent by a tenant
 */
const getInterestsByTenant = async (tenantId) => {
  const interests = await Interest.find({ tenant: tenantId })
    .populate('listing', 'title rent location images isActive status roomType')
    .populate('owner', 'name email avatar')
    .sort({ createdAt: -1 })

  const tenantProfile = await TenantProfile.findOne({ user: tenantId })
  if (!tenantProfile) return interests

  const Compatibility = require('../models/Compatibility')
  const enrichedInterests = await Promise.all(
    interests.map(async (interest) => {
      const plainInterest = interest.toObject()
      const compatibility = await Compatibility.findOne({
        listing: interest.listing._id,
        tenantProfile: tenantProfile._id,
      })
      plainInterest.compatibility = compatibility || null
      return plainInterest
    })
  )

  return enrichedInterests
}

/**
 * Get interests received by an owner (plus populating tenant profile details)
 */
const getInterestsByOwner = async (ownerId) => {
  const interests = await Interest.find({ owner: ownerId })
    .populate('listing', 'title rent location images isActive status')
    .populate('tenant', 'name email avatar')
    .sort({ createdAt: -1 })

  // Populate the TenantProfile for each interest's tenant
  const enrichedInterests = await Promise.all(
    interests.map(async (interest) => {
      const plainInterest = interest.toObject()
      if (interest.tenant) {
        const tenantProfile = await TenantProfile.findOne({ user: interest.tenant._id })
        plainInterest.tenantProfile = tenantProfile || null
        if (tenantProfile) {
          const Compatibility = require('../models/Compatibility')
          const compatibility = await Compatibility.findOne({
            listing: interest.listing._id,
            tenantProfile: tenantProfile._id,
          })
          plainInterest.compatibility = compatibility || null
        } else {
          plainInterest.compatibility = null
        }
      } else {
        plainInterest.tenantProfile = null
        plainInterest.compatibility = null
      }
      return plainInterest
    })
  )

  return enrichedInterests
}

/**
 * Owner responds to an interest request
 */
const respondToInterest = async ({ interestId, ownerId, status, responseMessage }) => {
  if (!['accepted', 'declined'].includes(status)) {
    throw createError('Status must be either accepted or declined', 400)
  }

  const interest = await Interest.findById(interestId)
  if (!interest) {
    throw createError('Interest request not found', 404)
  }

  // Ensure logged in user is the owner of the listing
  if (interest.owner.toString() !== ownerId.toString()) {
    throw createError('Not authorized to respond to this interest request', 403)
  }

  interest.status = status
  interest.ownerResponseMessage = responseMessage ? responseMessage.trim() : ''
  interest.respondedAt = new Date()

  const savedInterest = await interest.save()

  // Trigger notification for tenant
  const Notification = require('../models/Notification')
  const User = require('../models/User')
  const ownerUser = await User.findById(ownerId)
  const ownerName = ownerUser ? ownerUser.name : 'The landlord'

  const Listing = require('../models/Listing')
  const listingObj = await Listing.findById(interest.listing)
  const listingTitle = listingObj ? listingObj.title : 'property listing'

  Notification.create({
    recipient: interest.tenant,
    sender: ownerId,
    type: status === 'accepted' ? 'interest_accepted' : 'interest_declined',
    title: status === 'accepted' ? 'Match Request Approved!' : 'Match Request Declined',
    content: `${ownerName} has ${status} your interest request for "${listingTitle}"`,
    link: status === 'accepted' ? '/dashboard/tenant/chats' : '/dashboard/tenant/interests',
  }).catch(() => {})

  if (status === 'accepted') {
    const Chat = require('../models/Chat')
    await Chat.findOneAndUpdate(
      { interest: interestId },
      {
        $set: {
          listing: interest.listing,
          tenant: interest.tenant,
          owner: interest.owner,
          interest: interestId,
        },
      },
      { upsert: true, returnDocument: 'after' }
    )

    recordActivity({
      action: 'chat_started',
      userId: ownerId,
      description: `Chat started for interest ${interestId} after acceptance`,
    }).catch(() => {})
  }

  // Trigger email notification to tenant
  try {
    const emailService = require('./emailService')
    const tenantUser = await User.findById(interest.tenant)
    if (tenantUser && ownerUser && listingObj) {
      emailService.sendInterestStatusEmail(tenantUser, ownerUser, listingObj, status, responseMessage).catch((err) => {
        console.error(`[Interest Email Dispatch Error]:`, err.message)
      })
    }
  } catch (err) {
    console.error(`[Interest Email Setup Error]:`, err.message)
  }

  return savedInterest
}

module.exports = {
  createInterest,
  getInterestsByTenant,
  getInterestsByOwner,
  respondToInterest,
}
