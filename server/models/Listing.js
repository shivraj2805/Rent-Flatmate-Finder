const mongoose = require('mongoose')

const listingSchema = new mongoose.Schema(
  {
    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    title: {
      type: String,
      required: [true, 'Listing title is required'],
      trim: true,
      maxlength: 150,
    },
    description: {
      type: String,
      required: [true, 'Listing description is required'],
      trim: true,
      maxlength: 5000,
    },
    location: {
      type: String,
      required: [true, 'Location is required'],
      trim: true,
      index: true,
    },
    rent: {
      type: Number,
      required: [true, 'Rent is required'],
      min: 0,
      index: true,
    },
    availableFrom: {
      type: Date,
      required: [true, 'Available date is required'],
      index: true,
    },
    roomType: {
      type: String,
      required: [true, 'Room type is required'],
      enum: ['private-room', 'shared-room', 'studio', 'apartment', 'other'],
      index: true,
    },
    genderPreference: {
      type: String,
      enum: ['any', 'male', 'female', 'non-binary', 'couple'],
      default: 'any',
    },
    furnished: {
      type: Boolean,
      default: false,
    },
    amenities: {
      type: [String],
      default: [],
    },
    images: {
      type: [String],
      default: [],
    },
    isActive: {
      type: Boolean,
      default: true,
      index: true,
    },
    compatibilitySummary: {
      topScore: {
        type: Number,
        default: null,
      },
      topExplanation: {
        type: String,
        default: '',
      },
      evaluatedAt: {
        type: Date,
        default: null,
      },
    },
  },
  { timestamps: true },
)

listingSchema.index({ owner: 1, createdAt: -1 })
listingSchema.index({ location: 1, rent: 1, availableFrom: 1 })
listingSchema.index({ title: 'text', description: 'text', location: 'text' })

module.exports = mongoose.model('Listing', listingSchema)