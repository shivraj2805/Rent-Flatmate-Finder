const express = require('express')
const cors = require('cors')
const helmet = require('helmet')
const rateLimit = require('express-rate-limit')
const authRoutes = require('./routes/authRoutes')
const listingRoutes = require('./routes/listingRoutes')
const tenantRoutes = require('./routes/tenantRoutes')
const interestRoutes = require('./routes/interestRoutes')
const chatRoutes = require('./routes/chatRoutes')
const adminRoutes = require('./routes/adminRoutes')
const notificationRoutes = require('./routes/notificationRoutes')
const { notFound, errorHandler } = require('./middleware/errorMiddleware')

const app = express()

// Global Security Middleware
app.use(helmet())

app.use(
  cors({
    origin: process.env.CLIENT_URL || 'http://localhost:5173',
    credentials: true,
  }),
)
app.use(express.json())
app.use(express.urlencoded({ extended: true }))

app.get('/api/health', (req, res) => {
  res.json({
    success: true,
    message: 'Rent & Flatmate Finder API is running',
  })
})

// Rate limiting for authentication routes
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 registration/login requests per window
  message: {
    message: 'Too many requests from this IP, please try again after 15 minutes',
  },
  standardHeaders: true,
  legacyHeaders: false,
})

app.use('/api/auth', authLimiter, authRoutes)
app.use('/api/listings', listingRoutes)
app.use('/api/tenant', tenantRoutes)
app.use('/api/interests', interestRoutes)
app.use('/api/chats', chatRoutes)
app.use('/api/admin', adminRoutes)
app.use('/api/notifications', notificationRoutes)

app.use(notFound)
app.use(errorHandler)

module.exports = app