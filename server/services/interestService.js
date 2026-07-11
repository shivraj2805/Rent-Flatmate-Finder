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
      } else {
        plainInterest.tenantProfile = null
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

  return interest.save()
}

module.exports = {
  createInterest,
  getInterestsByTenant,
  getInterestsByOwner,
  respondToInterest,
}
