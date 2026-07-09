const jwt = require('jsonwebtoken')
const User = require('../models/User')

const protect = async (req, res, next) => {
  const authHeader = req.headers.authorization

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    res.status(401)
    return next(new Error('Not authorized, token missing'))
  }

  const token = authHeader.split(' ')[1]

  try {
    if (!process.env.JWT_SECRET) {
      throw new Error('JWT_SECRET is not defined')
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET)
    const user = await User.findById(decoded.id).select('-password')

    if (!user) {
      res.status(401)
      return next(new Error('Not authorized, user not found'))
    }

    if (!user.isActive) {
      res.status(403)
      return next(new Error('Account is disabled'))
    }

    req.user = user
    next()
  } catch (error) {
    res.status(401)
    next(new Error('Not authorized, token invalid'))
  }
}

const authorizeRoles = (...allowedRoles) => {
  return (req, res, next) => {
    if (!req.user) {
      res.status(401)
      return next(new Error('Not authorized'))
    }

    if (!allowedRoles.includes(req.user.role)) {
      res.status(403)
      return next(new Error('Forbidden: insufficient role'))
    }

    next()
  }
}

module.exports = {
  protect,
  authorizeRoles,
}