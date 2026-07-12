const User = require('../models/User')
const Listing = require('../models/Listing')
const TenantProfile = require('../models/TenantProfile')
const Compatibility = require('../models/Compatibility')
const Interest = require('../models/Interest')
const Chat = require('../models/Chat')
const Message = require('../models/Message')
const ActivityLog = require('../models/ActivityLog')
const { deleteImageFromCloudinary } = require('./listingService')

const createError = (message, statusCode) => {
  const error = new Error(message)
  error.statusCode = statusCode
  return error
}

const buildMonthlySeries = async (model, dateField, labelPrefix, monthsBack = 6) => {
  const now = new Date()
  const start = new Date(now.getFullYear(), now.getMonth() - (monthsBack - 1), 1)

  const raw = await model.aggregate([
    { $match: { [dateField]: { $gte: start } } },
    {
      $group: {
        _id: { $dateToString: { format: '%Y-%m', date: `$${dateField}` } },
        count: { $sum: 1 },
      },
    },
    { $sort: { _id: 1 } },
  ])

  const countMap = new Map(raw.map((item) => [item._id, item.count]))
  const series = []

  for (let offset = monthsBack - 1; offset >= 0; offset -= 1) {
    const date = new Date(now.getFullYear(), now.getMonth() - offset, 1)
    const key = date.toISOString().slice(0, 7)
    series.push({
      label: `${labelPrefix} ${date.toLocaleDateString('en-IN', { month: 'short' })}`,
      month: key,
      count: countMap.get(key) || 0,
    })
  }

  return series
}

const getDashboard = async () => {
  const [
    totalUsers,
    tenantUsers,
    ownerUsers,
    adminUsers,
    totalListings,
    activeListings,
    filledListings,
    hiddenListings,
    totalChats,
    totalMessages,
    totalInterests,
    pendingInterests,
    acceptedInterests,
    declinedInterests,
    recentActivity,
    usersByRole,
    listingsByLocation,
    monthlyRegistrations,
    monthlyListings,
  ] = await Promise.all([
    User.countDocuments(),
    User.countDocuments({ role: 'tenant' }),
    User.countDocuments({ role: 'owner' }),
    User.countDocuments({ role: 'admin' }),
    Listing.countDocuments(),
    Listing.countDocuments({ isActive: true, status: 'active' }),
    Listing.countDocuments({ status: 'filled' }),
    Listing.countDocuments({ isActive: false }),
    Chat.countDocuments(),
    Message.countDocuments(),
    Interest.countDocuments(),
    Interest.countDocuments({ status: 'pending' }),
    Interest.countDocuments({ status: 'accepted' }),
    Interest.countDocuments({ status: 'declined' }),
    ActivityLog.find().populate('user', 'name email role avatar').sort({ createdAt: -1 }).limit(20),
    User.aggregate([{ $group: { _id: '$role', count: { $sum: 1 } } }, { $sort: { count: -1 } }]),
    Listing.aggregate([{ $group: { _id: '$location', count: { $sum: 1 } } }, { $sort: { count: -1 } }, { $limit: 6 }]),
    buildMonthlySeries(User, 'createdAt', 'Reg'),
    buildMonthlySeries(Listing, 'createdAt', 'Listing'),
  ])

  const totalDecided = acceptedInterests + declinedInterests
  const successRate = totalDecided > 0 ? Math.round((acceptedInterests / totalDecided) * 100) : 0

  return {
    users: {
      total: totalUsers,
      tenants: tenantUsers,
      owners: ownerUsers,
      admins: adminUsers,
    },
    listings: {
      total: totalListings,
      active: activeListings,
      filled: filledListings,
      inactive: hiddenListings,
    },
    interests: {
      total: totalInterests,
      pending: pendingInterests,
      accepted: acceptedInterests,
      declined: declinedInterests,
      successRate,
    },
    chats: {
      total: totalChats,
    },
    messages: {
      total: totalMessages,
    },
    charts: {
      usersByRole: usersByRole.map((item) => ({
        role: item._id || 'unknown',
        count: item.count,
      })),
      listingsByLocation: listingsByLocation.map((item) => ({
        location: item._id || 'Unknown',
        count: item.count,
      })),
      monthlyRegistrations,
      monthlyListings,
      listingStatus: [
        { label: 'Active', count: activeListings },
        { label: 'Filled', count: filledListings },
        { label: 'Hidden', count: hiddenListings },
      ],
    },
    recentActivity,
  }
}

/**
 * Fetch marketplace metrics and dashboard stats
 */
const getStats = async () => {
  return getDashboard()
}

/**
 * Get all users
 */
const getUsers = async ({ search = '', role = '' } = {}) => {
  const query = {}
  if (role) {
    query.role = role
  }

  if (search) {
    query.$or = [
      { name: { $regex: search, $options: 'i' } },
      { email: { $regex: search, $options: 'i' } },
    ]
  }

  return User.find(query).select('-password').sort({ createdAt: -1 })
}

const getUserById = async (userId) => {
  const user = await User.findById(userId).select('-password')
  if (!user) {
    throw createError('User not found', 404)
  }

  return user
}

/**
 * Update a user's role
 */
const updateUserRole = async (userId, role) => {
  if (!['tenant', 'owner', 'admin'].includes(role)) {
    throw createError('Invalid role role specified', 400)
  }

  const user = await User.findByIdAndUpdate(
    userId,
    { $set: { role } },
    { returnDocument: 'after', runValidators: true }
  ).select('-password')

  if (!user) {
    throw createError('User not found', 404)
  }

  return user
}

const updateUserStatus = async (userId, isActive) => {
  const user = await User.findByIdAndUpdate(
    userId,
    { $set: { isActive } },
    { returnDocument: 'after', runValidators: true }
  ).select('-password')

  if (!user) {
    throw createError('User not found', 404)
  }

  return user
}

/**
 * Deletes a user and cascades deletion to all their associated records
 */
const deleteUser = async (userId) => {
  const user = await User.findById(userId)
  if (!user) {
    throw createError('User not found', 404)
  }

  // 1. Delete listings owned by user (and cascadingly delete their associations)
  const userListings = await Listing.find({ owner: userId })
  for (const listing of userListings) {
    await deleteListing(listing._id)
  }

  // 2. Delete tenant profile if exists
  await TenantProfile.findOneAndDelete({ user: userId })

  // 3. Delete any compatibility records linked to user's profile
  // Note: Compatibility is joined by listing, so clean up will run when listing is deleted.
  
  // 4. Delete interest requests sent by or received by this user
  await Interest.deleteMany({
    $or: [{ tenant: userId }, { owner: userId }],
  })

  // 5. Delete chats and message logs
  const userChats = await Chat.find({
    $or: [{ tenant: userId }, { owner: userId }],
  })
  for (const chat of userChats) {
    await Message.deleteMany({ chat: chat._id })
  }
  await Chat.deleteMany({
    $or: [{ tenant: userId }, { owner: userId }],
  })

  // 6. Delete user document
  await User.findByIdAndDelete(userId)

  return { success: true }
}

/**
 * Get all listings
 */
const getListings = async ({ search = '', status = '' } = {}) => {
  const query = {}

  if (status) {
    if (status === 'active') {
      query.isActive = true
      query.status = 'active'
    } else if (status === 'filled') {
      query.status = 'filled'
    } else if (status === 'hidden') {
      query.isActive = false
    }
  }

  if (search) {
    query.$or = [
      { title: { $regex: search, $options: 'i' } },
      { location: { $regex: search, $options: 'i' } },
    ]
  }

  return Listing.find(query).populate('owner', 'name email avatar').sort({ createdAt: -1 })
}

const getListingById = async (listingId) => {
  const listing = await Listing.findById(listingId).populate('owner', 'name email avatar')
  if (!listing) {
    throw createError('Listing not found', 404)
  }

  return listing
}

/**
 * Toggle listing active status
 */
const toggleListingStatus = async (listingId, isActive) => {
  const listing = await Listing.findByIdAndUpdate(
    listingId,
    { $set: { isActive } },
    { returnDocument: 'after', runValidators: true }
  ).populate('owner', 'name email')

  if (!listing) {
    throw createError('Listing not found', 404)
  }

  return listing
}

/**
 * Delete a listing and cascade cleans up related records
 */
const deleteListing = async (listingId) => {
  const listing = await Listing.findById(listingId)
  if (!listing) {
    throw createError('Listing not found', 404)
  }

  if (Array.isArray(listing.images)) {
    for (const image of listing.images) {
      await deleteImageFromCloudinary(image.publicId || image.url)
    }
  }

  // 1. Delete compatibility scoring
  await Compatibility.deleteMany({ listing: listingId })

  // 2. Delete interest requests
  await Interest.deleteMany({ listing: listingId })

  // 3. Delete chat rooms and messages
  const listingChats = await Chat.find({ listing: listingId })
  for (const chat of listingChats) {
    await Message.deleteMany({ chat: chat._id })
  }
  await Chat.deleteMany({ listing: listingId })

  // 4. Delete listing itself
  await Listing.findByIdAndDelete(listingId)

  return { success: true }
}

/**
 * Get all interests
 */
const getInterests = async () => {
  const interests = await Interest.find()
    .populate('tenant', 'name email')
    .populate('owner', 'name email')
    .populate('listing', 'title rent location')
    .sort({ createdAt: -1 })

  const enriched = await Promise.all(
    interests.map(async (interest) => {
      const plain = interest.toObject()
      const tenantProfile = interest.tenant ? await TenantProfile.findOne({ user: interest.tenant._id }) : null
      if (tenantProfile) {
        const compatibility = await Compatibility.findOne({
          listing: interest.listing?._id,
          tenantProfile: tenantProfile._id,
        }).select('score explanation source evaluatedAt')
        plain.compatibility = compatibility || null
      } else {
        plain.compatibility = null
      }
      return plain
    })
  )

  return enriched
}

const deleteInterest = async (interestId) => {
  const interest = await Interest.findById(interestId)
  if (!interest) {
    throw createError('Interest request not found', 404)
  }

  const chat = await Chat.findOne({ interest: interestId })
  if (chat) {
    await Message.deleteMany({ chat: chat._id })
    await Chat.findByIdAndDelete(chat._id)
  }

  await Interest.findByIdAndDelete(interestId)

  return { success: true }
}

/**
 * Get all chat rooms
 */
const getChats = async () => {
  return Chat.find()
    .populate('tenant', 'name email')
    .populate('owner', 'name email')
    .populate('listing', 'title location rent')
    .populate({
      path: 'lastMessage',
      populate: { path: 'sender', select: 'name avatar' },
    })
    .sort({ updatedAt: -1 })
}

const getChatMessages = async (chatId) => {
  const chat = await Chat.findById(chatId)
  if (!chat) {
    throw createError('Chat room not found', 404)
  }

  return Message.find({ chat: chatId })
    .populate('sender', 'name avatar')
    .populate({
      path: 'replyTo',
      populate: { path: 'sender', select: 'name avatar' },
    })
    .sort({ createdAt: 1 })
}

const deleteChat = async (chatId) => {
  const chat = await Chat.findById(chatId)
  if (!chat) {
    throw createError('Chat room not found', 404)
  }

  await Message.deleteMany({ chat: chatId })
  await Chat.findByIdAndDelete(chatId)

  return { success: true }
}

const getActivity = async (limit = 100) => {
  return ActivityLog.find()
    .populate('user', 'name email role avatar')
    .sort({ createdAt: -1 })
    .limit(Math.min(Math.max(Number(limit) || 100, 1), 500))
}

const bulkUpdateUserStatus = async (userIds, isActive) => {
  if (!Array.isArray(userIds) || userIds.length === 0) return { modifiedCount: 0 }
  const result = await User.updateMany(
    { _id: { $in: userIds } },
    { $set: { isActive } }
  )
  return { modifiedCount: result.modifiedCount }
}

const bulkDeleteUsers = async (userIds) => {
  if (!Array.isArray(userIds) || userIds.length === 0) return { deletedCount: 0 }
  for (const userId of userIds) {
    try {
      await deleteUser(userId)
    } catch (err) {
      if (err.statusCode !== 404) throw err
    }
  }
  return { deletedCount: userIds.length }
}

const bulkUpdateListingStatus = async (listingIds, isActive) => {
  if (!Array.isArray(listingIds) || listingIds.length === 0) return { modifiedCount: 0 }
  const result = await Listing.updateMany(
    { _id: { $in: listingIds } },
    { $set: { isActive } }
  )
  return { modifiedCount: result.modifiedCount }
}

const bulkDeleteListings = async (listingIds) => {
  if (!Array.isArray(listingIds) || listingIds.length === 0) return { deletedCount: 0 }
  for (const listingId of listingIds) {
    try {
      await deleteListing(listingId)
    } catch (err) {
      if (err.statusCode !== 404) throw err
    }
  }
  return { deletedCount: listingIds.length }
}

module.exports = {
  getDashboard,
  getStats,
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
