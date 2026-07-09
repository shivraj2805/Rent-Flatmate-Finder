const bcrypt = require('bcryptjs')
const User = require('../models/User')
const generateToken = require('../utils/generateToken')

const allowedRegistrationRoles = new Set(['tenant', 'owner'])

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

const validateEmail = (email) => /^\S+@\S+\.\S+$/.test(email)

const validatePassword = (password) => typeof password === 'string' && password.length >= 8

const registerUser = async (req, res, next) => {
  try {
    const { name, email, password, role } = req.body

    if (!name || name.trim().length < 2) {
      res.status(400)
      throw new Error('Name must be at least 2 characters long')
    }

    if (!email || !validateEmail(email)) {
      res.status(400)
      throw new Error('A valid email is required')
    }

    if (!validatePassword(password)) {
      res.status(400)
      throw new Error('Password must be at least 8 characters long')
    }

    if (role && !allowedRegistrationRoles.has(role)) {
      res.status(400)
      throw new Error('Registration role must be tenant or owner')
    }

    const existingUser = await User.findOne({ email: email.toLowerCase().trim() })

    if (existingUser) {
      res.status(409)
      throw new Error('Email is already registered')
    }

    const hashedPassword = await bcrypt.hash(password, 12)

    const user = await User.create({
      name: name.trim(),
      email: email.toLowerCase().trim(),
      password: hashedPassword,
      role: role || 'tenant',
    })

    res.status(201).json({
      success: true,
      message: 'User registered successfully',
      token: generateToken({ id: user._id, role: user.role }),
      user: sanitizeUser(user),
    })
  } catch (error) {
    next(error)
  }
}

const loginUser = async (req, res, next) => {
  try {
    const { email, password } = req.body

    if (!email || !validateEmail(email)) {
      res.status(400)
      throw new Error('A valid email is required')
    }

    if (!password) {
      res.status(400)
      throw new Error('Password is required')
    }

    const user = await User.findOne({ email: email.toLowerCase().trim() }).select('+password')

    if (!user) {
      res.status(401)
      throw new Error('Invalid email or password')
    }

    const passwordMatches = await bcrypt.compare(password, user.password)

    if (!passwordMatches) {
      res.status(401)
      throw new Error('Invalid email or password')
    }

    if (!user.isActive) {
      res.status(403)
      throw new Error('Account is disabled')
    }

    user.lastLoginAt = new Date()
    await user.save()

    res.json({
      success: true,
      message: 'Login successful',
      token: generateToken({ id: user._id, role: user.role }),
      user: sanitizeUser(user),
    })
  } catch (error) {
    next(error)
  }
}

const getMe = async (req, res) => {
  res.json({
    success: true,
    user: sanitizeUser(req.user),
  })
}

const getProtectedDemo = async (req, res) => {
  res.json({
    success: true,
    message: `Hello ${req.user.role}, access granted`,
    user: sanitizeUser(req.user),
  })
}

const getOwnerOnlyDemo = async (req, res) => {
  res.json({
    success: true,
    message: 'Owner access granted',
    user: sanitizeUser(req.user),
  })
}

const getTenantOnlyDemo = async (req, res) => {
  res.json({
    success: true,
    message: 'Tenant access granted',
    user: sanitizeUser(req.user),
  })
}

const getAdminOnlyDemo = async (req, res) => {
  res.json({
    success: true,
    message: 'Admin access granted',
    user: sanitizeUser(req.user),
  })
}

module.exports = {
  registerUser,
  loginUser,
  getMe,
  getProtectedDemo,
  getTenantOnlyDemo,
  getOwnerOnlyDemo,
  getAdminOnlyDemo,
}