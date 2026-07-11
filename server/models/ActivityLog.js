const mongoose = require('mongoose')

const activityLogSchema = new mongoose.Schema(
  {
    action: {
      type: String,
      required: [true, 'Activity action is required'],
      trim: true,
      index: true,
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
      index: true,
    },
    description: {
      type: String,
      required: [true, 'Activity description is required'],
      trim: true,
      maxlength: 2000,
    },
  },
  { timestamps: true },
)

activityLogSchema.index({ createdAt: -1 })
activityLogSchema.index({ action: 1, createdAt: -1 })

module.exports = mongoose.model('ActivityLog', activityLogSchema)