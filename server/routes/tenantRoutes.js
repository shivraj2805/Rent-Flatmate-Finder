const express = require('express')
const { getMyProfile, updateOrCreateProfile } = require('../controllers/tenantController')
const { protect, authorizeRoles } = require('../middleware/authMiddleware')
const validateRequest = require('../middleware/validationMiddleware')
const { tenantProfileSchema } = require('../validators/tenantValidators')

const router = express.Router()

// Root endpoints (mapped via app.use('/api/profile', tenantRoutes))
router.get('/', protect, getMyProfile)
router.put(
  '/',
  protect,
  authorizeRoles('tenant', 'admin'),
  validateRequest({ body: tenantProfileSchema }),
  updateOrCreateProfile
)

// Legacy endpoints (mapped via app.use('/api/tenant', tenantRoutes))
router.get('/profile', protect, getMyProfile)
router.put(
  '/profile',
  protect,
  authorizeRoles('tenant', 'admin'),
  validateRequest({ body: tenantProfileSchema }),
  updateOrCreateProfile
)

module.exports = router
