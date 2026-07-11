const interestService = require('../services/interestService')
const asyncHandler = require('../middleware/asyncHandler')

/**
 * @desc    Create a new interest request (tenant expresses interest)
 * @route   POST /api/interests
 * @access  Private (Tenant)
 */
const createInterestRequest = asyncHandler(async (req, res) => {
  const { listingId, tenantMessage } = req.body
  
  if (!listingId) {
    res.status(400)
    throw new Error('Listing ID is required')
  }

  const interest = await interestService.createInterest({
    tenantId: req.user._id,
    listingId,
    tenantMessage,
  })

  res.status(201).json({
    success: true,
    message: 'Interest expressed successfully',
    interest,
  })
})

/**
 * @desc    Get sent or received interests based on user role
 * @route   GET /api/interests
 * @access  Private
 */
const getMyInterests = asyncHandler(async (req, res) => {
  let interests = []
  
  if (req.user.role === 'owner') {
    interests = await interestService.getInterestsByOwner(req.user._id)
  } else {
    interests = await interestService.getInterestsByTenant(req.user._id)
  }

  res.json({
    success: true,
    count: interests.length,
    interests,
  })
})

/**
 * @desc    Respond to interest request (accept or decline)
 * @route   PATCH /api/interests/:id/status
 * @access  Private (Owner)
 */
const respondToInterest = asyncHandler(async (req, res) => {
  const { status, responseMessage } = req.body
  const interestId = req.params.id

  if (!status || !['accepted', 'declined'].includes(status)) {
    res.status(400)
    throw new Error('Valid status (accepted or declined) is required')
  }

  const updatedInterest = await interestService.respondToInterest({
    interestId,
    ownerId: req.user._id,
    status,
    responseMessage,
  })

  res.json({
    success: true,
    message: `Interest request ${status} successfully`,
    interest: updatedInterest,
  })
})

module.exports = {
  createInterestRequest,
  getMyInterests,
  respondToInterest,
}
