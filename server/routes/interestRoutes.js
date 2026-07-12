const express = require('express')
const {
  createInterestRequest,
  getMyInterests,
  respondToInterest,
} = require('../controllers/interestController')
const { protect, authorizeRoles } = require('../middleware/authMiddleware')
const validateRequest = require('../middleware/validationMiddleware')
const { createInterestSchema, respondInterestSchema } = require('../validators/interestValidators')

const router = express.Router()

// Mount operations
router.post(
  '/',
  protect,
  authorizeRoles('tenant', 'admin'),
  validateRequest({ body: createInterestSchema }),
  createInterestRequest
)

router.get('/', protect, getMyInterests)

// Legacy endpoint
router.patch(
  '/:id/status',
  protect,
  authorizeRoles('owner', 'admin'),
  validateRequest({ body: respondInterestSchema }),
  respondToInterest
)

// RESTful endpoint
router.patch(
  '/:id',
  protect,
  authorizeRoles('owner', 'admin'),
  validateRequest({ body: respondInterestSchema }),
  respondToInterest
)

module.exports = router
