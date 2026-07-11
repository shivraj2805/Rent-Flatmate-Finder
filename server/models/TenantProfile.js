const mongoose = require('mongoose')

const tenantProfileSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      unique: true,
      index: true,
    },
    preferredLocations: {
      type: [String],
      default: [],
      index: true,
    },
    budgetRange: {
      min: {
        type: Number,
        required: [true, 'Minimum budget is required'],
        min: 0,
      },
      max: {
        type: Number,
        required: [true, 'Maximum budget is required'],
        min: 0,
      },
      currency: {
        type: String,
        default: 'USD',
        trim: true,
      },
    },
    moveInDate: {
      type: Date,
      required: [true, 'Move-in date is required'],
      index: true,
    },
    roomPreferences: {
      type: [String],
      default: [],
    },
    lifestylePreferences: {
      type: [String],
      default: [],
    },
    bio: {
      type: String,
      trim: true,
      maxlength: 1000,
      default: '',
    },
    gender: {
      type: String,
      enum: ['male', 'female', 'other'],
      default: 'other',
      required: [true, 'Gender is required'],
    },
    isSearching: {
      type: Boolean,
      default: true,
      index: true,
    },
  },
  { timestamps: true },
)

tenantProfileSchema.index({ moveInDate: 1, isSearching: 1 })

module.exports = mongoose.model('TenantProfile', tenantProfileSchema)