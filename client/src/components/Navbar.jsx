import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { House, LogOut, Bell, ChevronDown, User, Shield } from 'lucide-react'
import { io } from 'socket.io-client'
import useAuth from '../hooks/useAuth.jsx'
import notificationService from '../services/notificationService.js'

const Navbar = () => {
  const { user, logout } = useAuth()
  const [menuOpen, setMenuOpen] = useState(false)
  const [notifications, setNotifications] = useState([])
  const [unreadCount, setUnreadCount] = useState(0)
  const [bellOpen, setBellOpen] = useState(false)

  const loadNotifications = async () => {
    if (!user) return
    try {
      const res = await notificationService.getNotifications()
      if (res.success) {
        const unreadList = (res.notifications || []).filter(n => !n.isRead)
        setNotifications(unreadList)
        setUnreadCount(unreadList.length)
      }
    } catch {
      // silently ignore
    }
  }

  useEffect(() => {
    if (!user) return
    loadNotifications()

    // Initialize Socket connection
    const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || import.meta.env.VITE_API_URL || 'http://localhost:5000'
    const token = localStorage.getItem('rentFlatmateToken')
    const socket = io(SOCKET_URL, {
      auth: { token },
      withCredentials: true,
      transports: ['websocket', 'polling']
    })

    socket.on('connect', () => {
      const targetUserId = user.id || user._id
      console.log('[Socket Navbar] Connected, joining user room:', targetUserId)
      socket.emit('join_user_room', targetUserId)
    })

    socket.on('new_notification', (newNotif) => {
      console.log('[Socket Navbar] New notification received:', newNotif)
      setNotifications(prev => [newNotif, ...prev])
      setUnreadCount(prev => prev + 1)
    })

    // Poll as backup every 45 seconds
    const interval = setInterval(loadNotifications, 45000)

    return () => {
      socket.disconnect()
      clearInterval(interval)
    }
  }, [user])

  const handleNotificationClick = async (notif) => {
    setBellOpen(false)
    if (!notif.isRead) {
      // Optimistic UI update: Remove it from active dropdown list
      setNotifications(prev => prev.filter(n => n._id !== notif._id))
      setUnreadCount(prev => Math.max(0, prev - 1))

      try {
        await notificationService.markAsRead(notif._id)
      } catch (err) {
        console.error('[Notification Read Error]', err)
        // Rollback state if server request fails
        loadNotifications()
      }
    }
  }

  const handleMarkAllRead = async () => {
    // Optimistic UI update: Clear the active dropdown list
    setNotifications([])
    setUnreadCount(0)

    try {
      await notificationService.markAllAsRead()
    } catch (err) {
      console.error('[Notification Mark All Read Error]', err)
      // Rollback state if server request fails
      loadNotifications()
    }
  }

  const initials = user?.name
    ? user.name.split(' ').map((n) => n[0]).join('').toUpperCase().slice(0, 2)
    : 'U'

  const roleColor =
    user?.role === 'owner'
      ? 'bg-emerald-100 text-emerald-700'
      : user?.role === 'admin'
      ? 'bg-rose-100 text-rose-700'
      : 'bg-indigo-100 text-indigo-700'

  return (
    <header className="sticky top-0 z-50 border-b border-slate-200 bg-white/95 backdrop-blur-sm shadow-sm shadow-slate-100">
      <div className="mx-auto flex h-16 w-full max-w-[1400px] items-center justify-between px-6 lg:px-8">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-2.5 group">
          <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-indigo-600 to-violet-600 text-white shadow-md shadow-indigo-200 transition-transform group-hover:scale-105">
            <House className="h-4 w-4" />
          </span>
          <span
            className="text-lg font-bold tracking-tight text-slate-900"
            style={{ fontFamily: 'Outfit, sans-serif' }}
          >
            Room<span className="text-indigo-600">Sync</span>
          </span>
        </Link>

        {/* Right side */}
        <div className="flex items-center gap-3">
          {/* Notification bell dropdown */}
          <div className="relative">
            <button
              type="button"
              onClick={() => {
                setBellOpen(!bellOpen)
                setMenuOpen(false)
              }}
              className="relative flex h-9 w-9 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-500 transition hover:bg-slate-50 hover:text-slate-700 cursor-pointer"
            >
              <Bell className="h-4 w-4" />
              {unreadCount > 0 && (
                <span className="absolute -top-1.5 -right-1.5 flex h-4.5 w-4.5 items-center justify-center rounded-full bg-indigo-600 text-[8px] font-black text-white ring-2 ring-white">
                  {unreadCount}
                </span>
              )}
            </button>

            {bellOpen && (
              <div className="absolute right-0 top-full mt-2 w-80 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-xl shadow-slate-200/80 z-50">
                <div className="flex items-center justify-between border-b border-slate-100 px-4 py-3 bg-slate-50/50">
                  <p className="text-[10px] font-bold text-slate-800 uppercase tracking-widest">Notifications</p>
                  {unreadCount > 0 && (
                    <button
                      onClick={handleMarkAllRead}
                      className="text-[10px] font-bold text-indigo-600 hover:text-indigo-700 transition cursor-pointer"
                    >
                      Mark all read
                    </button>
                  )}
                </div>
                <div className="max-h-72 overflow-y-auto divide-y divide-slate-100 scrollbar-thin">
                  {notifications.length === 0 ? (
                    <div className="px-4 py-8 text-center text-xs text-slate-400">
                      No notifications yet.
                    </div>
                  ) : (
                    notifications.map(notif => (
                      <Link
                        key={notif._id}
                        to={notif.link || '/dashboard'}
                        onClick={() => handleNotificationClick(notif)}
                        className={`flex flex-col gap-1 px-4 py-3 transition text-left hover:bg-slate-50/80 ${!notif.isRead ? 'bg-indigo-50/20' : ''}`}
                      >
                        <div className="flex items-start justify-between gap-2">
                          <p className={`text-xs font-bold text-slate-800 ${!notif.isRead ? 'text-indigo-950' : ''}`}>{notif.title}</p>
                          {!notif.isRead && (
                            <span className="h-1.5 w-1.5 rounded-full bg-indigo-500 mt-1.5 shrink-0" />
                          )}
                        </div>
                        <p className="text-[11px] text-slate-500 leading-normal">{notif.content}</p>
                        <span className="text-[9px] text-slate-400 font-medium">
                          {new Date(notif.createdAt).toLocaleDateString('en-IN', {
                            day: 'numeric',
                            month: 'short',
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </span>
                      </Link>
                    ))
                  )}
                </div>
              </div>
            )}
          </div>

          {/* User menu */}
          <div className="relative">
            <button
              type="button"
              onClick={() => {
                setMenuOpen((v) => !v)
                setBellOpen(false)
              }}
              className="flex items-center gap-2.5 rounded-xl border border-slate-200 bg-white px-3 py-2 transition hover:bg-slate-50"
            >
              {/* Avatar */}
              <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-gradient-to-br from-indigo-500 to-violet-500 text-[11px] font-bold text-white">
                {initials}
              </span>
              <span className="hidden flex-col items-start sm:flex">
                <span className="text-sm font-semibold leading-tight text-slate-800">{user?.name}</span>
                <span className={`mt-0.5 rounded px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wider ${roleColor}`}>
                  {user?.role}
                </span>
              </span>
              <ChevronDown className={`h-3.5 w-3.5 text-slate-400 transition-transform ${menuOpen ? 'rotate-180' : ''}`} />
            </button>

            {menuOpen && (
              <div className="absolute right-0 top-full mt-2 w-52 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-xl shadow-slate-200/80">
                <div className="border-b border-slate-100 px-4 py-3">
                  <p className="text-sm font-semibold text-slate-800">{user?.name}</p>
                  <p className="mt-0.5 truncate text-xs text-slate-500">{user?.email}</p>
                </div>
                <div className="p-2">
                  <Link
                    to={user?.role === 'tenant' ? '/dashboard/tenant/profile' : '/dashboard/settings'}
                    onClick={() => setMenuOpen(false)}
                    className="flex items-center gap-2.5 rounded-xl px-3 py-2.5 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
                  >
                    <User className="h-4 w-4 text-slate-400" />
                    My Profile
                  </Link>
                  {user?.role === 'admin' && (
                    <Link
                      to="/admin/dashboard"
                      onClick={() => setMenuOpen(false)}
                      className="flex items-center gap-2.5 rounded-xl px-3 py-2.5 text-sm font-medium text-indigo-600 transition hover:bg-indigo-50"
                    >
                      <Shield className="h-4 w-4 text-indigo-500" />
                      Admin Panel
                    </Link>
                  )}
                  <button
                    type="button"
                    onClick={() => { setMenuOpen(false); logout() }}
                    className="flex w-full items-center gap-2.5 rounded-xl px-3 py-2.5 text-sm font-medium text-rose-600 transition hover:bg-rose-50"
                  >
                    <LogOut className="h-4 w-4" />
                    Sign Out
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  )
}

export default Navbar