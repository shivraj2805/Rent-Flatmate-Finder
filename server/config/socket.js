const socketIo = require('socket.io')

let io

const initSocket = (server) => {
  io = socketIo(server, {
    cors: {
      origin: process.env.CLIENT_URL || 'http://localhost:5173',
      methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
      credentials: true,
    },
  })

  io.on('connection', (socket) => {
    console.log(`[Socket] User connected: ${socket.id}`)

    socket.on('join_room', (roomId) => {
      socket.join(roomId)
      console.log(`[Socket] Socket ${socket.id} joined room: ${roomId}`)
    })

    socket.on('leave_room', (roomId) => {
      socket.leave(roomId)
      console.log(`[Socket] Socket ${socket.id} left room: ${roomId}`)
    })

    socket.on('typing', ({ roomId, userName }) => {
      socket.to(roomId).emit('typing', { userName })
    })

    socket.on('stop_typing', ({ roomId }) => {
      socket.to(roomId).emit('stop_typing')
    })

    socket.on('disconnect', () => {
      console.log(`[Socket] User disconnected: ${socket.id}`)
    })
  })

  return io
}

const getIO = () => {
  if (!io) {
    throw new Error('Socket.io is not initialized!')
  }
  return io
}

module.exports = {
  initSocket,
  getIO,
}
