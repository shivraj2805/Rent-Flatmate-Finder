const { Notification } = require('../models')

/**
 * Fetch recent notifications for logged in user
 */
const getNotifications = async (req, res) => {
  try {
    const notifications = await Notification.find({ recipient: req.user._id })
      .sort({ createdAt: -1 })
      .limit(30)
      .populate('sender', 'name avatar')

    return res.status(200).json({
      success: true,
      notifications,
    })
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message || 'Error fetching notifications',
    })
  }
}

/**
 * Mark a single notification as read
 */
const markAsRead = async (req, res) => {
  try {
    const notification = await Notification.findOneAndUpdate(
      { _id: req.params.id, recipient: req.user._id },
      { isRead: true },
      { returnDocument: 'after' }
    )

    if (!notification) {
      return res.status(404).json({
        success: false,
        message: 'Notification not found',
      })
    }

    return res.status(200).json({
      success: true,
      notification,
    })
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message || 'Error marking notification as read',
    })
  }
}

/**
 * Mark all notifications as read for logged in user
 */
const markAllAsRead = async (req, res) => {
  try {
    await Notification.updateMany(
      { recipient: req.user._id, isRead: false },
      { isRead: true }
    )

    return res.status(200).json({
      success: true,
      message: 'All notifications marked as read',
    })
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message || 'Error marking all notifications as read',
    })
  }
}

module.exports = {
  getNotifications,
  markAsRead,
  markAllAsRead,
}
