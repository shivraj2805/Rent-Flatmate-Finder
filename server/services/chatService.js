const Chat = require('../models/Chat')
const Message = require('../models/Message')
const Interest = require('../models/Interest')
const TenantProfile = require('../models/TenantProfile')
const User = require('../models/User')

const createError = (message, statusCode) => {
  const error = new Error(message)
  error.statusCode = statusCode
  return error
}

/**
 * Fetch all chat rooms for a user
 * Access Rules: Only return chat rooms where interest is accepted
 * @param {string} userId - Tenant or Owner ID
 * @returns {Promise<Array>}
 */
const getUserChats = async (userId) => {
  // Auto-heal missing chat rooms for previously accepted interests
  try {
    const acceptedInterests = await Interest.find({
      status: 'accepted',
      $or: [{ tenant: userId }, { owner: userId }],
    })

    for (const interest of acceptedInterests) {
      const chatExists = await Chat.findOne({ interest: interest._id })
      if (!chatExists) {
        await Chat.create({
          listing: interest.listing,
          tenant: interest.tenant,
          owner: interest.owner,
          interest: interest._id,
        })
      }
    }
  } catch (err) {
    console.error('[Chat Auto-Heal Error] Failed to verify accepted interests chats:', err.message)
  }

  // Fetch chats and populate interest status
  const chats = await Chat.find({
    $or: [{ tenant: userId }, { owner: userId }],
  })
    .populate('listing', 'title rent location images roomType')
    .populate('tenant', 'name email avatar')
    .populate('owner', 'name email avatar')
    .populate('interest') // Ensure interest is populated for access control check
    .populate({
      path: 'lastMessage',
      populate: { path: 'sender', select: 'name' },
    })
    .sort({ lastMessageAt: -1, updatedAt: -1 })

  // Return only chats where the underlying Interest status is accepted
  return chats.filter((chat) => chat.interest && chat.interest.status === 'accepted')
}

/**
 * Fetch historical messages for a chat room with pagination
 * Access Rules: Only available if Interest request status is accepted
 * @param {string} chatId
 * @param {string} userId - User requesting messages
 * @param {number} limit - Max number of messages to return
 * @param {string} before - ISO timestamp to fetch messages prior to
 * @returns {Promise<Array>}
 */
const getChatMessages = async (chatId, userId, limit = 50, before = null) => {
  const chat = await Chat.findById(chatId).populate('interest')
  if (!chat) {
    throw createError('Chat room not found', 404)
  }

  // Validate interest is accepted (Access Rules requirement)
  if (!chat.interest || chat.interest.status !== 'accepted') {
    throw createError('Chat is not active. The interest request must be accepted.', 403)
  }

  // Validate authorization (Security requirement)
  const isParticipant =
    chat.tenant.toString() === userId.toString() ||
    chat.owner.toString() === userId.toString()

  if (!isParticipant) {
    throw createError('Not authorized to view this chat', 403)
  }

  const query = { chat: chatId }
  if (before) {
    query.createdAt = { $lt: new Date(before) }
  }

  // Return sorted newest first for pagination. The controller will reverse it to chronological order.
  return Message.find(query)
    .populate('sender', 'name avatar')
    .populate({
      path: 'replyTo',
      populate: { path: 'sender', select: 'name' },
    })
    .sort({ createdAt: -1 })
    .limit(Number(limit) || 50)
}

/**
 * Save message, populate all required fields, and update lastMessage field on chat
 * Access Rules: Reject messages if interest status is not accepted
 * @param {string} chatId
 * @param {string} senderId
 * @param {string} content
 * @param {string} replyToId
 * @returns {Promise<Message>}
 */
const saveMessage = async (chatId, senderId, content, replyToId = null) => {
  const chat = await Chat.findById(chatId).populate('interest')
  if (!chat) {
    throw createError('Chat room not found', 404)
  }

  // Validate interest is accepted (Access Rules requirement)
  if (!chat.interest || chat.interest.status !== 'accepted') {
    throw createError('Chat is not active. The interest request must be accepted.', 403)
  }

  // Validate authorization (Security requirement)
  const isParticipant =
    chat.tenant.toString() === senderId.toString() ||
    chat.owner.toString() === senderId.toString()

  if (!isParticipant) {
    throw createError('Not authorized to message in this chat', 403)
  }

  const recipientId = chat.tenant.toString() === senderId.toString() ? chat.owner : chat.tenant

  // Create message document in database with both legacy and new fields
  const message = await Message.create({
    // Legacy fields
    chat: chatId,
    sender: senderId,
    content: content.trim(),

    // New required fields
    chatId: chatId,
    senderId: senderId,
    receiverId: recipientId,
    listingId: chat.listing,
    message: content.trim(),
    messageType: 'text',
    timestamp: new Date(),

    replyTo: replyToId || null,
  })

  // Update chat details
  chat.lastMessage = message._id
  chat.lastMessageAt = message.createdAt
  await chat.save()

  // Dispatch message notification
  const Notification = require('../models/Notification')
  const existingUnread = await Notification.findOne({
    recipient: recipientId,
    type: 'new_message',
    isRead: false,
  })

  if (!existingUnread) {
    const sender = await User.findById(senderId)
    const senderName = sender ? sender.name : 'Someone'
    const truncatedMsg = content.trim().length > 60 
      ? `${content.trim().slice(0, 57)}...` 
      : content.trim()

    Notification.create({
      recipient: recipientId,
      sender: senderId,
      type: 'new_message',
      title: `New Message from ${senderName}`,
      content: `"${truncatedMsg}"`,
      link: `/dashboard/tenant/chats?interestId=${chat.interest._id}`,
    }).catch(() => {})
  }

  // Return fully populated message details
  return Message.findById(message._id)
    .populate('sender', 'name avatar')
    .populate({
      path: 'replyTo',
      populate: { path: 'sender', select: 'name' },
    })
}

module.exports = {
  getUserChats,
  getChatMessages,
  saveMessage,
}
