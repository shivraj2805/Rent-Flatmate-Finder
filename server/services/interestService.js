const Interest = require('../models/Interest')
const Listing = require('../models/Listing')
const TenantProfile = require('../models/TenantProfile')

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

  // Validate gender matching if listing has gender preference
  if (listing.genderPreference && listing.genderPreference !== 'any') {
    const profile = await TenantProfile.findOne({ user: tenantId })
    if (!profile) {
      throw createError('Please create a tenant profile before expressing interest', 400)
    }
    if (profile.gender !== listing.genderPreference) {
      throw createError(`This room has a gender preference of ${listing.genderPreference}. Your profile gender (${profile.gender}) does not match.`, 400)
    }
  }

  // Create interest request
  return Interest.create({
    tenant: tenantId,
    listing: listingId,
    owner: listing.owner,
    tenantMessage: tenantMessage ? tenantMessage.trim() : '',
    status: 'pending',
  })
}

/**
 * Get interests sent by a tenant
 */
const getInterestsByTenant = async (tenantId) => {
  return Interest.find({ tenant: tenantId })
    .populate('listing', 'title rent location images isActive status roomType')
    .populate('owner', 'name email avatar')
    .sort({ createdAt: -1 })
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
  }

  return savedInterest
}

module.exports = {
  createInterest,
  getInterestsByTenant,
  getInterestsByOwner,
  respondToInterest,
}
