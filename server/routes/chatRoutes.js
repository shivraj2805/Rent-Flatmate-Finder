const express = require('express')
const router = express.Router()
const chatController = require('../controllers/chatController')
const { protect } = require('../middleware/authMiddleware')
const validateRequest = require('../middleware/validationMiddleware')
const { sendMessageSchema } = require('../validators/chatValidators')

// Protect all chat endpoints
router.use(protect)

router.get('/', chatController.getChats)
router.get('/:id/messages', chatController.getMessages)
router.post('/:id/messages', validateRequest({ body: sendMessageSchema }), chatController.sendMessage)

// Support root level messages posting (POST /api/messages)
router.post('/messages', validateRequest({ body: sendMessageSchema }), chatController.sendMessage)

module.exports = router
