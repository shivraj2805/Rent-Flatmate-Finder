const Listing = require('../models/Listing')
const TenantProfile = require('../models/TenantProfile')
const Compatibility = require('../models/Compatibility')
const compatibilityService = require('../services/compatibilityService')
const asyncHandler = require('../middleware/asyncHandler')
const { NotFoundError, ValidationError, ForbiddenError } = require('../utils/customErrors')

/**
 * @desc    Get compatibility score for a listing against requesting tenant
 * @route   GET /api/compatibility/:listingId
 * @access  Private (Tenant)
 */
const getCompatibility = asyncHandler(async (req, res) => {
  const { listingId } = req.params
  const userId = req.user._id

  // 1. Validate tenant has a profile
  const tenantProfile = await TenantProfile.findOne({ user: userId })
  if (!tenantProfile) {
    throw new ValidationError('Tenant profile not found. Please set up your profile preferences first.')
  }

  // 2. Validate listing exists
  const listing = await Listing.findById(listingId)
  if (!listing) {
    throw new NotFoundError('Listing not found')
  }

  // 3. Evaluate and return compatibility details
  const compatibility = await compatibilityService.evaluateAndSaveCompatibility(
    listingId,
    tenantProfile._id
  )

  res.json({
    success: true,
    compatibility,
  })
})

/**
 * @desc    Trigger background recalculation of compatibility scores
 * @route   POST /api/compatibility/recalculate
 * @access  Private
 */
const recalculateCompatibility = asyncHandler(async (req, res) => {
  const userId = req.user._id
  const role = req.user.role

  if (role === 'tenant') {
    const tenantProfile = await TenantProfile.findOne({ user: userId })
    if (!tenantProfile) {
      throw new ValidationError('Tenant profile not found')
    }

    // Fire and forget background recalculation
    compatibilityService.recalculateForTenantProfile(tenantProfile._id).catch((err) => {
      console.error(`[Background Tenant Recalculate Error] User ${userId}:`, err.message)
    })

    return res.json({
      success: true,
      message: 'Background compatibility recalculation started for your profile preferences.',
    })
  }

  if (role === 'owner') {
    const ownerListings = await Listing.find({ owner: userId })
    if (ownerListings.length === 0) {
      return res.json({
        success: true,
        message: 'No active listings found to recalculate compatibility score for.',
      })
    }

    // Fire and forget background recalculation for owner's listings
    const processListings = async () => {
      const tenantProfiles = await TenantProfile.find({ isSearching: true })
      for (const listing of ownerListings) {
        for (const profile of tenantProfiles) {
          try {
            await compatibilityService.evaluateAndSaveCompatibility(listing._id, profile._id)
          } catch (err) {
            console.error(`[Recalc Error] Listing ${listing._id} Profile ${profile._id}:`, err.message)
          }
        }
      }
    }

    processListings().catch((err) => {
      console.error(`[Background Owner Recalculate Error] User ${userId}:`, err.message)
    })

    return res.json({
      success: true,
      message: 'Background compatibility recalculation started for your listing portfolio.',
    })
  }

  throw new ForbiddenError('Recalculation is only authorized for Tenants or Listing Owners.')
})

module.exports = {
  getCompatibility,
  recalculateCompatibility,
}
