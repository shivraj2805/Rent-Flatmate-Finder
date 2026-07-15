const Joi = require('joi')

const registerSchema = Joi.object({
  name: Joi.string()
    .trim()
    .min(2)
    .max(120)
    .pattern(/^[^0-9]+$/)
    .required()
    .messages({
      'string.empty': 'Name cannot be empty',
      'string.min': 'Name must be at least 2 characters long',
      'string.pattern.base': 'Name cannot contain numbers',
      'any.required': 'Name is required',
    }),
  email: Joi.string().trim().lowercase().email().required().messages({
    'string.empty': 'Email is required',
    'string.email': 'Please provide a valid email address',
    'any.required': 'Email is required',
  }),
  password: Joi.string()
    .min(8)
    .pattern(new RegExp('^(?=.*[a-zA-Z])(?=.*\\d)')) // at least one letter and one number
    .required()
    .messages({
      'string.empty': 'Password is required',
      'string.min': 'Password must be at least 8 characters long',
      'string.pattern.base': 'Password must contain at least one letter and one number',
      'any.required': 'Password is required',
    }),
  role: Joi.string().valid('tenant', 'owner').default('tenant').messages({
    'any.only': 'Role must be either tenant or owner',
  }),
})

const loginSchema = Joi.object({
  email: Joi.string().trim().lowercase().email().required().messages({
    'string.empty': 'Email is required',
    'string.email': 'Please provide a valid email address',
    'any.required': 'Email is required',
  }),
  password: Joi.string().required().messages({
    'string.empty': 'Password is required',
    'any.required': 'Password is required',
  }),
})

const updateProfileSchema = Joi.object({
  name: Joi.string()
    .trim()
    .min(2)
    .max(120)
    .pattern(/^[^0-9]+$/)
    .required()
    .messages({
      'string.empty': 'Name cannot be empty',
      'string.min': 'Name must be at least 2 characters long',
      'string.pattern.base': 'Name cannot contain numbers',
      'any.required': 'Name is required',
    }),
  email: Joi.string().trim().lowercase().email().required().messages({
    'string.empty': 'Email is required',
    'string.email': 'Please provide a valid email address',
    'any.required': 'Email is required',
  }),
})

const updatePasswordSchema = Joi.object({
  currentPassword: Joi.string().required().messages({
    'string.empty': 'Current password is required',
    'any.required': 'Current password is required',
  }),
  newPassword: Joi.string()
    .min(8)
    .pattern(new RegExp('^(?=.*[a-zA-Z])(?=.*\\d)')) // at least one letter and one number
    .required()
    .messages({
      'string.empty': 'New password is required',
      'string.min': 'New password must be at least 8 characters long',
      'string.pattern.base': 'New password must contain at least one letter and one number',
      'any.required': 'New password is required',
    }),
})

module.exports = {
  registerSchema,
  loginSchema,
  updateProfileSchema,
  updatePasswordSchema,
}
