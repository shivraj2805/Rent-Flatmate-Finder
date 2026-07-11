const bcrypt = require('bcryptjs')
const User = require('../models/User')
const generateToken = require('../utils/generateToken')

const createError = (message, statusCode) => {
  const error = new Error(message)
  error.statusCode = statusCode
  return error
}

const sanitizeUser = (user) => ({
  id: user._id,
  name: user.name,
  email: user.email,
  role: user.role,
  avatar: user.avatar,
  isActive: user.isActive,
  createdAt: user.createdAt,
  updatedAt: user.updatedAt,
})

const register = async ({ name, email, password, role }) => {
  const normalizedEmail = email.toLowerCase().trim()
  const existingUser = await User.findOne({ email: normalizedEmail })

  if (existingUser) {
    throw createError('Email is already registered', 409)
  }

  // Hash password
  const hashedPassword = await bcrypt.hash(password, 12)

  // Create user
  const user = await User.create({
    name: name.trim(),
    email: normalizedEmail,
    password: hashedPassword,
    role: role || 'tenant',
  })

  return {
    token: generateToken({ id: user._id, role: user.role }),
    user: sanitizeUser(user),
  }
}

const login = async ({ email, password }) => {
  const normalizedEmail = email.toLowerCase().trim()
  const user = await User.findOne({ email: normalizedEmail }).select('+password')

  if (!user) {
    throw createError('Invalid email or password', 401)
  }

  const passwordMatches = await bcrypt.compare(password, user.password)
  if (!passwordMatches) {
    throw createError('Invalid email or password', 401)
  }

  if (!user.isActive) {
    throw createError('Account is disabled', 403)
  }

  // Update last login
  user.lastLoginAt = new Date()
  await user.save()

  return {
    token: generateToken({ id: user._id, role: user.role }),
    user: sanitizeUser(user),
  }
}

const getUserById = async (userId) => {
  const user = await User.findById(userId).select('-password')
  if (!user) {
    throw createError('Not authorized, user not found', 401)
  }
  return sanitizeUser(user)
}

const updateProfile = async (userId, { name, email }) => {
  const user = await User.findById(userId)
  if (!user) {
    throw createError('User not found', 404)
  }

  if (email && email.toLowerCase().trim() !== user.email) {
    const emailExists = await User.findOne({ email: email.toLowerCase().trim() })
    if (emailExists) {
      throw createError('Email is already in use', 409)
    }
    user.email = email.toLowerCase().trim()
  }

  if (name) {
    user.name = name.trim()
  }

  await user.save()
  return sanitizeUser(user)
}

const updatePassword = async (userId, { currentPassword, newPassword }) => {
  const user = await User.findById(userId).select('+password')
  if (!user) {
    throw createError('User not found', 404)
  }

  const isMatch = await bcrypt.compare(currentPassword, user.password)
  if (!isMatch) {
    throw createError('Current password is incorrect', 400)
  }

  user.password = await bcrypt.hash(newPassword, 12)
  await user.save()
  return true
}

module.exports = {
  register,
  login,
  getUserById,
  sanitizeUser,
  updateProfile,
  updatePassword,
}
