const authService = require('../services/authService')
const asyncHandler = require('../middleware/asyncHandler')

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

module.exports = {
  registerUser,
  loginUser,
  getMe,
  getProtectedDemo,
  getTenantOnlyDemo,
  getOwnerOnlyDemo,
  getAdminOnlyDemo,
}