const dotenv = require('dotenv')

dotenv.config()

const app = require('./app')
const connectDB = require('./config/db')
const { configureCloudinary } = require('./config/cloudinary')

const PORT = process.env.PORT || 5000

const startServer = async () => {
	await connectDB()
	configureCloudinary()

	app.listen(PORT, () => {
		console.log(`Server running on port ${PORT}`)
	})
}

startServer()
