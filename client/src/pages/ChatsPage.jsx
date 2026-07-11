import { useEffect, useState, useRef } from 'react'
import { io } from 'socket.io-client'
import {
  MessageSquare, Send, User, Building2, MapPin, Loader2, Sparkles, AlertCircle
} from 'lucide-react'
import chatService from '../services/chatService.js'
import useAuth from '../hooks/useAuth.jsx'

const SOCKET_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000'

const ChatsPage = () => {
  const { user } = useAuth()
  const [chats, setChats] = useState([])
  const [selectedChat, setSelectedChat] = useState(null)
  const [messages, setMessages] = useState([])
  const [newMessage, setNewMessage] = useState('')
  const [loadingChats, setLoadingChats] = useState(true)
  const [loadingMessages, setLoadingMessages] = useState(false)
  const [error, setError] = useState('')
  const [isTyping, setIsTyping] = useState(false)
  const [partnerTyping, setPartnerTyping] = useState(false)

  const socketRef = useRef(null)
  const messagesEndRef = useRef(null)
  const typingTimeoutRef = useRef(null)

  // 1. Initialize Socket.IO connection
  useEffect(() => {
    socketRef.current = io(SOCKET_URL, {
      withCredentials: true,
    })

    socketRef.current.on('connect', () => {
      console.log('[Socket] Connected to server')
    })

    socketRef.current.on('receive_message', (message) => {
      // Append if it belongs to currently selected chat
      setMessages((prev) => {
        const exists = prev.some((m) => m._id === message._id)
        if (exists) return prev
        if (message.chat === selectedChat?._id) {
          return [...prev, message]
        }
        return prev
      })

      // Update last message in chats list
      setChats((prevChats) =>
        prevChats.map((c) =>
          c._id === message.chat
            ? { ...c, lastMessage: message, lastMessageAt: message.createdAt }
            : c
        ).sort((a, b) => new Date(b.lastMessageAt || 0) - new Date(a.lastMessageAt || 0))
      )
    })

    socketRef.current.on('typing', () => {
      setPartnerTyping(true)
    })

    socketRef.current.on('stop_typing', () => {
      setPartnerTyping(false)
    })

    return () => {
      if (socketRef.current) {
        socketRef.current.disconnect()
      }
    }
  }, [selectedChat])

  // 2. Fetch chats list
  const fetchChats = async () => {
    setLoadingChats(true)
    try {
      const response = await chatService.getChats()
      if (response.success) {
        setChats(response.chats || [])
      }
    } catch (err) {
      setError(err?.response?.data?.message || 'Failed to load chats')
    } finally {
      setLoadingChats(false)
    }
  }

  useEffect(() => {
    fetchChats()
  }, [])

  // 3. Select chat and load message history
  const handleSelectChat = async (chat) => {
    if (selectedChat) {
      socketRef.current.emit('leave_room', selectedChat._id)
    }

    setSelectedChat(chat)
    setMessages([])
    setNewMessage('')
    setPartnerTyping(false)
    setLoadingMessages(true)

    // Join room
    socketRef.current.emit('join_room', chat._id)

    try {
      const response = await chatService.getMessages(chat._id)
      if (response.success) {
        setMessages(response.messages || [])
      }
    } catch (err) {
      setError(err?.response?.data?.message || 'Failed to load message history')
    } finally {
      setLoadingMessages(false)
    }
  }

  // 4. Auto scroll message history
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' })
    }
  }, [messages, partnerTyping])

  // 5. Send message
  const handleSendMessage = async (e) => {
    e.preventDefault()
    if (!newMessage.trim() || !selectedChat) return

    const messageText = newMessage
    setNewMessage('')

    // Stop typing immediately on send
    if (socketRef.current) {
      socketRef.current.emit('stop_typing', { roomId: selectedChat._id })
      setIsTyping(false)
    }

    try {
      await chatService.sendMessage(selectedChat._id, messageText)
      // Note: receive_message socket event will catch it and add to state
    } catch (err) {
      setError(err?.response?.data?.message || 'Failed to send message')
    }
  }

  // 6. Handle Typing Status
  const handleKeyPress = () => {
    if (!socketRef.current || !selectedChat) return

    if (!isTyping) {
      setIsTyping(true)
      socketRef.current.emit('typing', {
        roomId: selectedChat._id,
        userName: user?.name,
      })
    }

    // Reset typing timeout
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current)
    }

    typingTimeoutRef.current = setTimeout(() => {
      socketRef.current.emit('stop_typing', { roomId: selectedChat._id })
      setIsTyping(false)
    }, 2000)
  }

  // 7. Get user display partner
  const getChatPartner = (chat) => {
    if (user?._id === chat.tenant?._id) {
      return {
        name: chat.owner?.name || 'Owner',
        email: chat.owner?.email,
        initials: chat.owner?.name ? chat.owner.name.split(' ').map((n) => n[0]).join('').toUpperCase().slice(0, 2) : 'O',
        role: 'owner',
      }
    }
    return {
      name: chat.tenant?.name || 'Tenant',
      email: chat.tenant?.email,
      initials: chat.tenant?.name ? chat.tenant.name.split(' ').map((n) => n[0]).join('').toUpperCase().slice(0, 2) : 'T',
      role: 'tenant',
    }
  }

  return (
    <div className="rounded-3xl border border-slate-200 bg-white shadow-sm overflow-hidden flex flex-col md:flex-row h-[calc(100vh-8rem)]">
      {/* Chats Sidebar (Left Pane) */}
      <div className="w-full md:w-80 border-r border-slate-200 flex flex-col shrink-0 bg-slate-50/50">
        <div className="p-4 border-b border-slate-200 bg-white">
          <h2 className="text-md font-bold text-slate-800 flex items-center gap-2" style={{ fontFamily: 'Outfit, sans-serif' }}>
            <MessageSquare className="h-5 w-5 text-indigo-600" />
            Conversations
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">Chat with matches after interest acceptance</p>
        </div>

        <div className="flex-1 overflow-y-auto p-2 space-y-1">
          {loadingChats ? (
            <div className="flex flex-col items-center justify-center py-12 text-slate-400 space-y-2">
              <Loader2 className="h-6 w-6 animate-spin text-indigo-500" />
              <span className="text-xs">Loading conversations...</span>
            </div>
          ) : chats.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center text-slate-400 px-4">
              <MessageSquare className="h-8 w-8 text-slate-300 strokeWidth={1.5} mb-2" />
              <span className="text-xs font-bold text-slate-500">No active chats yet</span>
              <p className="text-[10px] text-slate-400 mt-1 max-w-xs">
                Chats will automatically unlock once an owner accepts an interest request!
              </p>
            </div>
          ) : (
            chats.map((chat) => {
              const partner = getChatPartner(chat)
              const isSelected = selectedChat?._id === chat._id
              const lastMsgText = chat.lastMessage?.content || 'No messages yet.'
              const lastMsgTime = chat.lastMessageAt
                ? new Date(chat.lastMessageAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                : ''

              return (
                <button
                  key={chat._id}
                  onClick={() => handleSelectChat(chat)}
                  className={`w-full rounded-2xl p-3 flex items-start gap-3 transition text-left cursor-pointer ${
                    isSelected ? 'bg-indigo-50/80 border border-indigo-100/50 shadow-sm' : 'hover:bg-slate-100 border border-transparent'
                  }`}
                >
                  <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-indigo-500 to-violet-500 text-white flex items-center justify-center text-xs font-bold shrink-0">
                    {partner.initials}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-slate-800 truncate leading-tight">
                        {partner.name}
                      </span>
                      {lastMsgTime && (
                        <span className="text-[9px] text-slate-400 font-semibold shrink-0">
                          {lastMsgTime}
                        </span>
                      )}
                    </div>
                    <span className="text-[10px] text-indigo-600 font-medium truncate block leading-tight mt-0.5">
                      Room: {chat.listing?.title}
                    </span>
                    <p className="text-[10px] text-slate-400 truncate mt-1">
                      {lastMsgText}
                    </p>
                  </div>
                </button>
              )
            })
          )}
        </div>
      </div>

      {/* Main Conversation Window (Right Pane) */}
      <div className="flex-1 flex flex-col bg-white">
        {selectedChat ? (
          <>
            {/* Conversation Header */}
            {(() => {
              const partner = getChatPartner(selectedChat)
              const listing = selectedChat.listing || {}
              return (
                <div className="p-4 border-b border-slate-200 flex items-center justify-between shadow-sm bg-slate-50/20">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-indigo-500 to-violet-500 text-white flex items-center justify-center text-xs font-bold shrink-0 shadow-md">
                      {partner.initials}
                    </div>
                    <div>
                      <h3 className="text-xs font-bold text-slate-800 flex items-center gap-1.5" style={{ fontFamily: 'Outfit, sans-serif' }}>
                        {partner.name}
                        <span className="rounded bg-indigo-50 border border-indigo-100 px-1 py-0.5 text-[8px] font-bold uppercase tracking-wider text-indigo-700">
                          {partner.role}
                        </span>
                      </h3>
                      <p className="text-[10px] text-slate-400">{partner.email}</p>
                    </div>
                  </div>

                  {/* Room Details Badge */}
                  <div className="text-right hidden sm:block">
                    <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">Property</span>
                    <p className="text-xs font-bold text-slate-800 line-clamp-1 max-w-[180px]">
                      {listing.title}
                    </p>
                    <p className="text-[10px] text-indigo-600 font-bold">
                      ₹{listing.rent?.toLocaleString()}/mo
                    </p>
                  </div>
                </div>
              )
            })()}

            {/* Message Log */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-slate-50/30">
              {loadingMessages ? (
                <div className="flex flex-col items-center justify-center h-full text-slate-400 space-y-2">
                  <Loader2 className="h-6 w-6 animate-spin text-indigo-500" />
                  <span className="text-xs">Loading messages...</span>
                </div>
              ) : (
                messages.map((msg) => {
                  const isOwn = msg.sender?._id === user?._id || msg.sender === user?._id
                  return (
                    <div
                      key={msg._id}
                      className={`flex ${isOwn ? 'justify-end' : 'justify-start'}`}
                    >
                      <div className={`max-w-[70%] space-y-0.5`}>
                        <div className={`rounded-2xl px-3.5 py-2 text-xs shadow-sm ${
                          isOwn ? 'bg-indigo-600 text-white rounded-br-none' : 'bg-white border border-slate-200 text-slate-800 rounded-bl-none'
                        }`}>
                          <p className="leading-relaxed whitespace-pre-wrap">{msg.content}</p>
                        </div>
                        <span className={`text-[8px] text-slate-400 font-semibold block px-1 ${
                          isOwn ? 'text-right' : 'text-left'
                        }`}>
                          {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>
                    </div>
                  )
                })
              )}

              {/* Partner Typing status */}
              {partnerTyping && (
                <div className="flex justify-start">
                  <div className="max-w-[70%] rounded-2xl px-3.5 py-2 text-[10px] italic bg-slate-100 text-slate-500 border border-slate-200 rounded-bl-none flex items-center gap-1 shadow-sm">
                    <Loader2 className="h-3 w-3 animate-spin text-slate-400" />
                    typing...
                  </div>
                </div>
              )}

              <div ref={messagesEndRef} />
            </div>

            {/* Error Message */}
            {error && (
              <div className="flex items-center gap-2 bg-rose-50 border-t border-rose-100 px-4 py-2 text-xs text-rose-700">
                <AlertCircle className="h-4 w-4 shrink-0 text-rose-500" />
                <span>{error}</span>
              </div>
            )}

            {/* Compose Input Box */}
            <form onSubmit={handleSendMessage} className="p-4 border-t border-slate-200 bg-white flex gap-2">
              <input
                type="text"
                placeholder="Type your message..."
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                onKeyPress={handleKeyPress}
                className="flex-1 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-xs text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100"
              />
              <button
                type="submit"
                disabled={!newMessage.trim()}
                className="flex items-center justify-center rounded-xl bg-indigo-600 hover:bg-indigo-500 px-4.5 text-white transition disabled:opacity-50 cursor-pointer shadow-md shadow-indigo-100"
              >
                <Send className="h-4 w-4" />
              </button>
            </form>
          </>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center text-center p-6 text-slate-400">
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-indigo-50 text-indigo-600 border border-indigo-100 mb-4 animate-bounce">
              <MessageSquare className="h-7 w-7" strokeWidth={1.8} />
            </div>
            <h3 className="text-md font-bold text-slate-700" style={{ fontFamily: 'Outfit, sans-serif' }}>
              Your RoomSync Inbox
            </h3>
            <p className="mt-1.5 text-xs text-slate-400 max-w-xs leading-relaxed">
              Select any matches from the left side pane to start conversing and discussing move-in dates, rules, or room details.
            </p>
          </div>
        )}
      </div>
    </div>
  )
}

export default ChatsPage
