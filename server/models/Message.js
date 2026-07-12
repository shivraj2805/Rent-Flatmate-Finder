const mongoose = require('mongoose')

const messageSchema = new mongoose.Schema(
  {
    // Legacy fields for backward compatibility
    chat: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Chat',
      required: true,
      index: true,
    },
    sender: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    content: {
      type: String,
      required: [true, 'Message content is required'],
      trim: true,
      maxlength: 4000,
    },

    // New required fields
    chatId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Chat',
      required: true,
      index: true,
    },
    senderId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    receiverId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    listingId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Listing',
      required: true,
      index: true,
    },
    message: {
      type: String,
      required: [true, 'Message content is required'],
      trim: true,
      maxlength: 4000,
    },
    messageType: {
      type: String,
      enum: ['text', 'image', 'system'],
      default: 'text',
      required: true,
    },
    timestamp: {
      type: Date,
      default: Date.now,
      index: true,
    },

    readBy: {
      type: [mongoose.Schema.Types.ObjectId],
      ref: 'User',
      default: [],
    },
    deliveredAt: {
      type: Date,
      default: Date.now,
      index: true,
    },
    editedAt: {
      type: Date,
      default: null,
    },
    replyTo: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Message',
      default: null,
    },
  },
  { timestamps: true },
)

// Indexing configurations
messageSchema.index({ chat: 1, createdAt: 1 })
messageSchema.index({ chatId: 1, createdAt: 1 })
messageSchema.index({ sender: 1, createdAt: -1 })
messageSchema.index({ senderId: 1, createdAt: -1 })

module.exports = mongoose.model('Message', messageSchema)