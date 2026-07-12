const mongoose = require('mongoose')

const notificationSchema = new mongoose.Schema(
  {
    // Legacy fields for backward compatibility
    recipient: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    content: {
      type: String,
      required: true,
    },

    // New fields for schema requirements compatibility
    receiver: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      index: true,
    },
    message: {
      type: String,
    },

    sender: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    type: {
      type: String,
      enum: ['interest_received', 'interest_accepted', 'interest_declined', 'new_message'],
      required: true,
      index: true,
    },
    title: {
      type: String,
      required: true,
    },
    isRead: {
      type: Boolean,
      default: false,
      index: true,
    },
    link: {
      type: String,
    },
  },
  {
    timestamps: true,
  }
)

// Pre-save hook to mirror recipient -> receiver and content -> message for data integrity
notificationSchema.pre('save', function (next) {
  if (this.recipient && !this.receiver) {
    this.receiver = this.recipient
  } else if (this.receiver && !this.recipient) {
    this.recipient = this.receiver
  }

  if (this.content && !this.message) {
    this.message = this.content
  } else if (this.message && !this.content) {
    this.content = this.message
  }

  next()
})

notificationSchema.post('save', function (doc) {
  try {
    const { getIO } = require('../config/socket')
    const io = getIO()
    if (io) {
      io.to(doc.recipient.toString()).emit('new_notification', doc)
    }
  } catch (err) {
    // Silently ignore if socket is not initialized
  }
})

// Indexing configurations for notifications
notificationSchema.index({ recipient: 1, isRead: 1, createdAt: -1 })
notificationSchema.index({ receiver: 1, isRead: 1, createdAt: -1 })

module.exports = mongoose.model('Notification', notificationSchema)
