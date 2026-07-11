const express = require('express')
const {
  registerUser,
  loginUser,
  getMe,
  getProtectedDemo,
  getTenantOnlyDemo,
  getOwnerOnlyDemo,
  getAdminOnlyDemo,
  updateProfileUser,
  updatePasswordUser,
} = require('../controllers/authController')
const { protect, authorizeRoles } = require('../middleware/authMiddleware')
const validateRequest = require('../middleware/validationMiddleware')
const { registerSchema, loginSchema, updateProfileSchema, updatePasswordSchema } = require('../utils/authSchemas')

const router = express.Router()

router.post('/register', validateRequest(registerSchema), registerUser)
router.post('/login', validateRequest(loginSchema), loginUser)
router.get('/me', protect, getMe)
router.get('/protected', protect, getProtectedDemo)
router.get('/tenant', protect, authorizeRoles('tenant', 'admin'), getTenantOnlyDemo)
router.get('/owner', protect, authorizeRoles('owner', 'admin'), getOwnerOnlyDemo)
router.get('/admin', protect, authorizeRoles('admin'), getAdminOnlyDemo)

// User settings profile and password updates
router.put('/profile', protect, validateRequest(updateProfileSchema), updateProfileUser)
router.put('/password', protect, validateRequest(updatePasswordSchema), updatePasswordUser)

module.exports = router