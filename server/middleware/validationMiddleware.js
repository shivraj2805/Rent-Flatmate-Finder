const { ValidationError } = require('../utils/customErrors')

/**
 * Reusable validation middleware using Joi
 * @param {object} schemas - Object containing Joi schemas for body, query, or params
 * @returns {Function} Express middleware function
 */
const validateRequest = (schemas) => {
  return (req, res, next) => {
    const errors = []
    const targets = ['body', 'query', 'params']

    for (const target of targets) {
      if (schemas[target]) {
        const { error, value } = schemas[target].validate(req[target], {
          abortEarly: false,
          stripUnknown: true,
          allowUnknown: true, // Allow custom extra parameters
        })

        if (error) {
          error.details.forEach((detail) => {
            errors.push(detail.message.replace(/"/g, ''))
          })
        } else {
          req[target] = value // Update request fields with validated / parsed values
        }
      }
    }

    if (errors.length > 0) {
      // Pass ValidationError directly to Express error handler
      return next(new ValidationError('Validation failed', errors))
    }

    next()
  }
}

module.exports = validateRequest
