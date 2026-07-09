const express = require('express')
const {
  registerUser,
  loginUser,
  getMe,
  getProtectedDemo,
  getTenantOnlyDemo,
  getOwnerOnlyDemo,
  getAdminOnlyDemo,
} = require('../controllers/authController')
const { protect, authorizeRoles } = require('../middleware/authMiddleware')

const router = express.Router()

router.post('/register', registerUser)
router.post('/login', loginUser)
router.get('/me', protect, getMe)
router.get('/protected', protect, getProtectedDemo)
router.get('/tenant', protect, authorizeRoles('tenant', 'admin'), getTenantOnlyDemo)
router.get('/owner', protect, authorizeRoles('owner', 'admin'), getOwnerOnlyDemo)
router.get('/admin', protect, authorizeRoles('admin'), getAdminOnlyDemo)

module.exports = router