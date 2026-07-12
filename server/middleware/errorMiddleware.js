const notFound = (req, res, next) => {
  const error = new Error(`Not Found - ${req.originalUrl}`)
  res.status(404)
  next(error)
}

const errorHandler = (error, req, res, next) => {
  void req
  void next

  let statusCode = error.statusCode || res.statusCode
  if (statusCode === 200) {
    statusCode = 500
  }

  // Handle Mongoose cast errors
  if (error.name === 'CastError') {
    statusCode = 400
    error.message = `Invalid format for field: ${error.path}`
  }

  // Handle Mongoose validation errors
  if (error.name === 'ValidationError') {
    statusCode = 400
    const messages = Object.values(error.errors).map((el) => el.message)
    error.message = `Validation failed: ${messages.join(', ')}`
    error.errors = messages
  }

  // Handle MongoDB duplicate key errors
  if (error.code === 11000) {
    statusCode = 409
    const value = error.errmsg.match(/(["'])(\\?.)*?\1/)?.[0] || 'Unknown value'
    error.message = `Duplicate field value: ${value}. Please use another value.`
  }

  // Handle JWT errors
  if (error.name === 'JsonWebTokenError') {
    statusCode = 401
    error.message = 'Invalid authentication token. Please log in again.'
  }
  if (error.name === 'TokenExpiredError') {
    statusCode = 401
    error.message = 'Your login session has expired. Please log in again.'
  }

  res.status(statusCode)
  res.json({
    success: false,
    message: error.message || 'An unexpected error occurred',
    errors: error.errors || [],
    stack: process.env.NODE_ENV === 'production' ? undefined : error.stack,
  })
}

module.exports = {
  notFound,
  errorHandler,
}