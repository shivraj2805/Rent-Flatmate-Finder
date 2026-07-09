const mongoose = require('mongoose')

const chatSchema = new mongoose.Schema(
  {
    listing: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Listing',
      required: true,
      index: true,
    },
    tenant: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    interest: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Interest',
      required: true,
      unique: true,
      index: true,
    },
    lastMessage: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Message',
      default: null,
    },
    lastMessageAt: {
      type: Date,
      default: null,
      index: true,
    },
    tenantArchived: {
      type: Boolean,
      default: false,
    },
    ownerArchived: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true },
)

chatSchema.index({ tenant: 1, owner: 1, listing: 1 }, { unique: true })
chatSchema.index({ owner: 1, lastMessageAt: -1 })
chatSchema.index({ tenant: 1, lastMessageAt: -1 })

module.exports = mongoose.model('Chat', chatSchema)