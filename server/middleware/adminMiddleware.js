const { protect, authorizeRoles } = require('./authMiddleware')

const requireAdmin = [protect, authorizeRoles('admin')]

module.exports = {
  requireAdmin,
}