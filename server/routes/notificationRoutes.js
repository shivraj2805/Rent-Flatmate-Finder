const express = require('express')
const {
  getNotifications,
  markAsRead,
  markAllAsRead,
} = require('../controllers/notificationController')
const { protect } = require('../middleware/authMiddleware')

const router = express.Router()

router.get('/', protect, getNotifications)
router.patch('/:id/read', protect, markAsRead)
router.post('/read-all', protect, markAllAsRead)

module.exports = router
