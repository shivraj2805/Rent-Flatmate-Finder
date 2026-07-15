const authService = require('../services/authService')
const asyncHandler = require('../middleware/asyncHandler')
const { invalidateUserCache } = require('../middleware/authMiddleware')

const registerUser = asyncHandler(async (req, res) => {
  const result = await authService.register(req.body)

  res.status(201).json({
    success: true,
    message: 'User registered successfully',
    ...result,
  })
})

const loginUser = asyncHandler(async (req, res) => {
  const result = await authService.login(req.body)

  res.json({
    success: true,
    message: 'Login successful',
    ...result,
  })
})

const getMe = asyncHandler(async (req, res) => {
  res.json({
    success: true,
    user: authService.sanitizeUser(req.user),
  })
})

const getProtectedDemo = asyncHandler(async (req, res) => {
  res.json({
    success: true,
    message: `Hello ${req.user.role}, access granted`,
    user: authService.sanitizeUser(req.user),
  })
})

const getOwnerOnlyDemo = asyncHandler(async (req, res) => {
  res.json({
    success: true,
    message: 'Owner access granted',
    user: authService.sanitizeUser(req.user),
  })
})

const getTenantOnlyDemo = asyncHandler(async (req, res) => {
  res.json({
    success: true,
    message: 'Tenant access granted',
    user: authService.sanitizeUser(req.user),
  })
})

const getAdminOnlyDemo = asyncHandler(async (req, res) => {
  res.json({
    success: true,
    message: 'Admin access granted',
    user: authService.sanitizeUser(req.user),
  })
})

const updateProfileUser = asyncHandler(async (req, res) => {
  const user = await authService.updateProfile(req.user._id, req.body)
  invalidateUserCache(req.user._id)

  res.json({
    success: true,
    message: 'Profile updated successfully',
    user,
  })
})

const updatePasswordUser = asyncHandler(async (req, res) => {
  await authService.updatePassword(req.user._id, req.body)
  invalidateUserCache(req.user._id)

  res.json({
    success: true,
    message: 'Password updated successfully',
  })
})

module.exports = {
  registerUser,
  loginUser,
  getMe,
  getProtectedDemo,
  getTenantOnlyDemo,
  getOwnerOnlyDemo,
  getAdminOnlyDemo,
  updateProfileUser,
  updatePasswordUser,
}