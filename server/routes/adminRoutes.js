const express = require('express')
const router = express.Router()
const adminController = require('../controllers/adminController')
const { requireAdmin } = require('../middleware/adminMiddleware')

// Apply admin permissions globally to this router
router.use(requireAdmin)

// Statistics Endpoint
router.get('/dashboard', adminController.getDashboard)
router.get('/stats', adminController.getStats)

// User Management Endpoints
router.get('/users', adminController.getUsers)
router.post('/users/bulk-status', adminController.bulkUpdateUserStatus)
router.post('/users/bulk-delete', adminController.bulkDeleteUsers)
router.get('/users/:id', adminController.getUserById)
router.put('/users/:id/role', adminController.updateUserRole)
router.patch('/users/:id/status', adminController.updateUserStatus)
router.delete('/users/:id', adminController.deleteUser)

// Listing Management Endpoints
router.get('/listings', adminController.getListings)
router.post('/listings/bulk-status', adminController.bulkUpdateListingStatus)
router.post('/listings/bulk-delete', adminController.bulkDeleteListings)
router.get('/listings/:id', adminController.getListingById)
router.patch('/listings/:id/status', adminController.toggleListingStatus)
router.delete('/listings/:id', adminController.deleteListing)

// Reference Lists
router.get('/interests', adminController.getInterests)
router.delete('/interests/:id', adminController.deleteInterest)
router.get('/chats', adminController.getChats)
router.get('/chats/:id/messages', adminController.getChatMessages)
router.delete('/chats/:id', adminController.deleteChat)
router.get('/activity', adminController.getActivity)

module.exports = router
