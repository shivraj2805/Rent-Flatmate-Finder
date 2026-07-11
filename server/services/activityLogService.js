const ActivityLog = require('../models/ActivityLog')

const recordActivity = async ({ action, userId = null, description }) => {
  if (!action || !description) {
    return null
  }

  try {
    return await ActivityLog.create({
      action,
      user: userId || null,
      description: description.trim(),
    })
  } catch (error) {
    console.error('[ActivityLog] Failed to record activity:', error.message)
    return null
  }
}

const getActivity = async (limit = 100) => {
  return ActivityLog.find()
    .populate('user', 'name email role avatar')
    .sort({ createdAt: -1 })
    .limit(Math.min(Math.max(Number(limit) || 100, 1), 500))
}

module.exports = {
  recordActivity,
  getActivity,
}