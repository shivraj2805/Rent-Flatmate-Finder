const validateRequest = (schema) => {
  return (req, res, next) => {
    const { error, value } = schema.validate(req.body, {
      abortEarly: false,
      stripUnknown: true,
    })

    if (error) {
      res.status(400)
      const errorMessage = error.details.map((detail) => detail.message).join(', ')
      return next(new Error(errorMessage))
    }

    req.body = value
    next()
  }
}

module.exports = validateRequest
