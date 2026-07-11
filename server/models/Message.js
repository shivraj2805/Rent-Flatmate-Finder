const mongoose = require('mongoose')

const messageSchema = new mongoose.Schema(
  {
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

messageSchema.index({ chat: 1, createdAt: 1 })
messageSchema.index({ sender: 1, createdAt: -1 })

module.exports = mongoose.model('Message', messageSchema)