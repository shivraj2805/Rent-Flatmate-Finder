const mongoose = require('mongoose')

const compatibilitySchema = new mongoose.Schema(
  {
    // Existing fields for backward compatibility
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
    // New fields requested
    tenantId: {
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
    },
    strengths: {
      type: [String],
      default: [],
    },
    weaknesses: {
      type: [String],
      default: [],
    },
    scoringBreakdown: {
      budgetScore: { type: Number, required: true },
      locationScore: { type: Number, required: true },
      dateScore: { type: Number, required: true },
      roomTypeScore: { type: Number, required: true },
    },
    llmProvider: {
      type: String,
      default: null,
    },
    scoringMethod: {
      type: String,
      enum: ['LLM', 'Rule-Based'],
      required: true,
      default: 'Rule-Based',
      index: true,
    },
  },
  { timestamps: true },
)

// Ensure compound uniqueness to prevent duplicate records
compatibilitySchema.index({ listing: 1, tenantProfile: 1 }, { unique: true })
compatibilitySchema.index({ listingId: 1, tenantId: 1 }, { unique: true })

// Helper indexes for sorting match requests
compatibilitySchema.index({ tenantProfile: 1, score: -1 })
compatibilitySchema.index({ tenantId: 1, score: -1 })
compatibilitySchema.index({ listingId: 1, score: -1 })

module.exports = mongoose.model('Compatibility', compatibilitySchema)