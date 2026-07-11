const tenantService = require('../services/tenantService')
const asyncHandler = require('../middleware/asyncHandler')

/**
 * @desc    Get current tenant's profile
 * @route   GET /api/tenant/profile
 * @access  Private (Tenant/Admin)
 */
const getMyProfile = asyncHandler(async (req, res) => {
  const profile = await tenantService.getProfileByUserId(req.user._id)

  res.json({
    success: true,
    profile: profile || null,
  })
})

/**
 * @desc    Create or update tenant's profile
 * @route   PUT /api/tenant/profile
 * @access  Private (Tenant)
 */
const updateOrCreateProfile = asyncHandler(async (req, res) => {
  const profile = await tenantService.upsertProfile(req.user._id, req.body)

  res.json({
    success: true,
    message: 'Profile updated successfully',
    profile,
  })
})

module.exports = {
  getMyProfile,
  updateOrCreateProfile,
}
