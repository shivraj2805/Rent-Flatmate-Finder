import { useEffect, useState, useRef } from 'react'
import { io } from 'socket.io-client'
import {
  MessageSquare, Send, User, Building2, MapPin, Loader2, Sparkles, AlertCircle, ChevronLeft, Info, X, CornerUpLeft, MessageCircle
} from 'lucide-react'
import chatService from '../services/chatService.js'
import useAuth from '../hooks/useAuth.jsx'

const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || 'http://localhost:5000'

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
  const [partnerTypingName, setPartnerTypingName] = useState('')
  
  // Real-Time Online Status Tracking
  const [onlineUserIds, setOnlineUserIds] = useState(new Set())

  // Pagination support
  const [hasMoreMessages, setHasMoreMessages] = useState(true)
  const [loadingMore, setLoadingMore] = useState(false)

  // Custom UI layout states
  const [showChatPaneMobile, setShowChatPaneMobile] = useState(false)
  const [showListingInfo, setShowListingInfo] = useState(false)
  const [replyToMessage, setReplyToMessage] = useState(null)

  const socketRef = useRef(null)
  const messagesEndRef = useRef(null)
  const messageContainerRef = useRef(null)
  const typingTimeoutRef = useRef(null)
  
  const selectedChatRef = useRef(null)
  const currentUserId = user?.id || user?._id

  useEffect(() => {
    selectedChatRef.current = selectedChat
  }, [selectedChat])

  // 1. Initialize Socket.IO connection with Auth token
  useEffect(() => {
    const token = localStorage.getItem('rentFlatmateToken')
    socketRef.current = io(SOCKET_URL, {
      auth: { token },
      transports: ['websocket', 'polling']
    })

    socketRef.current.on('connect', () => {
      console.log('[Socket] Connected to server successfully')
      
      // Fetch currently online users registry
      socketRef.current.emit('get_online_users', (list) => {
        setOnlineUserIds(new Set(list))
      })
    })

    // Listen to real-time online status events
    socketRef.current.on('user_online', ({ userId }) => {
      setOnlineUserIds((prev) => {
        const next = new Set(prev)
        next.add(userId)
        return next
      })
    })

    socketRef.current.on('user_offline', ({ userId }) => {
      setOnlineUserIds((prev) => {
        const next = new Set(prev)
        next.delete(userId)
        return next
      })
    })

    socketRef.current.on('receive_message', (message) => {
      // Append message if it belongs to active chat
      if (message.chatId === selectedChatRef.current?._id || message.chat === selectedChatRef.current?._id) {
        setMessages((prev) => {
          const exists = prev.some((m) => m._id === message._id)
          if (exists) return prev
          return [...prev, message]
        })
        
        // Auto scroll to bottom
        setTimeout(() => {
          if (messagesEndRef.current) {
            messagesEndRef.current.scrollIntoView({ behavior: 'smooth' })
          }
        }, 50)
      }

      // Update chats summary inbox list
      setChats((prevChats) =>
        prevChats.map((c) =>
          c._id === message.chatId || c._id === message.chat
            ? { ...c, lastMessage: message, lastMessageAt: message.createdAt }
            : c
        ).sort((a, b) => new Date(b.lastMessageAt || 0) - new Date(a.lastMessageAt || 0))
      )
    })

    socketRef.current.on('typing', ({ userName }) => {
      setPartnerTypingName(userName || 'Partner')
    })

    socketRef.current.on('stop_typing', () => {
      setPartnerTypingName('')
    })

    socketRef.current.on('error', (errMessage) => {
      console.error('[Socket Error Event]', errMessage)
      setError(errMessage)
    })

    return () => {
      if (socketRef.current) {
        socketRef.current.disconnect()
      }
    }
  }, [])

  // 2. Fetch chats list and handle interestId query param auto-selection
  const fetchChats = async () => {
    setLoadingChats(true)
    setError('')
    try {
      const response = await chatService.getChats()
      if (response.success) {
        const chatsList = response.chats || []
        setChats(chatsList)

        // Read query parameter (spawning direct navigation)
        const queryParams = new URLSearchParams(window.location.search)
        const interestIdParam = queryParams.get('interestId')
        
        if (interestIdParam && chatsList.length > 0) {
          const matchingChat = chatsList.find((c) => 
            c.interest?._id === interestIdParam || c.interest === interestIdParam
          )
          if (matchingChat) {
            handleSelectChat(matchingChat)
          }
        }
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
    if (selectedChatRef.current && socketRef.current) {
      socketRef.current.emit('leave_room', selectedChatRef.current._id)
    }

    setSelectedChat(chat)
    setMessages([])
    setNewMessage('')
    setPartnerTypingName('')
    setShowListingInfo(false)
    setReplyToMessage(null)
    setHasMoreMessages(true)
    setShowChatPaneMobile(true)
    setLoadingMessages(true)
    setError('')

    // Join room
    if (socketRef.current) {
      socketRef.current.emit('join_room', chat._id)
    }

    try {
      // Default limit 50 messages
      const response = await chatService.getMessages(chat._id, { limit: 50 })
      if (response.success) {
        const list = response.messages || []
        setMessages(list)
        setHasMoreMessages(list.length === 50)
        
        // Scroll to bottom
        setTimeout(() => {
          if (messagesEndRef.current) {
            messagesEndRef.current.scrollIntoView({ behavior: 'auto' })
          }
        }, 100)
      }
    } catch (err) {
      setError(err?.response?.data?.message || 'Failed to load message history')
    } finally {
      setLoadingMessages(false)
    }
  }

  // 4. Pagination: Load Older Messages
  const handleLoadMore = async () => {
    if (loadingMore || !selectedChat || messages.length === 0) return

    setLoadingMore(true)
    const beforeTimestamp = messages[0].createdAt

    try {
      const response = await chatService.getMessages(selectedChat._id, {
        limit: 50,
        before: beforeTimestamp,
      })

      if (response.success) {
        const olderMessages = response.messages || []
        setMessages((prev) => [...olderMessages, ...prev])
        setHasMoreMessages(olderMessages.length === 50)
      }
    } catch (err) {
      setError(err?.response?.data?.message || 'Failed to load previous messages')
    } finally {
      setLoadingMore(false)
    }
  }

  // 5. Send message
  const handleSendMessage = async (e) => {
    e.preventDefault()
    if (!newMessage.trim() || !selectedChat) return

    const messageText = newMessage
    const replyId = replyToMessage?._id
    
    setNewMessage('')
    setReplyToMessage(null)

    // Stop typing indicator on submit
    if (socketRef.current) {
      socketRef.current.emit('stop_typing', { roomId: selectedChat._id })
      setIsTyping(false)
    }

    try {
      const res = await chatService.sendMessage(selectedChat._id, messageText, replyId)
      
      // Optimistically append local message if not received via socket yet
      if (res.success && res.message) {
        setMessages((prev) => {
          const exists = prev.some((m) => m._id === res.message._id)
          if (exists) return prev
          return [...prev, res.message]
        })
        
        setTimeout(() => {
          if (messagesEndRef.current) {
            messagesEndRef.current.scrollIntoView({ behavior: 'smooth' })
          }
        }, 50)

        // Update chats list
        setChats((prevChats) =>
          prevChats.map((c) =>
            c._id === selectedChat._id
              ? { ...c, lastMessage: res.message, lastMessageAt: res.message.createdAt }
              : c
          ).sort((a, b) => new Date(b.lastMessageAt || 0) - new Date(a.lastMessageAt || 0))
        )
      }
    } catch (err) {
      setError(err?.response?.data?.message || 'Failed to send message')
    }
  }

  // 6. Typing Event Dispatcher
  const handleKeyPress = () => {
    if (!socketRef.current || !selectedChat) return

    if (!isTyping) {
      setIsTyping(true)
      socketRef.current.emit('typing', {
        roomId: selectedChat._id,
        userName: user?.name,
      })
    }

    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current)
    }

    typingTimeoutRef.current = setTimeout(() => {
      if (socketRef.current && selectedChatRef.current) {
        socketRef.current.emit('stop_typing', { roomId: selectedChatRef.current._id })
      }
      setIsTyping(false)
    }, 2000)
  }

  // 7. Get display details of the chat partner
  const getChatPartner = (chat) => {
    const tenantId = chat.tenant?._id || chat.tenant
    const isTenantMe = currentUserId && tenantId && String(currentUserId) === String(tenantId)
    const partnerObj = isTenantMe ? chat.owner : chat.tenant

    return {
      id: partnerObj?._id || partnerObj,
      name: partnerObj?.name || (isTenantMe ? 'Landlord' : 'Tenant'),
      email: partnerObj?.email || '',
      initials: partnerObj?.name ? partnerObj.name.split(' ').map((n) => n[0]).join('').toUpperCase().slice(0, 2) : 'RS',
      role: isTenantMe ? 'owner' : 'tenant',
    }
  }

  return (
    <div className="rounded-3xl border border-slate-200 bg-white shadow-sm overflow-hidden flex h-[calc(100vh-8rem)]">
      {/* Inbox List (Left Sidebar) */}
      <div className={`w-full md:w-80 border-r border-slate-200 flex flex-col shrink-0 bg-slate-50/50 ${
        showChatPaneMobile ? 'hidden md:flex' : 'flex'
      }`}>
        <div className="p-4 border-b border-slate-200 bg-white">
          <h2 className="text-md font-bold text-slate-800 flex items-center gap-2" style={{ fontFamily: 'Outfit, sans-serif' }}>
            <MessageSquare className="h-5 w-5 text-indigo-600 animate-pulse" />
            Conversations
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">Chatting unlocked after interest acceptance</p>
        </div>

        <div className="flex-1 overflow-y-auto p-2 space-y-1">
          {loadingChats ? (
            <div className="flex flex-col items-center justify-center py-12 text-slate-400 space-y-3">
              <Loader2 className="h-6 w-6 animate-spin text-indigo-500" />
              <span className="text-xs font-semibold">Loading conversations...</span>
            </div>
          ) : chats.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-center text-slate-400 px-6 space-y-3">
              <div className="h-12 w-12 rounded-full bg-slate-100 flex items-center justify-center text-slate-300">
                <MessageSquare className="h-6 w-6" />
              </div>
              <span className="text-xs font-black text-slate-700">No active chats yet</span>
              <p className="text-[10px] text-slate-400 leading-normal max-w-[200px]">
                Active conversations will unlock automatically as soon as an owner accepts a match interest request.
              </p>
            </div>
          ) : (
            chats.map((chat) => {
              const partner = getChatPartner(chat)
              const isSelected = selectedChat?.query === chat._id || selectedChat?._id === chat._id
              const isOnline = onlineUserIds.has(String(partner.id))
              const lastMsgText = chat.lastMessage?.message || chat.lastMessage?.content || 'No messages yet.'
              const lastMsgTime = chat.lastMessageAt
                ? new Date(chat.lastMessageAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                : ''

              const isLastMsgFromPartner = chat.lastMessage && String(chat.lastMessage.sender?._id || chat.lastMessage.sender) !== String(currentUserId)
              const isUnread = isLastMsgFromPartner && !isSelected

              return (
                <button
                  key={chat._id}
                  onClick={() => handleSelectChat(chat)}
                  className={`w-full rounded-2xl p-3 flex items-start gap-3 transition text-left cursor-pointer ${
                    isSelected ? 'bg-indigo-50/80 border border-indigo-100/50 shadow-sm' : 'hover:bg-slate-100 border border-transparent'
                  }`}
                >
                  <div className="relative shrink-0">
                    <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-indigo-500 to-violet-500 text-white flex items-center justify-center text-xs font-bold shadow-sm">
                      {partner.initials}
                    </div>
                    {/* Real-time Online status indicator */}
                    {isOnline && (
                      <span className="absolute -bottom-0.5 -right-0.5 h-3.5 w-3.5 rounded-full bg-emerald-500 border-2 border-white" title="Online" />
                    )}
                    {isUnread && (
                      <span className="absolute -top-1 -right-1 h-3 w-3 rounded-full bg-indigo-600 border-2 border-white animate-pulse" />
                    )}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between">
                      <span className={`text-xs truncate leading-tight ${isUnread ? 'font-black text-indigo-950' : 'font-bold text-slate-800'}`}>
                        {partner.name}
                      </span>
                      {lastMsgTime && (
                        <span className={`text-[9px] font-bold shrink-0 ${isUnread ? 'text-indigo-600' : 'text-slate-400'}`}>
                          {lastMsgTime}
                        </span>
                      )}
                    </div>
                    <span className="text-[9px] text-indigo-500 font-bold truncate block leading-tight mt-0.5 uppercase tracking-wider">
                      Room: {chat.listing?.title}
                    </span>
                    <p className={`text-[10px] truncate mt-1 ${isUnread ? 'font-bold text-slate-700' : 'text-slate-400'}`}>
                      {lastMsgText}
                    </p>
                  </div>
                </button>
              )
            })
          )}
        </div>
      </div>

      {/* Main Conversation Chat Log (Right Window) */}
      <div className={`flex-1 flex flex-col bg-white ${
        !showChatPaneMobile ? 'hidden md:flex' : 'flex'
      }`}>
        {selectedChat ? (
          <>
            {/* Header */}
            {(() => {
              const partner = getChatPartner(selectedChat)
              const listing = selectedChat.listing || {}
              const isOnline = onlineUserIds.has(String(partner.id))
              return (
                <div className="p-4 border-b border-slate-200 flex flex-col bg-slate-50/20">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      {/* Mobile Back to Inbox */}
                      <button
                        onClick={() => setShowChatPaneMobile(false)}
                        className="md:hidden p-1.5 -ml-1 text-slate-500 hover:text-slate-700 transition hover:bg-slate-100 rounded-xl"
                      >
                        <ChevronLeft className="h-5 w-5" />
                      </button>

                      <div className="relative shrink-0">
                        <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-indigo-500 to-violet-500 text-white flex items-center justify-center text-xs font-bold shadow-md">
                          {partner.initials}
                        </div>
                        {isOnline && (
                          <span className="absolute -bottom-0.5 -right-0.5 h-3.5 w-3.5 rounded-full bg-emerald-500 border-2 border-white" />
                        )}
                      </div>
                      <div>
                        <h3 className="text-xs font-bold text-slate-800 flex items-center gap-1.5" style={{ fontFamily: 'Outfit, sans-serif' }}>
                          {partner.name}
                          <span className="rounded bg-indigo-50 border border-indigo-100 px-1.5 py-0.5 text-[8px] font-bold uppercase tracking-wider text-indigo-700">
                            {partner.role}
                          </span>
                        </h3>
                        <p className="text-[9px] text-slate-400 flex items-center gap-1">
                          <span className={`h-1.5 w-1.5 rounded-full ${isOnline ? 'bg-emerald-500' : 'bg-slate-300'}`} />
                          {isOnline ? 'Online now' : 'Offline'}
                        </p>
                      </div>
                    </div>

                    {/* Meta info actions */}
                    <div className="flex items-center gap-3">
                      <div className="text-right hidden sm:block">
                        <span className="text-[8px] font-bold text-slate-400 uppercase tracking-widest">Listing context</span>
                        <p className="text-xs font-bold text-slate-800 line-clamp-1 max-w-[180px]">
                          {listing.title}
                        </p>
                      </div>
                      
                      <button
                        onClick={() => setShowListingInfo(!showListingInfo)}
                        className={`p-1.5 rounded-xl border transition cursor-pointer ${
                          showListingInfo ? 'bg-indigo-50 border-indigo-200 text-indigo-600' : 'bg-white border-slate-200 text-slate-400 hover:text-slate-600'
                        }`}
                        title="Toggle context details"
                      >
                        <Info className="h-4.5 w-4.5" />
                      </button>
                    </div>
                  </div>

                  {/* Context Info Overlay */}
                  {showListingInfo && (
                    <div className="mt-3 p-4 rounded-2xl bg-indigo-50/50 border border-indigo-100/50 text-xs text-indigo-900 grid gap-3 sm:grid-cols-3 animate-fadeIn">
                      <div>
                        <span className="text-[9px] font-black text-indigo-400 uppercase tracking-widest block">Monthly Rent</span>
                        <p className="text-sm font-extrabold text-indigo-700 mt-0.5">₹{listing.rent?.toLocaleString()} / mo</p>
                      </div>
                      <div>
                        <span className="text-[9px] font-black text-indigo-400 uppercase tracking-widest block">Room Type</span>
                        <p className="text-xs font-bold text-indigo-800 capitalize mt-0.5">{listing.roomType?.replace('-', ' ')}</p>
                      </div>
                      <div className="sm:col-span-3 pt-2 border-t border-indigo-100/60 flex items-start gap-1">
                        <MapPin className="h-3.5 w-3.5 text-indigo-500 shrink-0 mt-0.5" />
                        <div>
                          <span className="text-[9px] font-black text-indigo-400 uppercase tracking-widest block">Address / Neighborhood</span>
                          <p className="text-xs font-semibold text-indigo-800 mt-0.5">{listing.location}</p>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )
            })()}

            {/* Conversation Log */}
            <div 
              ref={messageContainerRef}
              className="flex-1 overflow-y-auto p-4 space-y-3 bg-slate-50/30 flex flex-col"
            >
              {/* Pagination Load More Button */}
              {hasMoreMessages && (
                <div className="flex justify-center pb-2">
                  <button
                    onClick={handleLoadMore}
                    disabled={loadingMore}
                    className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 px-4 py-2 text-[10px] font-bold text-slate-600 transition shadow-sm disabled:opacity-50 cursor-pointer"
                  >
                    {loadingMore ? (
                      <>
                        <Loader2 className="h-3.5 w-3.5 animate-spin text-slate-400" />
                        Loading old messages...
                      </>
                    ) : (
                      <>
                        <MessageCircle className="h-3.5 w-3.5" />
                        Load previous messages
                      </>
                    )}
                  </button>
                </div>
              )}

              {loadingMessages ? (
                <div className="flex flex-col items-center justify-center flex-1 text-slate-400 space-y-2">
                  <Loader2 className="h-6 w-6 animate-spin text-indigo-500" />
                  <span className="text-xs font-semibold">Loading messages...</span>
                </div>
              ) : messages.length === 0 ? (
                <div className="flex-1 flex flex-col items-center justify-center text-center text-slate-400 p-6 space-y-2.5">
                  <MessageSquare className="h-8 w-8 text-slate-300 strokeWidth={1.5}" />
                  <span className="text-xs font-bold text-slate-600">Start the conversation!</span>
                  <p className="text-[10px] text-slate-400 leading-normal max-w-xs">
                    Send a message to introduce yourself, establish moving parameters, or align on lifestyle preferences.
                  </p>
                </div>
              ) : (
                messages.map((msg) => {
                  const isOwn = String(msg.senderId || msg.sender?._id || msg.sender) === String(currentUserId)
                  const messageBody = msg.message || msg.content
                  const msgTime = msg.timestamp || msg.createdAt

                  return (
                    <div
                      key={msg._id}
                      className={`flex ${isOwn ? 'justify-end' : 'justify-start'}`}
                    >
                      <div className={`max-w-[85%] md:max-w-[70%] flex items-center gap-2 group ${isOwn ? 'flex-row-reverse' : 'flex-row'}`}>
                        <div className="space-y-0.5 flex-1 min-w-0">
                          <div className={`rounded-2xl px-3.5 py-2 text-xs shadow-sm ${
                            isOwn ? 'bg-indigo-600 text-white rounded-br-none' : 'bg-white border border-slate-200 text-slate-800 rounded-bl-none'
                          }`}>
                            {/* Message reply header quote inside bubble */}
                            {msg.replyTo && (
                              <div className={`border-l-4 pl-2 py-1 pr-1.5 mb-1.5 rounded text-[10px] ${
                                isOwn ? 'bg-white/10 border-indigo-200 text-indigo-100' : 'bg-slate-100/70 border-indigo-500 text-slate-600'
                              }`}>
                                <span className={`font-bold block ${isOwn ? 'text-white' : 'text-indigo-950'}`}>
                                  {msg.replyTo.sender?.name || 'User'}
                                </span>
                                <span className="line-clamp-1">{msg.replyTo.message || msg.replyTo.content}</span>
                              </div>
                            )}
                            <p className="leading-relaxed whitespace-pre-wrap">{messageBody}</p>
                          </div>
                          <span className={`text-[8px] text-slate-400 font-bold block px-1 ${
                            isOwn ? 'text-right' : 'text-left'
                          }`}>
                            {new Date(msgTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </span>
                        </div>

                        {/* Reply trigger button */}
                        <button
                          onClick={() => setReplyToMessage(msg)}
                          className="opacity-0 group-hover:opacity-100 text-slate-400 hover:text-indigo-600 transition p-1 hover:bg-slate-100 rounded-lg shrink-0 self-center cursor-pointer"
                          title="Reply to this message"
                        >
                          <CornerUpLeft className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    </div>
                  )
                })
              )}

              {/* Partner Typing status */}
              {partnerTypingName && (
                <div className="flex justify-start">
                  <div className="max-w-[85%] md:max-w-[70%] rounded-2xl px-3.5 py-2 text-[10px] italic bg-slate-100 text-slate-500 border border-slate-200 rounded-bl-none flex items-center gap-2 shadow-sm animate-pulse">
                    <Loader2 className="h-3 w-3 animate-spin text-slate-400" />
                    {partnerTypingName} is typing...
                  </div>
                </div>
              )}

              <div ref={messagesEndRef} />
            </div>

            {/* Error notifications */}
            {error && (
              <div className="flex items-center gap-2 bg-rose-50 border-t border-rose-100 px-4 py-2.5 text-xs text-rose-700 shadow-inner">
                <AlertCircle className="h-4 w-4 shrink-0 text-rose-500" />
                <span className="font-semibold">{error}</span>
              </div>
            )}

            {/* Quoted Message preview panel */}
            {replyToMessage && (
              <div className="bg-slate-50 border-t border-slate-200/80 px-4 py-2.5 text-[11px] flex items-center justify-between gap-4 animate-slideUp">
                <div className="border-l-4 border-indigo-500 pl-2 min-w-0">
                  <p className="font-bold text-indigo-950">
                    Replying to {replyToMessage.sender?.name || (String(replyToMessage.senderId || replyToMessage.sender?._id || replyToMessage.sender) === String(currentUserId) ? 'Myself' : 'Partner')}
                  </p>
                  <p className="text-slate-500 truncate mt-0.5">{replyToMessage.message || replyToMessage.content}</p>
                </div>
                <button
                  type="button"
                  onClick={() => setReplyToMessage(null)}
                  className="text-slate-400 hover:text-slate-600 transition p-1 hover:bg-slate-200/60 rounded-lg cursor-pointer"
                  title="Cancel reply"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            )}

            {/* Message input */}
            <form onSubmit={handleSendMessage} className="p-4 border-t border-slate-200 bg-white flex gap-2">
              <input
                type="text"
                placeholder={replyToMessage ? "Type your reply..." : "Type your message..."}
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
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-indigo-50 text-indigo-650 border border-indigo-100 mb-4 animate-bounce">
              <MessageCircle className="h-7 w-7" strokeWidth={1.8} />
            </div>
            <h3 className="text-md font-bold text-slate-700" style={{ fontFamily: 'Outfit, sans-serif' }}>
              Your RoomSync Inbox
            </h3>
            <p className="mt-1.5 text-xs text-slate-400 max-w-xs leading-relaxed">
              Select an active roommate/owner from the conversations panel to load message logs and coordinate tenancy details.
            </p>
          </div>
        )}
      </div>
    </div>
  )
}

export default ChatsPage
