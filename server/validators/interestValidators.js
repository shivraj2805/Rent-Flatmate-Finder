const Joi = require('joi')

const createInterestSchema = Joi.object({
  listingId: Joi.string().hex().length(24).required().messages({
    'string.hex': 'Invalid Listing ID format',
    'string.length': 'Listing ID must be 24 hex characters',
    'any.required': 'Listing ID is required',
  }),
  tenantMessage: Joi.string().trim().max(1500).allow('').default(''),
})

const respondInterestSchema = Joi.object({
  status: Joi.string().valid('accepted', 'declined').required().messages({
    'any.only': 'Status must be either accepted or declined',
    'any.required': 'Status is required',
  }),
  responseMessage: Joi.string().trim().max(1500).allow('').default(''),
})

module.exports = {
  createInterestSchema,
  respondInterestSchema,
}
