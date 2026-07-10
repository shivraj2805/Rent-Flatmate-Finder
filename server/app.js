const express = require('express')
const cors = require('cors')
const authRoutes = require('./routes/authRoutes')
const listingRoutes = require('./routes/listingRoutes')
const { notFound, errorHandler } = require('./middleware/errorMiddleware')

const app = express()

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

app.use('/api/auth', authRoutes)
app.use('/api/listings', listingRoutes)

app.use(notFound)
app.use(errorHandler)

module.exports = app