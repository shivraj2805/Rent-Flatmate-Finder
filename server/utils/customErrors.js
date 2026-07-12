class AppError extends Error {
  constructor(message, statusCode) {
    super(message)
    this.statusCode = statusCode
    this.status = `${statusCode}`.startsWith('4') ? 'fail' : 'error'
    this.isOperational = true

    Error.captureStackTrace(this, this.constructor)
  }
}

class ValidationError extends AppError {
  constructor(message, errors = []) {
    super(message || 'Validation failed', 400)
    this.errors = errors
  }
}

class AuthenticationError extends AppError {
  constructor(message) {
    super(message || 'Authentication failed', 401)
  }
}

class ForbiddenError extends AppError {
  constructor(message) {
    super(message || 'Access denied, forbidden', 403)
  }
}

class NotFoundError extends AppError {
  constructor(message) {
    super(message || 'Resource not found', 404)
  }
}

class ConflictError extends AppError {
  constructor(message) {
    super(message || 'Resource conflict occurred', 409)
  }
}

module.exports = {
  AppError,
  ValidationError,
  AuthenticationError,
  ForbiddenError,
  NotFoundError,
  ConflictError,
}
