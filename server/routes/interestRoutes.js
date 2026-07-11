const express = require('express')
const {
  createInterestRequest,
  getMyInterests,
  respondToInterest,
} = require('../controllers/interestController')
const { protect, authorizeRoles } = require('../middleware/authMiddleware')

const router = express.Router()

// Mount operations
router.post('/', protect, authorizeRoles('tenant', 'admin'), createInterestRequest)
router.get('/', protect, getMyInterests)
router.patch('/:id/status', protect, authorizeRoles('owner', 'admin'), respondToInterest)

module.exports = router
