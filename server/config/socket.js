const socketIo = require('socket.io')
const jwt = require('jsonwebtoken')

let io

// In-memory registry to track online users (userId -> Set of socketIds)
const onlineUsers = new Map()

const initSocket = (server) => {
  io = socketIo(server, {
    cors: {
      origin: process.env.CLIENT_URL || 'http://localhost:5173',
      methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
      credentials: true,
    },
  })

  // Middleware: Authenticate socket connections using JWT
  io.use((socket, next) => {
    const token = socket.handshake.auth?.token || socket.handshake.query?.token

    if (!token) {
      console.warn(`[Socket Auth Warning] Connection rejected: Token missing from socket ${socket.id}`)
      return next(new Error('Authentication error: Token missing'))
    }

    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET)
      socket.user = decoded // contains user { id, role }
      next()
    } catch (err) {
      console.warn(`[Socket Auth Warning] Connection rejected: Invalid token on socket ${socket.id}`)
      return next(new Error('Authentication error: Invalid token'))
    }
  })

  io.on('connection', (socket) => {
    const userId = socket.user.id
    console.log(`[Socket] Authorized connection: User ${userId} connected on socket ${socket.id}`)

    // Track user online status
    if (!onlineUsers.has(userId)) {
      onlineUsers.set(userId, new Set())
    }
    onlineUsers.get(userId).add(socket.id)
    
    // Broadcast user online status change
    io.emit('user_online', { userId })

    // Handler: Join chat room with validation
    socket.on('join_room', async (roomId) => {
      try {
        const Chat = require('../models/Chat')
        const chat = await Chat.findById(roomId).populate('interest')
        
        if (!chat) {
          console.warn(`[Socket] Room join rejected: Chat ${roomId} not found`)
          socket.emit('error', 'Chat room not found')
          return
        }

        // Validate Interest request status is accepted
        if (!chat.interest || chat.interest.status !== 'accepted') {
          console.warn(`[Socket] Room join rejected: Interest request for Chat ${roomId} is not accepted`)
          socket.emit('error', 'Chat is only available for accepted interest requests')
          return
        }

        // Validate user is a participant
        const isParticipant =
          chat.tenant.toString() === userId.toString() ||
          chat.owner.toString() === userId.toString()

        if (!isParticipant) {
          console.warn(`[Socket] Room join rejected: User ${userId} is not a participant in Chat ${roomId}`)
          socket.emit('error', 'Unauthorized to join this chat room')
          return
        }

        socket.join(roomId)
        console.log(`[Socket] Room join accepted: User ${userId} joined room ${roomId}`)
      } catch (err) {
        console.error(`[Socket Room Join Error]`, err.message)
        socket.emit('error', 'Server error joining room')
      }
    })

    // Handler: Join personal room for notification pushes with validation
    socket.on('join_user_room', (targetUserId) => {
      if (String(userId) !== String(targetUserId)) {
        console.warn(`[Socket] Personal room join rejected: User ${userId} tried to join room of ${targetUserId}`)
        socket.emit('error', 'Unauthorized to join personal room')
        return
      }

      socket.join(targetUserId)
      console.log(`[Socket] User joined personal notification room: ${targetUserId}`)
    })

    // Handler: Leave chat room
    socket.on('leave_room', (roomId) => {
      socket.leave(roomId)
      console.log(`[Socket] Socket ${socket.id} left room: ${roomId}`)
    })

    // Handler: Typing Indicator
    socket.on('typing', ({ roomId, userName }) => {
      // Broadcast to other users in the room
      socket.to(roomId).emit('typing', { userName })
    })

    // Handler: Stop Typing Indicator
    socket.on('stop_typing', ({ roomId }) => {
      socket.to(roomId).emit('stop_typing')
    })

    // Handler: Get online users list
    socket.on('get_online_users', (callback) => {
      if (typeof callback === 'function') {
        callback(Array.from(onlineUsers.keys()))
      }
    })

    // Handler: Disconnect cleanup
    socket.on('disconnect', () => {
      console.log(`[Socket] User disconnected: ${socket.id}`)

      if (onlineUsers.has(userId)) {
        const sockets = onlineUsers.get(userId)
        sockets.delete(socket.id)

        if (sockets.size === 0) {
          onlineUsers.delete(userId)
          // Broadcast user offline status globally
          io.emit('user_offline', { userId })
        }
      }
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
