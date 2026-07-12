const Joi = require('joi')

const sendMessageSchema = Joi.object({
  chatId: Joi.string().hex().length(24).optional().messages({
    'string.hex': 'Invalid Chat ID format',
    'string.length': 'Chat ID must be 24 hex characters',
  }),
  content: Joi.string().trim().max(4000).optional(),
  message: Joi.string().trim().max(4000).optional(),
  replyToId: Joi.string().hex().length(24).allow(null).optional(),
}).or('content', 'message') // Content or message must be present

module.exports = {
  sendMessageSchema,
}
