const Joi = require('joi')

const tenantProfileSchema = Joi.object({
  preferredLocations: Joi.array()
    .items(Joi.string().trim().min(1))
    .min(1)
    .required()
    .messages({
      'array.min': 'At least one preferred location is required',
      'any.required': 'Preferred location is required',
    }),
  budgetRange: Joi.object({
    min: Joi.number().min(0).required().messages({
      'number.min': 'Minimum budget must be a positive number',
      'any.required': 'Minimum budget is required',
    }),
    max: Joi.number().min(Joi.ref('min')).required().messages({
      'number.min': 'Maximum budget must be greater than or equal to minimum budget',
      'any.required': 'Maximum budget is required',
    }),
    currency: Joi.string().default('USD'),
  }).required(),
  moveInDate: Joi.date().required().messages({
    'any.required': 'Move-in date is required',
  }),
  roomPreferences: Joi.array().items(Joi.string().trim()).default([]),
  lifestylePreferences: Joi.array().items(Joi.string().trim()).default([]),
  bio: Joi.string().trim().max(1000).allow('').default(''),
  isSearching: Joi.boolean().default(true),
})

module.exports = {
  tenantProfileSchema,
}
