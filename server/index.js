const dotenv = require('dotenv')

dotenv.config()

const http = require('http')
const app = require('./app')
const connectDB = require('./config/db')
const { configureCloudinary } = require('./config/cloudinary')
const { initSocket } = require('./config/socket')

const PORT = process.env.PORT || 5000

const startServer = async () => {
  await connectDB()
  configureCloudinary()

  const server = http.createServer(app)
  const io = initSocket(server)
  app.set('io', io)

  server.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`)
  })
}

startServer()
