const mongoose = require('mongoose')

const notificationSchema = new mongoose.Schema(
  {
    recipient: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    sender: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    type: {
      type: String,
      enum: ['interest_received', 'interest_accepted', 'interest_declined', 'new_message'],
      required: true,
    },
    title: {
      type: String,
      required: true,
    },
    content: {
      type: String,
      required: true,
    },
    isRead: {
      type: Boolean,
      default: false,
    },
    link: {
      type: String,
    },
  },
  {
    timestamps: true,
  }
)

notificationSchema.post('save', function (doc) {
  try {
    const { getIO } = require('../config/socket')
    const io = getIO()
    if (io) {
      io.to(doc.recipient.toString()).emit('new_notification', doc)
    }
  } catch (err) {
    // silently ignore if socket is not initialized
  }
})

module.exports = mongoose.model('Notification', notificationSchema)
