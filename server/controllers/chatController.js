const chatService = require('../services/chatService')
const asyncHandler = require('../middleware/asyncHandler')

/**
 * @desc    Get user's chat rooms
 * @route   GET /api/chats
 * @access  Private
 */
const getChats = asyncHandler(async (req, res) => {
  const chats = await chatService.getUserChats(req.user._id)

  res.json({
    success: true,
    count: chats.length,
    chats,
  })
})

/**
 * @desc    Get message history for a chat
 * @route   GET /api/chats/:id/messages
 * @access  Private
 */
const getMessages = asyncHandler(async (req, res) => {
  const messages = await chatService.getChatMessages(req.params.id, req.user._id)

  res.json({
    success: true,
    count: messages.length,
    messages,
  })
})

/**
 * @desc    Send a message in a chat
 * @route   POST /api/chats/:id/messages
 * @access  Private
 */
const sendMessage = asyncHandler(async (req, res) => {
  const { content } = req.body
  if (!content || !content.trim()) {
    res.status(400)
    throw new Error('Message content cannot be empty')
  }

  const message = await chatService.saveMessage(req.params.id, req.user._id, content)

  // Real-time broadcast using Socket.IO
  const io = req.app.get('io')
  if (io) {
    io.to(req.params.id).emit('receive_message', message)
  }

  res.status(201).json({
    success: true,
    message,
  })
})

module.exports = {
  getChats,
  getMessages,
  sendMessage,
}
