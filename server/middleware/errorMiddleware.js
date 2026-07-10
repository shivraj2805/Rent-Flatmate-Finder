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

  res.status(statusCode)
  res.json({
    message: error.message,
    stack: process.env.NODE_ENV === 'production' ? undefined : error.stack,
  })
}

module.exports = {
  notFound,
  errorHandler,
}