const Chat = require('../models/Chat')
const Message = require('../models/Message')

const createError = (message, statusCode) => {
  const error = new Error(message)
  error.statusCode = statusCode
  return error
}

/**
 * Fetch all chat rooms for a user
 * @param {string} userId - Tenant or Owner ID
 * @returns {Promise<Array>}
 */
const getUserChats = async (userId) => {
  return Chat.find({
    $or: [{ tenant: userId }, { owner: userId }],
  })
    .populate('listing', 'title rent location images roomType')
    .populate('tenant', 'name email avatar')
    .populate('owner', 'name email avatar')
    .populate({
      path: 'lastMessage',
      populate: { path: 'sender', select: 'name' },
    })
    .sort({ lastMessageAt: -1, updatedAt: -1 })
}

/**
 * Fetch historical messages for a chat room
 * @param {string} chatId
 * @param {string} userId - User requesting messages (for validation)
 * @returns {Promise<Array>}
 */
const getChatMessages = async (chatId, userId) => {
  const chat = await Chat.findById(chatId)
  if (!chat) {
    throw createError('Chat room not found', 404)
  }

  // Validate authorization
  const isParticipant =
    chat.tenant.toString() === userId.toString() ||
    chat.owner.toString() === userId.toString()

  if (!isParticipant) {
    throw createError('Not authorized to view this chat', 403)
  }

  return Message.find({ chat: chatId })
    .populate('sender', 'name avatar')
    .sort({ createdAt: 1 })
}

/**
 * Save message and update lastMessage field on chat
 * @param {string} chatId
 * @param {string} senderId
 * @param {string} content
 * @returns {Promise<Message>}
 */
const saveMessage = async (chatId, senderId, content) => {
  const chat = await Chat.findById(chatId)
  if (!chat) {
    throw createError('Chat room not found', 404)
  }

  // Validate authorization
  const isParticipant =
    chat.tenant.toString() === senderId.toString() ||
    chat.owner.toString() === senderId.toString()

  if (!isParticipant) {
    throw createError('Not authorized to message in this chat', 403)
  }

  const message = await Message.create({
    chat: chatId,
    sender: senderId,
    content: content.trim(),
  })

  // Update chat details
  chat.lastMessage = message._id
  chat.lastMessageAt = message.createdAt
  await chat.save()

  // Return fully populated message
  return Message.findById(message._id).populate('sender', 'name avatar')
}

module.exports = {
  getUserChats,
  getChatMessages,
  saveMessage,
}
