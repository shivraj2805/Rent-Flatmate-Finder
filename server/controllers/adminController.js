const adminService = require('../services/adminService')
const asyncHandler = require('../middleware/asyncHandler')
const { recordActivity } = require('../services/activityLogService')

/**
 * @desc    Get dashboard metrics & statistics
 * @route   GET /api/admin/stats
 * @access  Private (Admin Only)
 */
const getStats = asyncHandler(async (req, res) => {
  const stats = await adminService.getStats()
  res.json({
    success: true,
    stats,
  })
})

const getDashboard = asyncHandler(async (req, res) => {
  const dashboard = await adminService.getDashboard()
  res.json({
    success: true,
    ...dashboard,
  })
})

/**
 * @desc    Get all users
 * @route   GET /api/admin/users
 * @access  Private (Admin Only)
 */
const getUsers = asyncHandler(async (req, res) => {
  const users = await adminService.getUsers(req.query)
  res.json({
    success: true,
    count: users.length,
    users,
  })
})

const getUserById = asyncHandler(async (req, res) => {
  const user = await adminService.getUserById(req.params.id)
  res.json({ success: true, user })
})

/**
 * @desc    Update user role
 * @route   PUT /api/admin/users/:id/role
 * @access  Private (Admin Only)
 */
const updateUserRole = asyncHandler(async (req, res) => {
  const { role } = req.body
  const user = await adminService.updateUserRole(req.params.id, role)
  recordActivity({
    action: 'admin_user_role_updated',
    userId: req.user._id,
    description: `Admin ${req.user.name} changed ${user.name}'s role to ${role}`,
  }).catch(() => {})
  res.json({
    success: true,
    message: 'User role updated successfully',
    user,
  })
})

const updateUserStatus = asyncHandler(async (req, res) => {
  const { isActive } = req.body
  if (isActive === undefined) {
    res.status(400)
    throw new Error('isActive status is required')
  }

  const user = await adminService.updateUserStatus(req.params.id, isActive)
  recordActivity({
    action: 'admin_user_status_updated',
    userId: req.user._id,
    description: `Admin ${req.user.name} ${isActive ? 'unblocked' : 'blocked'} user ${user.name}`,
  }).catch(() => {})
  res.json({
    success: true,
    message: `User ${isActive ? 'unblocked' : 'blocked'} successfully`,
    user,
  })
})

/**
 * @desc    Delete user (cascading)
 * @route   DELETE /api/admin/users/:id
 * @access  Private (Admin Only)
 */
const deleteUser = asyncHandler(async (req, res) => {
  await adminService.deleteUser(req.params.id)
  recordActivity({
    action: 'admin_user_deleted',
    userId: req.user._id,
    description: `Admin ${req.user.name} deleted user ${req.params.id}`,
  }).catch(() => {})
  res.json({
    success: true,
    message: 'User and all associated records deleted successfully',
  })
})

/**
 * @desc    Get all listings
 * @route   GET /api/admin/listings
 * @access  Private (Admin Only)
 */
const getListings = asyncHandler(async (req, res) => {
  const listings = await adminService.getListings(req.query)
  res.json({
    success: true,
    count: listings.length,
    listings,
  })
})

const getListingById = asyncHandler(async (req, res) => {
  const listing = await adminService.getListingById(req.params.id)
  res.json({ success: true, listing })
})

/**
 * @desc    Toggle listing status
 * @route   PATCH /api/admin/listings/:id/status
 * @access  Private (Admin Only)
 */
const toggleListingStatus = asyncHandler(async (req, res) => {
  const { isActive } = req.body
  if (isActive === undefined) {
    res.status(400)
    throw new Error('isActive status is required')
  }

  const listing = await adminService.toggleListingStatus(req.params.id, isActive)
  recordActivity({
    action: 'admin_listing_status_updated',
    userId: req.user._id,
    description: `Admin ${req.user.name} changed listing ${listing.title} to ${isActive ? 'active' : 'inactive'}`,
  }).catch(() => {})
  res.json({
    success: true,
    message: `Listing status updated to ${isActive ? 'active' : 'inactive'}`,
    listing,
  })
})

/**
 * @desc    Delete listing (cascading)
 * @route   DELETE /api/admin/listings/:id
 * @access  Private (Admin Only)
 */
const deleteListing = asyncHandler(async (req, res) => {
  await adminService.deleteListing(req.params.id)
  recordActivity({
    action: 'admin_listing_deleted',
    userId: req.user._id,
    description: `Admin ${req.user.name} deleted listing ${req.params.id}`,
  }).catch(() => {})
  res.json({
    success: true,
    message: 'Listing and all associated records deleted successfully',
  })
})

/**
 * @desc    Get all interest requests
 * @route   GET /api/admin/interests
 * @access  Private (Admin Only)
 */
const getInterests = asyncHandler(async (req, res) => {
  const interests = await adminService.getInterests()
  res.json({
    success: true,
    count: interests.length,
    interests,
  })
})

const deleteInterest = asyncHandler(async (req, res) => {
  await adminService.deleteInterest(req.params.id)
  recordActivity({
    action: 'admin_interest_deleted',
    userId: req.user._id,
    description: `Admin ${req.user.name} deleted interest request ${req.params.id}`,
  }).catch(() => {})
  res.json({
    success: true,
    message: 'Interest request deleted successfully',
  })
})

/**
 * @desc    Get all active chats
 * @route   GET /api/admin/chats
 * @access  Private (Admin Only)
 */
const getChats = asyncHandler(async (req, res) => {
  const chats = await adminService.getChats()
  res.json({
    success: true,
    count: chats.length,
    chats,
  })
})

const getChatMessages = asyncHandler(async (req, res) => {
  const messages = await adminService.getChatMessages(req.params.id)
  res.json({
    success: true,
    count: messages.length,
    messages,
  })
})

const deleteChat = asyncHandler(async (req, res) => {
  await adminService.deleteChat(req.params.id)
  recordActivity({
    action: 'admin_chat_deleted',
    userId: req.user._id,
    description: `Admin ${req.user.name} deleted chat ${req.params.id}`,
  }).catch(() => {})
  res.json({
    success: true,
    message: 'Chat deleted successfully',
  })
})

const getActivity = asyncHandler(async (req, res) => {
  const activity = await adminService.getActivity(req.query.limit)
  res.json({
    success: true,
    count: activity.length,
    activity,
  })
})

const bulkUpdateUserStatus = asyncHandler(async (req, res) => {
  const { userIds, isActive } = req.body
  if (!Array.isArray(userIds) || isActive === undefined) {
    res.status(400)
    throw new Error('userIds (array) and isActive status are required')
  }

  const result = await adminService.bulkUpdateUserStatus(userIds, isActive)
  recordActivity({
    action: 'admin_users_bulk_status_updated',
    userId: req.user._id,
    description: `Admin ${req.user.name} bulk ${isActive ? 'unblocked' : 'blocked'} ${userIds.length} users`,
  }).catch(() => {})

  res.json({
    success: true,
    message: `Successfully bulk updated users status to ${isActive ? 'active' : 'blocked'}.`,
    ...result,
  })
})

const bulkDeleteUsers = asyncHandler(async (req, res) => {
  const { userIds } = req.body
  if (!Array.isArray(userIds)) {
    res.status(400)
    throw new Error('userIds (array) is required')
  }

  await adminService.bulkDeleteUsers(userIds)
  recordActivity({
    action: 'admin_users_bulk_deleted',
    userId: req.user._id,
    description: `Admin ${req.user.name} bulk deleted ${userIds.length} users and their associated data`,
  }).catch(() => {})

  res.json({
    success: true,
    message: `Successfully bulk deleted ${userIds.length} users and all associated records.`,
  })
})

const bulkUpdateListingStatus = asyncHandler(async (req, res) => {
  const { listingIds, isActive } = req.body
  if (!Array.isArray(listingIds) || isActive === undefined) {
    res.status(400)
    throw new Error('listingIds (array) and isActive status are required')
  }

  const result = await adminService.bulkUpdateListingStatus(listingIds, isActive)
  recordActivity({
    action: 'admin_listings_bulk_status_updated',
    userId: req.user._id,
    description: `Admin ${req.user.name} bulk changed status of ${listingIds.length} listings`,
  }).catch(() => {})

  res.json({
    success: true,
    message: `Successfully bulk updated listings status to ${isActive ? 'active' : 'inactive'}.`,
    ...result,
  })
})

const bulkDeleteListings = asyncHandler(async (req, res) => {
  const { listingIds } = req.body
  if (!Array.isArray(listingIds)) {
    res.status(400)
    throw new Error('listingIds (array) is required')
  }

  await adminService.bulkDeleteListings(listingIds)
  recordActivity({
    action: 'admin_listings_bulk_deleted',
    userId: req.user._id,
    description: `Admin ${req.user.name} bulk deleted ${listingIds.length} listings and their associated data`,
  }).catch(() => {})

  res.json({
    success: true,
    message: `Successfully bulk deleted ${listingIds.length} listings and all associated records.`,
  })
})

module.exports = {
  getStats,
  getDashboard,
  getUsers,
  getUserById,
  updateUserRole,
  updateUserStatus,
  deleteUser,
  getListings,
  getListingById,
  toggleListingStatus,
  deleteListing,
  getInterests,
  deleteInterest,
  getChats,
  getChatMessages,
  deleteChat,
  getActivity,
  bulkUpdateUserStatus,
  bulkDeleteUsers,
  bulkUpdateListingStatus,
  bulkDeleteListings,
}
