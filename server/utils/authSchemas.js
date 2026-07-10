const Joi = require('joi')

const registerSchema = Joi.object({
  name: Joi.string()
    .trim()
    .min(2)
    .max(120)
    .required()
    .messages({
      'string.empty': 'Name cannot be empty',
      'string.min': 'Name must be at least 2 characters long',
    }),
  email: Joi.string()
    .trim()
    .lowercase()
    .email()
    .required()
    .messages({
      'string.empty': 'Email is required',
      'string.email': 'Please provide a valid email address',
    }),
  password: Joi.string()
    .min(8)
    .pattern(new RegExp('^(?=.*[a-zA-Z])(?=.*\\d)')) // at least one letter and one number
    .required()
    .messages({
      'string.empty': 'Password is required',
      'string.min': 'Password must be at least 8 characters long',
      'string.pattern.base': 'Password must contain at least one letter and one number',
    }),
  role: Joi.string()
    .valid('tenant', 'owner')
    .default('tenant')
    .messages({
      'any.only': 'Role must be either tenant or owner',
    }),
})

const loginSchema = Joi.object({
  email: Joi.string()
    .trim()
    .lowercase()
    .email()
    .required()
    .messages({
      'string.empty': 'Email is required',
      'string.email': 'Please provide a valid email address',
    }),
  password: Joi.string()
    .required()
    .messages({
      'string.empty': 'Password is required',
    }),
})

module.exports = {
  registerSchema,
  loginSchema,
}
