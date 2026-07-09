const mongoose = require('mongoose')

const compatibilitySchema = new mongoose.Schema(
  {
    listing: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Listing',
      required: true,
      index: true,
    },
    tenantProfile: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'TenantProfile',
      required: true,
      index: true,
    },
    score: {
      type: Number,
      required: true,
      min: 0,
      max: 100,
      index: true,
    },
    explanation: {
      type: String,
      required: true,
      trim: true,
      maxlength: 4000,
    },
    source: {
      type: String,
      enum: ['ai', 'rule-based'],
      required: true,
      default: 'rule-based',
      index: true,
    },
    evaluatedAt: {
      type: Date,
      default: Date.now,
      index: true,
    },
  },
  { timestamps: true },
)

compatibilitySchema.index({ listing: 1, tenantProfile: 1 }, { unique: true })
compatibilitySchema.index({ tenantProfile: 1, score: -1 })
compatibilitySchema.index({ listing: 1, score: -1 })

module.exports = mongoose.model('Compatibility', compatibilitySchema)