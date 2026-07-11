const express = require('express')
const { getMyProfile, updateOrCreateProfile } = require('../controllers/tenantController')
const { protect, authorizeRoles } = require('../middleware/authMiddleware')
const validateRequest = require('../middleware/validationMiddleware')
const { tenantProfileSchema } = require('../utils/tenantSchemas')

const router = express.Router()

// Any logged-in user can check their own tenant profile status
router.get('/profile', protect, getMyProfile)

// Only users with 'tenant' or 'admin' roles can create/update the tenant profile
router.put('/profile', protect, authorizeRoles('tenant', 'admin'), validateRequest(tenantProfileSchema), updateOrCreateProfile)

module.exports = router
