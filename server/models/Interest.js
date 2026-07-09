const mongoose = require('mongoose')

const interestSchema = new mongoose.Schema(
  {
    tenant: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    listing: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Listing',
      required: true,
      index: true,
    },
    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    status: {
      type: String,
      enum: ['pending', 'accepted', 'declined'],
      default: 'pending',
      index: true,
    },
    tenantMessage: {
      type: String,
      trim: true,
      maxlength: 1500,
      default: '',
    },
    ownerResponseMessage: {
      type: String,
      trim: true,
      maxlength: 1500,
      default: '',
    },
    respondedAt: {
      type: Date,
      default: null,
    },
  },
  { timestamps: true },
)

interestSchema.index({ tenant: 1, listing: 1 }, { unique: true })
interestSchema.index({ owner: 1, status: 1, createdAt: -1 })
interestSchema.index({ tenant: 1, status: 1, createdAt: -1 })

module.exports = mongoose.model('Interest', interestSchema)