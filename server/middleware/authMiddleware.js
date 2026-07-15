const jwt = require('jsonwebtoken')
const User = require('../models/User')

// In-memory cache for authenticated users (userId -> { user, cachedAt })
const userCache = new Map()
const CACHE_TTL_MS = 60 * 1000 // Cache user records for 1 minute to reduce DB load

const invalidateUserCache = (userId) => {
  if (userId) {
    userCache.delete(String(userId))
  }
}

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
    
    // Check in-memory cache first
    const now = Date.now()
    const cachedEntry = userCache.get(decoded.id)
    let user

    if (cachedEntry && (now - cachedEntry.cachedAt < CACHE_TTL_MS)) {
      user = cachedEntry.user
    } else {
      user = await User.findById(decoded.id).select('-password')
      if (user) {
        userCache.set(decoded.id, { user, cachedAt: now })
      }
    }

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
  invalidateUserCache,
}