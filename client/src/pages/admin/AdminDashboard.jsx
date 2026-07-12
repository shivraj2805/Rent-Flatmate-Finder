import { useEffect, useMemo, useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import {
  BarChart3,
  Building2,
  CheckCircle2,
  Clock,
  Eye,
  Heart,
  Loader2,
  MessageSquare,
  Shield,
  Trash2,
  UserCog,
  Users,
  X,
  Download,
  Activity,
  Check,
  Ban,
  RefreshCw,
  FileDown,
  Mail,
  Calendar,
  AlertTriangle,
  User,
  ExternalLink,
  MessageCircle,
  Lock,
  Save,
  AlertCircle,
  FolderOpen,
} from 'lucide-react'
import {
  BarChart,
  Bar,
  CartesianGrid,
  Cell,
  Legend,
  Line,
  LineChart,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import adminService from '../../services/adminService.js'
import authService from '../../services/authService.js'
import useAuth from '../../hooks/useAuth.jsx'
import AdminStatCard from '../../components/admin/AdminStatCard.jsx'
import AdminSearchBar from '../../components/admin/AdminSearchBar.jsx'
import AdminPagination from '../../components/admin/AdminPagination.jsx'
import AdminDataTable from '../../components/admin/AdminDataTable.jsx'

const tabs = [
  { key: 'dashboard', label: 'Dashboard', icon: BarChart3 },
  { key: 'users', label: 'Users', icon: Users },
  { key: 'listings', label: 'Listings', icon: Building2 },
  { key: 'interests', label: 'Interest Requests', icon: Heart },
  { key: 'chats', label: 'Chats', icon: MessageSquare },
  { key: 'activity', label: 'Activity Logs', icon: Clock },
  { key: 'settings', label: 'Settings', icon: Shield },
]

const roleColors = ['#4f46e5', '#10b981', '#f97316', '#ef4444']

const getActiveTabFromPath = (pathname) => {
  const segment = pathname.split('/').filter(Boolean).at(-1)
  if (!segment || segment === 'admin') return 'dashboard'
  return tabs.some((tab) => tab.key === segment) ? segment : 'dashboard'
}

const formatDate = (value) => {
  if (!value) return '—'
  return new Date(value).toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

const paginate = (items, page, pageSize) => {
  const totalPages = Math.max(1, Math.ceil(items.length / pageSize))
  const safePage = Math.min(Math.max(1, page), totalPages)
  const start = (safePage - 1) * pageSize
  return { items: items.slice(start, start + pageSize), totalPages, page: safePage }
}

// Sleek Custom Tooltip for Charts
const CustomChartTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div className="rounded-2xl border border-slate-200/50 bg-white/90 p-4 shadow-xl backdrop-blur-md">
        <p className="text-xs font-bold uppercase tracking-wider text-slate-400">{label}</p>
        {payload.map((item, idx) => (
          <p key={idx} className="mt-1 text-sm font-extrabold" style={{ color: item.color || item.fill }}>
            {item.name}: <span className="text-slate-900 font-semibold">{item.value}</span>
          </p>
        ))}
      </div>
    )
  }
  return null
}

// PREMIUM SKELETON LOADERS
const StatCardSkeleton = () => (
  <div className="animate-pulse rounded-2xl border border-slate-200 bg-white p-5 shadow-sm flex items-center justify-between">
    <div className="space-y-3 flex-1">
      <div className="h-3.5 w-1/3 bg-slate-200 rounded" />
      <div className="h-6 w-1/2 bg-slate-300 rounded" />
      <div className="h-3 w-2/3 bg-slate-250 rounded" />
    </div>
    <div className="h-11 w-11 rounded-xl bg-slate-200" />
  </div>
)

const ChartSkeleton = () => (
  <div className="animate-pulse rounded-2xl border border-slate-200 bg-white p-5 shadow-sm space-y-4">
    <div className="h-4 w-1/4 bg-slate-200 rounded" />
    <div className="h-64 bg-slate-50/50 rounded-xl flex items-end justify-between p-6 gap-2">
      <div className="h-20 w-8 bg-slate-200 rounded-t" />
      <div className="h-44 w-8 bg-slate-200 rounded-t" />
      <div className="h-28 w-8 bg-slate-200 rounded-t" />
      <div className="h-56 w-8 bg-slate-200 rounded-t" />
      <div className="h-36 w-8 bg-slate-200 rounded-t" />
      <div className="h-48 w-8 bg-slate-200 rounded-t" />
    </div>
  </div>
)

const TableSkeleton = () => (
  <div className="animate-pulse space-y-4">
    <div className="flex gap-4">
      <div className="h-11 w-1/3 bg-slate-200 rounded-xl" />
      <div className="h-11 w-40 bg-slate-200 rounded-xl" />
    </div>
    <div className="rounded-2xl border border-slate-200 bg-white overflow-hidden shadow-sm">
      <div className="bg-slate-50 h-10 border-b border-slate-200/60" />
      <div className="p-4 space-y-4 divide-y divide-slate-100">
        {[...Array(5)].map((_, i) => (
          <div key={i} className="flex items-center justify-between pt-4 first:pt-0">
            <div className="flex items-center gap-3 w-1/3">
              <div className="h-10 w-10 bg-slate-200 rounded-xl" />
              <div className="space-y-2 flex-1">
                <div className="h-3.5 w-3/4 bg-slate-250 rounded" />
                <div className="h-2 w-1/2 bg-slate-200 rounded" />
              </div>
            </div>
            <div className="h-3 w-1/4 bg-slate-200 rounded" />
            <div className="h-6 w-16 bg-slate-200 rounded-full" />
            <div className="h-8 w-20 bg-slate-200 rounded-lg" />
          </div>
        ))}
      </div>
    </div>
  </div>
)

// DYNAMIC PREMIUM EMPTY STATE COMPONENT
const EmptyState = ({ icon: Icon, title, description, onReset }) => (
  <div className="rounded-3xl border border-dashed border-slate-200 bg-white px-6 py-16 text-center shadow-sm flex flex-col items-center max-w-md mx-auto my-8">
    <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-50 text-slate-400 border border-slate-100 shadow-inner">
      <Icon className="h-7 w-7 stroke-1.25" />
    </div>
    <h3 className="mt-5 text-base font-bold text-slate-900" style={{ fontFamily: 'Outfit, sans-serif' }}>
      {title}
    </h3>
    <p className="mt-2 text-xs leading-relaxed text-slate-500 max-w-xs mx-auto">
      {description}
    </p>
    {onReset && (
      <button
        onClick={onReset}
        className="mt-6 rounded-xl bg-slate-900 hover:bg-slate-800 px-4.5 py-2 text-xs font-bold text-white shadow-sm transition cursor-pointer"
      >
        Reset Active Filters
      </button>
    )}
  </div>
)

// CONNECTION ERROR SCREEN COMPONENT WITH INTERACTIVE RETRY
const ErrorState = ({ message, onRetry }) => (
  <div className="rounded-3xl border border-rose-100 bg-white p-8 text-center shadow-md flex flex-col items-center max-w-xl mx-auto my-12">
    <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-rose-50 text-rose-500 border border-rose-100 animate-bounce">
      <AlertTriangle className="h-8 w-8" />
    </div>
    <h2 className="mt-5 text-xl font-bold text-slate-900" style={{ fontFamily: 'Outfit, sans-serif' }}>
      Platform Sync Failed
    </h2>
    <p className="mt-2 text-sm text-slate-500 max-w-md leading-relaxed">
      We encountered a problem synchronizing with the database: <strong className="text-rose-700 font-semibold">{message}</strong>. Please check your connection or platform status and retry.
    </p>
    <button
      onClick={onRetry}
      className="mt-6 flex items-center gap-2 rounded-xl bg-slate-900 hover:bg-slate-800 px-5 py-3 text-sm font-bold text-white shadow-lg transition cursor-pointer"
    >
      <RefreshCw className="h-4 w-4" />
      Retry Sync
    </button>
  </div>
)

const AdminDashboard = () => {
  const location = useLocation()
  const { user, updateUser } = useAuth()
  const [activeTab, setActiveTab] = useState(getActiveTabFromPath(location.pathname))
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const [dashboard, setDashboard] = useState(null)
  const [users, setUsers] = useState([])
  const [listings, setListings] = useState([])
  const [interests, setInterests] = useState([])
  const [chats, setChats] = useState([])
  const [activity, setActivity] = useState([])

  const [userSearch, setUserSearch] = useState('')
  const [userRoleFilter, setUserRoleFilter] = useState('')
  const [listingSearch, setListingSearch] = useState('')
  const [listingStatusFilter, setListingStatusFilter] = useState('')
  const [interestSearch, setInterestSearch] = useState('')
  const [chatSearch, setChatSearch] = useState('')
  const [activitySearch, setActivitySearch] = useState('')

  const [userPage, setUserPage] = useState(1)
  const [listingPage, setListingPage] = useState(1)
  const [interestPage, setInterestPage] = useState(1)
  const [chatPage, setChatPage] = useState(1)
  const [activityPage, setActivityPage] = useState(1)

  const [selectedEntity, setSelectedEntity] = useState(null)
  const [selectedChat, setSelectedChat] = useState(null)
  const [chatMessages, setChatMessages] = useState([])
  const [chatLoading, setChatLoading] = useState(false)

  // Advanced auditor details sub-navigation
  const [auditorTab, setAuditorTab] = useState('overview')

  // Live polling mode
  const [liveMode, setLiveMode] = useState(false)
  const [isRefreshing, setIsRefreshing] = useState(false)

  // Checkbox selections for bulk actions
  const [selectedUserIds, setSelectedUserIds] = useState([])
  const [selectedListingIds, setSelectedListingIds] = useState([])

  // Profile Info state
  const [profileName, setProfileName] = useState(user?.name || '')
  const [profileEmail, setProfileEmail] = useState(user?.email || '')
  const [profileSaving, setProfileSaving] = useState(false)
  const [profileError, setProfileError] = useState('')
  const [profileSuccess, setProfileSuccess] = useState('')

  // Password state
  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [passwordSaving, setPasswordSaving] = useState(false)
  const [passwordError, setPasswordError] = useState('')
  const [passwordSuccess, setPasswordSuccess] = useState('')

  // TOAST NOTIFICATIONS SYSTEM
  const [toasts, setToasts] = useState([])
  const addToast = (message, type = 'success') => {
    const id = Date.now()
    setToasts(prev => [...prev, { id, message, type }])
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id))
    }, 4500)
  }

  const pageSize = 8

  const loadData = async (silent = false) => {
    if (!silent) setLoading(true)
    else setIsRefreshing(true)
    setError('')

    try {
      const [dashboardRes, usersRes, listingsRes, interestsRes, chatsRes, activityRes] = await Promise.all([
        adminService.getDashboard(),
        adminService.getUsers(),
        adminService.getListings(),
        adminService.getInterests(),
        adminService.getChats(),
        adminService.getActivity({ limit: 150 }),
      ])

      if (dashboardRes.success) setDashboard(dashboardRes)
      if (usersRes.success) setUsers(usersRes.users || [])
      if (listingsRes.success) setListings(listingsRes.listings || [])
      if (interestsRes.success) setInterests(interestsRes.interests || [])
      if (chatsRes.success) setChats(chatsRes.chats || [])
      if (activityRes.success) setActivity(activityRes.activity || [])
      else if (dashboardRes.recentActivity) setActivity(dashboardRes.recentActivity || [])
    } catch (requestError) {
      setError(requestError?.response?.data?.message || 'Failed to sync platform records.')
    } finally {
      setLoading(false)
      setIsRefreshing(false)
    }
  }

  useEffect(() => {
    setActiveTab(getActiveTabFromPath(location.pathname))
  }, [location.pathname])

  useEffect(() => {
    loadData()
  }, [])

  // Sync settings inputs when user details are retrieved/updated
  useEffect(() => {
    if (user) {
      setProfileName(user.name || '')
      setProfileEmail(user.email || '')
    }
  }, [user])

  // Live Mode polling loop
  useEffect(() => {
    if (!liveMode) return
    const interval = setInterval(() => {
      loadData(true)
    }, 5000)
    return () => clearInterval(interval)
  }, [liveMode])

  // Clear selections when tab changes
  useEffect(() => {
    setSelectedUserIds([])
    setSelectedListingIds([])
  }, [activeTab])

  const refresh = async (message = '') => {
    if (message) {
      addToast(message, 'success')
    }
    await loadData(true)
  }

  // Settings Handlers
  const handleProfileSubmit = async (e) => {
    e.preventDefault()
    setProfileError('')
    setProfileSuccess('')

    if (!profileName.trim()) {
      setProfileError('Name cannot be empty')
      return
    }

    if (!profileEmail.trim()) {
      setProfileError('Email cannot be empty')
      return
    }

    setProfileSaving(true)
    try {
      const response = await authService.updateProfile({ name: profileName, email: profileEmail })
      if (response.success) {
        setProfileSuccess(response.message || 'Profile details updated!')
        addToast('Profile details updated successfully', 'success')
        updateUser(response.user)
      }
    } catch (err) {
      setProfileError(err?.response?.data?.message || 'Failed to update profile')
      addToast('Profile update failed', 'error')
    } finally {
      setProfileSaving(false)
    }
  }

  const handlePasswordSubmit = async (e) => {
    e.preventDefault()
    setPasswordError('')
    setPasswordSuccess('')

    if (!currentPassword) {
      setPasswordError('Current password is required')
      return
    }

    if (newPassword.length < 8) {
      setPasswordError('New password must be at least 8 characters long')
      return
    }

    if (newPassword !== confirmPassword) {
      setPasswordError('New passwords do not match')
      return
    }

    setPasswordSaving(true)
    try {
      const response = await authService.updatePassword({ currentPassword, newPassword })
      if (response.success) {
        setPasswordSuccess(response.message || 'Password changed successfully!')
        addToast('Password changed successfully', 'success')
        setCurrentPassword('')
        setNewPassword('')
        setConfirmPassword('')
      }
    } catch (err) {
      setPasswordError(err?.response?.data?.message || 'Failed to update password')
      addToast('Password update failed', 'error')
    } finally {
      setPasswordSaving(false)
    }
  }

  // Bulk Operations
  const handleBulkUserStatus = async (isActive) => {
    const actionText = isActive ? 'unblock' : 'block'
    if (!window.confirm(`Are you sure you want to bulk ${actionText} ${selectedUserIds.length} users?`)) return
    try {
      const response = await adminService.bulkUpdateUserStatus(selectedUserIds, isActive)
      if (response.success) {
        setSelectedUserIds([])
        await refresh(response.message || `Successfully bulk ${actionText}ed users.`)
      }
    } catch (requestError) {
      addToast(requestError?.response?.data?.message || 'Failed to bulk update users status', 'error')
    }
  }

  const handleBulkDeleteUsers = async () => {
    if (!window.confirm(`DANGER! Delete ${selectedUserIds.length} users? This permanently deletes their accounts, listings, chats, and profiles!`)) return
    try {
      const response = await adminService.bulkDeleteUsers(selectedUserIds)
      if (response.success) {
        setSelectedUserIds([])
        await refresh(response.message || 'Successfully bulk deleted users.')
      }
    } catch (requestError) {
      addToast(requestError?.response?.data?.message || 'Failed to bulk delete users', 'error')
    }
  }

  const handleBulkListingStatus = async (isActive) => {
    const actionText = isActive ? 'activate' : 'deactivate'
    if (!window.confirm(`Are you sure you want to bulk ${actionText} ${selectedListingIds.length} listings?`)) return
    try {
      const response = await adminService.bulkUpdateListingStatus(selectedListingIds, isActive)
      if (response.success) {
        setSelectedListingIds([])
        await refresh(response.message || `Successfully bulk ${actionText}d listings.`)
      }
    } catch (requestError) {
      addToast(requestError?.response?.data?.message || 'Failed to update listings status', 'error')
    }
  }

  const handleBulkDeleteListings = async () => {
    if (!window.confirm(`Are you sure you want to bulk delete ${selectedListingIds.length} listings?`)) return
    try {
      const response = await adminService.bulkDeleteListings(selectedListingIds)
      if (response.success) {
        setSelectedListingIds([])
        await refresh(response.message || 'Successfully bulk deleted listings.')
      }
    } catch (requestError) {
      addToast(requestError?.response?.data?.message || 'Failed to delete listings', 'error')
    }
  }

  // Single entity actions
  const handleUpdateUserRole = async (userId, role) => {
    try {
      const response = await adminService.updateUserRole(userId, role)
      if (response.success) await refresh(response.message)
    } catch (requestError) {
      addToast(requestError?.response?.data?.message || 'Failed to update user role', 'error')
    }
  }

  const handleToggleUserStatus = async (userId, currentStatus) => {
    try {
      const response = await adminService.updateUserStatus(userId, !currentStatus)
      if (response.success) await refresh(response.message)
    } catch (requestError) {
      addToast(requestError?.response?.data?.message || 'Failed to update user status', 'error')
    }
  }

  const handleDeleteUser = async (userId, name) => {
    if (!window.confirm(`Delete ${name}? This removes the account, listings, interests, and chats.`)) return
    try {
      const response = await adminService.deleteUser(userId)
      if (response.success) await refresh(response.message)
    } catch (requestError) {
      addToast(requestError?.response?.data?.message || 'Failed to delete user', 'error')
    }
  }

  const handleToggleListing = async (listingId, currentActive) => {
    try {
      const response = await adminService.toggleListingStatus(listingId, !currentActive)
      if (response.success) await refresh(response.message)
    } catch (requestError) {
      addToast(requestError?.response?.data?.message || 'Failed to update listing status', 'error')
    }
  }

  const handleDeleteListing = async (listingId, title) => {
    if (!window.confirm(`Delete listing "${title}"? Images, interests, and chats will also be removed.`)) return
    try {
      const response = await adminService.deleteListing(listingId)
      if (response.success) await refresh(response.message)
    } catch (requestError) {
      addToast(requestError?.response?.data?.message || 'Failed to delete listing', 'error')
    }
  }

  const handleDeleteInterest = async (interestId) => {
    if (!window.confirm('Delete this interest request?')) return
    try {
      const response = await adminService.deleteInterest(interestId)
      if (response.success) await refresh(response.message)
    } catch (requestError) {
      addToast(requestError?.response?.data?.message || 'Failed to delete interest request', 'error')
    }
  }

  const handleDeleteChat = async (chatId) => {
    if (!window.confirm('Delete this chat and all its messages?')) return
    try {
      const response = await adminService.deleteChat(chatId)
      if (response.success) await refresh(response.message)
    } catch (requestError) {
      addToast(requestError?.response?.data?.message || 'Failed to delete chat', 'error')
    }
  }

  const openChatHistory = async (chat) => {
    setSelectedChat(chat)
    setChatMessages([])
    setChatLoading(true)
    try {
      const response = await adminService.getChatMessages(chat._id)
      if (response.success) setChatMessages(response.messages || [])
    } catch (requestError) {
      addToast(requestError?.response?.data?.message || 'Failed to load chat history', 'error')
    } finally {
      setChatLoading(false)
    }
  }

  // CSV Exporter helper
  const handleExportCSV = (type) => {
    let headers = []
    let data = []
    let filename = `roomsync_${type}_export_${Date.now()}.csv`

    if (type === 'users') {
      headers = ['ID', 'Name', 'Email', 'Role', 'Status', 'CreatedAt']
      data = filteredUsers.map(u => ({
        ID: u._id,
        Name: u.name,
        Email: u.email,
        Role: u.role,
        Status: u.isActive ? 'Active' : 'Blocked',
        CreatedAt: new Date(u.createdAt).toISOString()
      }))
    } else if (type === 'listings') {
      headers = ['ID', 'Title', 'Location', 'Rent', 'Owner', 'Status', 'CreatedAt']
      data = filteredListings.map(l => ({
        ID: l._id,
        Title: l.title,
        Location: l.location,
        Rent: l.rent,
        Owner: l.owner?.name || 'Unknown',
        Status: l.status === 'filled' ? 'Filled' : l.isActive ? 'Active' : 'Hidden',
        CreatedAt: new Date(l.createdAt).toISOString()
      }))
    } else if (type === 'interests') {
      headers = ['ID', 'Tenant', 'TenantEmail', 'Owner', 'Listing', 'Score', 'Status', 'CreatedAt']
      data = filteredInterests.map(i => ({
        ID: i._id,
        Tenant: i.tenant?.name || '',
        TenantEmail: i.tenant?.email || '',
        Owner: i.owner?.name || '',
        Listing: i.listing?.title || '',
        Score: i.compatibility?.score ?? '',
        Status: i.status,
        CreatedAt: new Date(i.createdAt).toISOString()
      }))
    } else if (type === 'chats') {
      headers = ['ID', 'Owner', 'Tenant', 'Listing', 'LastMessage', 'LastActive']
      data = filteredChats.map(c => ({
        ID: c._id,
        Owner: c.owner?.name || '',
        Tenant: c.tenant?.name || '',
        Listing: c.listing?.title || '',
        LastMessage: c.lastMessage?.content || '',
        LastActive: new Date(c.lastMessageAt || c.updatedAt).toISOString()
      }))
    } else if (type === 'activity') {
      headers = ['ID', 'Action', 'Description', 'User', 'Role', 'CreatedAt']
      data = filteredActivity.map(a => ({
        ID: a._id,
        Action: a.action,
        Description: a.description,
        User: a.user?.name || 'System',
        Role: a.user?.role || 'system',
        CreatedAt: new Date(a.createdAt).toISOString()
      }))
    }

    if (!data.length) {
      addToast('No data available for CSV export', 'warning')
      return
    }

    addToast(`Preparing CSV export for ${type}...`, 'info')

    const csvRows = []
    csvRows.push(headers.join(','))
    for (const item of data) {
      const values = headers.map(header => {
        const val = item[header]
        const escaped = ('' + (val ?? '')).replace(/"/g, '""')
        return `"${escaped}"`
      })
      csvRows.push(values.join(','))
    }

    const blob = new Blob([csvRows.join('\n')], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.setAttribute('href', url)
    link.setAttribute('download', filename)
    link.style.visibility = 'hidden'
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)

    addToast(`${type.toUpperCase()} exported to CSV successfully!`, 'success')
  }

  // Export Chat Transcript as .txt
  const handleExportChatTranscript = () => {
    if (!selectedChat || chatMessages.length === 0) return
    const transcript = chatMessages.map(m => {
      const sender = m.sender?.name || 'Unknown'
      const time = formatDate(m.createdAt)
      return `[${time}] ${sender}: ${m.content}`
    }).join('\n\n')

    const blob = new Blob([`Chat Transcript: ${selectedChat.listing?.title || 'Conversation'}\nBetween ${selectedChat.owner?.name} & ${selectedChat.tenant?.name}\n\n${transcript}`], { type: 'text/plain;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.setAttribute('href', url)
    link.setAttribute('download', `chat_transcript_${selectedChat._id}.txt`)
    link.style.visibility = 'hidden'
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    addToast('Chat transcript saved successfully!', 'success')
  }

  // Filtering calculations
  const filteredUsers = useMemo(() => users.filter((user) => {
    const matchesSearch =
      user.name?.toLowerCase().includes(userSearch.toLowerCase()) ||
      user.email?.toLowerCase().includes(userSearch.toLowerCase())
    const matchesRole = !userRoleFilter || user.role === userRoleFilter
    return matchesSearch && matchesRole
  }), [users, userSearch, userRoleFilter])

  const filteredListings = useMemo(() => listings.filter((listing) => {
    const matchesSearch =
      listing.title?.toLowerCase().includes(listingSearch.toLowerCase()) ||
      listing.location?.toLowerCase().includes(listingSearch.toLowerCase())
    const matchesStatus =
      !listingStatusFilter ||
      (listingStatusFilter === 'active' && listing.isActive && listing.status === 'active') ||
      (listingStatusFilter === 'filled' && listing.status === 'filled') ||
      (listingStatusFilter === 'hidden' && !listing.isActive)
    return matchesSearch && matchesStatus
  }), [listings, listingSearch, listingStatusFilter])

  const filteredInterests = useMemo(() => interests.filter((interest) => {
    const matchesSearch =
      interest.tenant?.name?.toLowerCase().includes(interestSearch.toLowerCase()) ||
      interest.owner?.name?.toLowerCase().includes(interestSearch.toLowerCase()) ||
      interest.listing?.title?.toLowerCase().includes(interestSearch.toLowerCase())
    return matchesSearch
  }), [interests, interestSearch])

  const filteredChats = useMemo(() => chats.filter((chat) => {
    const matchesSearch =
      chat.tenant?.name?.toLowerCase().includes(chatSearch.toLowerCase()) ||
      chat.owner?.name?.toLowerCase().includes(chatSearch.toLowerCase()) ||
      chat.listing?.title?.toLowerCase().includes(chatSearch.toLowerCase())
    return matchesSearch
  }), [chats, chatSearch])

  const filteredActivity = useMemo(() => activity.filter((log) => {
    const matchesSearch =
      log.action?.toLowerCase().includes(activitySearch.toLowerCase()) ||
      log.description?.toLowerCase().includes(activitySearch.toLowerCase()) ||
      log.user?.name?.toLowerCase().includes(activitySearch.toLowerCase())
    return matchesSearch
  }), [activity, activitySearch])

  const userPagination = paginate(filteredUsers, userPage, pageSize)
  const listingPagination = paginate(filteredListings, listingPage, pageSize)
  const interestPagination = paginate(filteredInterests, interestPage, pageSize)
  const chatPagination = paginate(filteredChats, chatPage, pageSize)
  const activityPagination = paginate(filteredActivity, activityPage, pageSize)

  useEffect(() => setUserPage(1), [userSearch, userRoleFilter])
  useEffect(() => setListingPage(1), [listingSearch, listingStatusFilter])
  useEffect(() => setInterestPage(1), [interestSearch])
  useEffect(() => setChatPage(1), [chatSearch])
  useEffect(() => setActivityPage(1), [activitySearch])

  // Auditor items counts
  const userAuditorListings = useMemo(() => {
    if (!selectedEntity || selectedEntity.type !== 'user') return []
    return listings.filter(l => l.owner?._id === selectedEntity.data._id)
  }, [selectedEntity, listings])

  const userAuditorInterests = useMemo(() => {
    if (!selectedEntity || selectedEntity.type !== 'user') return []
    return interests.filter(i => i.tenant?._id === selectedEntity.data._id || i.owner?._id === selectedEntity.data._id)
  }, [selectedEntity, interests])

  const listingAuditorInterests = useMemo(() => {
    if (!selectedEntity || selectedEntity.type !== 'listing') return []
    return interests.filter(i => i.listing?._id === selectedEntity.data._id)
  }, [selectedEntity, interests])

  const stats = dashboard || {
    users: { total: 0, tenants: 0, owners: 0, admins: 0 },
    listings: { total: 0, active: 0, filled: 0, inactive: 0 },
    interests: { total: 0, pending: 0, accepted: 0, declined: 0, successRate: 0 },
    chats: { total: 0 },
    messages: { total: 0 },
    charts: { usersByRole: [], listingsByLocation: [], monthlyRegistrations: [], monthlyListings: [], listingStatus: [] },
    recentActivity: [],
  }

  const selectedType = selectedEntity?.type || ''
  const selectedData = selectedEntity?.data || null

  // RENDER INTERACTION ERROR STATE SCREEN
  if (error && !dashboard) {
    return (
      <div className="space-y-6 pb-20">
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-slate-950 via-indigo-950 to-slate-900 p-6 text-white shadow-xl">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,_rgba(99,102,241,0.15),_transparent_45%)]" />
          <h1 className="text-3xl font-bold tracking-tight relative z-10" style={{ fontFamily: 'Outfit, sans-serif' }}>
            Platform Control Center
          </h1>
        </div>
        <ErrorState message={error} onRetry={() => loadData(false)} />
      </div>
    )
  }

  return (
    <div className="space-y-6 pb-20">
      {/* Sleek Gradient Header with Live monitoring and Refresh options */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-slate-950 via-indigo-950 to-slate-900 p-6 text-white shadow-xl">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,_rgba(99,102,241,0.15),_transparent_45%)]" />
        <div className="relative z-10 flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-indigo-300">
              <Shield className="h-4 w-4 animate-pulse text-indigo-400" />
              Admin Control Center
            </div>
            <h1 className="mt-2 text-3xl font-bold tracking-tight" style={{ fontFamily: 'Outfit, sans-serif' }}>
              Rent & Flatmate Finder Admin
            </h1>
            <p className="mt-1 max-w-2xl text-sm text-slate-300">
              Manage platform operations, audit users, review compatibility ratings, and track live activities.
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            {/* Live Monitoring Pulse Toggle */}
            <button
              onClick={() => setLiveMode(!liveMode)}
              className={`flex items-center gap-2 rounded-xl px-4 py-2.5 text-xs font-bold uppercase tracking-wider transition duration-300 ${liveMode ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 shadow-emerald-500/10 shadow-lg' : 'bg-white/10 hover:bg-white/15 text-slate-300 border border-transparent'}`}
            >
              <span className={`h-2.5 w-2.5 rounded-full ${liveMode ? 'bg-emerald-400 animate-ping' : 'bg-slate-400'}`} />
              {liveMode ? 'Live Mode Active' : 'Enable Live Mode'}
            </button>

            {/* Quick manual refresh */}
            <button
              type="button"
              disabled={isRefreshing}
              onClick={() => refresh('Data refreshed')}
              className="flex items-center justify-center gap-2 rounded-xl border border-white/20 bg-white/10 px-4 py-2.5 text-xs font-bold uppercase tracking-wider text-white transition hover:bg-white/20 disabled:opacity-50 cursor-pointer"
            >
              <RefreshCw className={`h-4.5 w-4.5 ${isRefreshing ? 'animate-spin' : ''}`} />
              Refresh
            </button>
          </div>
        </div>
      </div>

      {/* RENDER SKELETON SCREENS ON MOUNT */}
      {loading && !dashboard ? (
        <>
          {/* Stat Cards Skeleton */}
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-5">
            {[...Array(5)].map((_, idx) => (
              <StatCardSkeleton key={idx} />
            ))}
          </div>

          {/* Navigation Bar Skeleton */}
          <div className="flex flex-wrap gap-1 rounded-2xl border border-slate-200 bg-white p-1.5 shadow-sm">
            {tabs.map((tab) => (
              <div key={tab.key} className="h-10 w-28 bg-slate-100 rounded-xl animate-pulse" />
            ))}
          </div>

          {/* Active Tab Content Skeleton */}
          {activeTab === 'dashboard' ? (
            <div className="grid gap-6 xl:grid-cols-2">
              <ChartSkeleton />
              <ChartSkeleton />
            </div>
          ) : (
            <TableSkeleton />
          )}
        </>
      ) : (
        <>
          {/* Stat Cards with Glow */}
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-5">
            <AdminStatCard label="Total Users" value={stats.users.total} icon={Users} tone="indigo" sublabel={`${stats.users.tenants} tenants · ${stats.users.owners} owners`} />
            <AdminStatCard label="Total Listings" value={stats.listings.total} icon={Building2} tone="violet" sublabel={`${stats.listings.active} active · ${stats.listings.filled} filled`} />
            <AdminStatCard label="Interest Requests" value={stats.interests.total} icon={Heart} tone="rose" sublabel={`${stats.interests.accepted} accepted · ${stats.interests.pending} pending`} />
            <AdminStatCard label="Total Chats" value={stats.chats.total} icon={MessageSquare} tone="emerald" sublabel={`${stats.messages.total} messages total`} />
            <AdminStatCard label="Conversion Rate" value={`${stats.interests.successRate}%`} icon={CheckCircle2} tone="amber" sublabel="Accepted requests rate" />
          </div>

          {/* Premium animated tab navigation switcher */}
          <div className="flex flex-wrap gap-1 rounded-2xl border border-slate-200 bg-white p-1.5 shadow-sm">
            {tabs.map(({ key, label, icon: Icon }) => (
              <Link
                key={key}
                to={`/admin/${key}`}
                onClick={() => setActiveTab(key)}
                className={`relative inline-flex items-center gap-2 rounded-xl px-4 py-2.5 text-xs font-bold uppercase tracking-wider transition ${activeTab === key ? 'text-white' : 'text-slate-600 hover:bg-slate-50'}`}
              >
                {activeTab === key && (
                  <motion.div
                    layoutId="activeTabIndicator"
                    className="absolute inset-0 rounded-xl bg-slate-900 shadow-sm"
                    transition={{ type: 'spring', stiffness: 350, damping: 28 }}
                    style={{ zIndex: 0 }}
                  />
                )}
                <span className="relative z-10 flex items-center gap-2">
                  <Icon className="h-4 w-4" />
                  {label}
                </span>
              </Link>
            ))}
          </div>

          {/* Switch tab wrapper with framer-motion AnimatePresence */}
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              transition={{ duration: 0.2 }}
              className="space-y-6"
            >
              {activeTab === 'dashboard' && (
                <div className="space-y-6">
                  {/* Recharts Graphs */}
                  <div className="grid gap-6 xl:grid-cols-2">
                    {/* Users by role Pie chart with gradients */}
                    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                      <h2 className="text-sm font-bold uppercase tracking-wider text-slate-700">Users by Role</h2>
                      <div className="mt-4 h-72">
                        <ResponsiveContainer width="100%" height="100%">
                          <PieChart>
                            <Pie
                              data={stats.charts.usersByRole}
                              dataKey="count"
                              nameKey="role"
                              outerRadius={95}
                              innerRadius={60}
                              paddingAngle={4}
                            >
                              {stats.charts.usersByRole.map((entry, index) => (
                                <Cell key={entry.role} fill={roleColors[index % roleColors.length]} />
                              ))}
                            </Pie>
                            <Tooltip content={<CustomChartTooltip />} />
                            <Legend />
                          </PieChart>
                        </ResponsiveContainer>
                      </div>
                    </div>

                    {/* Listings by status custom bar chart */}
                    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                      <h2 className="text-sm font-bold uppercase tracking-wider text-slate-700">Listings by Status</h2>
                      <div className="mt-4 h-72">
                        <ResponsiveContainer width="100%" height="100%">
                          <BarChart data={stats.charts.listingStatus}>
                            <defs>
                              <linearGradient id="barGlow" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="#6366f1" stopOpacity={0.85}/>
                                <stop offset="95%" stopColor="#4f46e5" stopOpacity={0.4}/>
                              </linearGradient>
                            </defs>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                            <XAxis dataKey="label" stroke="#94a3b8" fontSize={12} tickLine={false} />
                            <YAxis allowDecimals={false} stroke="#94a3b8" fontSize={12} tickLine={false} />
                            <Tooltip content={<CustomChartTooltip />} />
                            <Bar dataKey="count" radius={[10, 10, 0, 0]} fill="url(#barGlow)">
                              <Cell fill="#4f46e5" />
                              <Cell fill="#10b981" />
                              <Cell fill="#64748b" />
                            </Bar>
                          </BarChart>
                        </ResponsiveContainer>
                      </div>
                    </div>
                  </div>

                  <div className="grid gap-6 xl:grid-cols-2">
                    {/* Monthly registrations line chart with gradients */}
                    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                      <h2 className="text-sm font-bold uppercase tracking-wider text-slate-700">Monthly Registrations</h2>
                      <div className="mt-4 h-72">
                        <ResponsiveContainer width="100%" height="100%">
                          <LineChart data={stats.charts.monthlyRegistrations}>
                            <defs>
                              <linearGradient id="regGrad" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="#10b981" stopOpacity={0.2}/>
                                <stop offset="95%" stopColor="#10b981" stopOpacity={0.0}/>
                              </linearGradient>
                            </defs>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                            <XAxis dataKey="month" stroke="#94a3b8" fontSize={12} tickLine={false} />
                            <YAxis allowDecimals={false} stroke="#94a3b8" fontSize={12} tickLine={false} />
                            <Tooltip content={<CustomChartTooltip />} />
                            <Line type="monotone" name="Registrations" dataKey="count" stroke="#10b981" strokeWidth={3} dot={{ r: 5, strokeWidth: 2, stroke: '#fff' }} />
                          </LineChart>
                        </ResponsiveContainer>
                      </div>
                    </div>

                    {/* Monthly listings line chart */}
                    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                      <h2 className="text-sm font-bold uppercase tracking-wider text-slate-700">Monthly Listings Created</h2>
                      <div className="mt-4 h-72">
                        <ResponsiveContainer width="100%" height="100%">
                          <LineChart data={stats.charts.monthlyListings}>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                            <XAxis dataKey="month" stroke="#94a3b8" fontSize={12} tickLine={false} />
                            <YAxis allowDecimals={false} stroke="#94a3b8" fontSize={12} tickLine={false} />
                            <Tooltip content={<CustomChartTooltip />} />
                            <Line type="monotone" name="Listings" dataKey="count" stroke="#f97316" strokeWidth={3} dot={{ r: 5, strokeWidth: 2, stroke: '#fff' }} />
                          </LineChart>
                        </ResponsiveContainer>
                      </div>
                    </div>
                  </div>

                  {/* Listings by location horizontal bar chart */}
                  <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                    <h2 className="text-sm font-bold uppercase tracking-wider text-slate-700">Listings by Location</h2>
                    <div className="mt-4 h-72">
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={stats.charts.listingsByLocation} layout="vertical">
                          <defs>
                            <linearGradient id="locGrad" x1="0" y1="0" x2="1" y2="0">
                              <stop offset="5%" stopColor="#1e293b" stopOpacity={0.9}/>
                              <stop offset="95%" stopColor="#475569" stopOpacity={0.6}/>
                            </linearGradient>
                          </defs>
                          <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#f1f5f9" />
                          <XAxis type="number" allowDecimals={false} stroke="#94a3b8" fontSize={12} tickLine={false} />
                          <YAxis type="category" dataKey="location" width={140} stroke="#94a3b8" fontSize={12} tickLine={false} />
                          <Tooltip content={<CustomChartTooltip />} />
                          <Bar name="Listings count" dataKey="count" fill="url(#locGrad)" radius={[0, 8, 8, 0]} />
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'users' && (
                <section className="space-y-4">
                  {/* Search and Filters with CSV Export */}
                  <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                    <div className="grid flex-1 gap-4 sm:grid-cols-3">
                      <AdminSearchBar value={userSearch} onChange={setUserSearch} placeholder="Search users by name/email" />
                      <select
                        value={userRoleFilter}
                        onChange={(e) => setUserRoleFilter(e.target.value)}
                        className="rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-800 outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100"
                      >
                        <option value="">All roles</option>
                        <option value="tenant">Tenant</option>
                        <option value="owner">Owner</option>
                        <option value="admin">Admin</option>
                      </select>
                      <div className="flex items-center justify-between rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-600">
                        <span>Showing {filteredUsers.length} users</span>
                      </div>
                    </div>
                    <button
                      onClick={() => handleExportCSV('users')}
                      className="flex items-center justify-center gap-2 rounded-xl bg-slate-900 px-5 py-3 text-sm font-bold text-white shadow-sm hover:bg-slate-800 transition cursor-pointer"
                    >
                      <Download className="h-4 w-4" />
                      Export CSV
                    </button>
                  </div>

                  {/* USER DYNAMIC EMPTY STATE CHECK */}
                  {filteredUsers.length === 0 ? (
                    <EmptyState
                      icon={Users}
                      title="No Users Found"
                      description={userSearch || userRoleFilter ? "We couldn't find any users matching your filters. Try checking your spelling or resetting filters." : "There are currently no registered users on the platform."}
                      onReset={userSearch || userRoleFilter ? () => { setUserSearch(''); setUserRoleFilter(''); } : null}
                    />
                  ) : (
                    <>
                      <AdminDataTable>
                        <table className="w-full border-collapse text-left text-sm">
                          <thead className="bg-slate-50 text-xs uppercase tracking-wider text-slate-500 border-b border-slate-200/60">
                            <tr>
                              <th className="px-4 py-3.5 w-10">
                                <input
                                  type="checkbox"
                                  checked={userPagination.items.length > 0 && userPagination.items.every(u => selectedUserIds.includes(u._id))}
                                  onChange={(e) => {
                                    const currentIds = userPagination.items.map(u => u._id)
                                    if (e.target.checked) {
                                      setSelectedUserIds(prev => [...new Set([...prev, ...currentIds])])
                                    } else {
                                      setSelectedUserIds(prev => prev.filter(id => !currentIds.includes(id)))
                                    }
                                  }}
                                  className="h-4.5 w-4.5 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
                                />
                              </th>
                              <th className="px-4 py-3.5">Profile</th>
                              <th className="px-4 py-3.5">Email</th>
                              <th className="px-4 py-3.5">Role</th>
                              <th className="px-4 py-3.5">Status</th>
                              <th className="px-4 py-3.5">Created</th>
                              <th className="px-4 py-3.5 text-right">Actions</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-slate-100">
                            {userPagination.items.map((user) => (
                              <tr key={user._id} className={`hover:bg-slate-50/60 transition ${selectedUserIds.includes(user._id) ? 'bg-indigo-50/30' : ''}`}>
                                <td className="px-4 py-3">
                                  <input
                                    type="checkbox"
                                    checked={selectedUserIds.includes(user._id)}
                                    onChange={() => {
                                      setSelectedUserIds(prev =>
                                        prev.includes(user._id) ? prev.filter(id => id !== user._id) : [...prev, user._id]
                                      )
                                    }}
                                    className="h-4.5 w-4.5 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
                                  />
                                </td>
                                <td className="px-4 py-3">
                                  <div className="flex items-center gap-3">
                                    {user.avatar ? (
                                      <img src={user.avatar} alt={user.name} className="h-10 w-10 rounded-xl object-cover border border-slate-100" />
                                    ) : (
                                      <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-50 font-bold text-indigo-700 border border-indigo-100">
                                        {user.name?.slice(0, 2).toUpperCase()}
                                      </div>
                                    )}
                                    <div>
                                      <p className="font-semibold text-slate-900">{user.name}</p>
                                      <p className="text-[10px] font-mono text-slate-400">{user._id}</p>
                                    </div>
                                  </div>
                                </td>
                                <td className="px-4 py-3 text-slate-600 font-medium">{user.email}</td>
                                <td className="px-4 py-3">
                                  <select
                                    value={user.role}
                                    onChange={(e) => handleUpdateUserRole(user._id, e.target.value)}
                                    className="rounded-lg border border-slate-200 bg-white px-2 py-1.5 text-xs font-bold uppercase tracking-wider text-slate-700 outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 transition"
                                  >
                                    <option value="tenant">Tenant</option>
                                    <option value="owner">Owner</option>
                                    <option value="admin">Admin</option>
                                  </select>
                                </td>
                                <td className="px-4 py-3">
                                  <button
                                    type="button"
                                    onClick={() => handleToggleUserStatus(user._id, user.isActive)}
                                    className={`rounded-full px-3 py-1 text-[10px] font-bold uppercase tracking-wider transition cursor-pointer ${user.isActive ? 'bg-emerald-100 text-emerald-800 hover:bg-emerald-200' : 'bg-rose-100 text-rose-800 hover:bg-rose-200'}`}
                                  >
                                    {user.isActive ? 'Active' : 'Blocked'}
                                  </button>
                                </td>
                                <td className="px-4 py-3 text-slate-500 font-medium">{formatDate(user.createdAt)}</td>
                                <td className="px-4 py-3 text-right">
                                  <div className="flex items-center justify-end gap-2">
                                    <button
                                      type="button"
                                      onClick={() => { setSelectedEntity({ type: 'user', data: user }); setAuditorTab('overview'); }}
                                      className="rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 transition hover:bg-slate-50 cursor-pointer"
                                    >
                                      Audit
                                    </button>
                                    <button
                                      type="button"
                                      onClick={() => handleDeleteUser(user._id, user.name)}
                                      className="rounded-lg border border-rose-200 bg-rose-50/50 px-3 py-1.5 text-xs font-semibold text-rose-700 transition hover:bg-rose-100/80 cursor-pointer"
                                    >
                                      Delete
                                    </button>
                                  </div>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </AdminDataTable>
                      <AdminPagination page={userPagination.page} totalPages={userPagination.totalPages} onPageChange={setUserPage} />
                    </>
                  )}
                </section>
              )}

              {activeTab === 'listings' && (
                <section className="space-y-4">
                  {/* Listing Search, Filter and CSV export */}
                  <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                    <div className="grid flex-1 gap-4 sm:grid-cols-3">
                      <AdminSearchBar value={listingSearch} onChange={setListingSearch} placeholder="Search listings by title/location" />
                      <select
                        value={listingStatusFilter}
                        onChange={(e) => setListingStatusFilter(e.target.value)}
                        className="rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-800 outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100"
                      >
                        <option value="">All statuses</option>
                        <option value="active">Active</option>
                        <option value="filled">Filled</option>
                        <option value="hidden">Hidden</option>
                      </select>
                      <div className="flex items-center justify-between rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-600">
                        <span>Showing {filteredListings.length} listings</span>
                      </div>
                    </div>
                    <button
                      onClick={() => handleExportCSV('listings')}
                      className="flex items-center justify-center gap-2 rounded-xl bg-slate-900 px-5 py-3 text-sm font-bold text-white shadow-sm hover:bg-slate-800 transition cursor-pointer"
                    >
                      <Download className="h-4 w-4" />
                      Export CSV
                    </button>
                  </div>

                  {/* LISTINGS DYNAMIC EMPTY STATE CHECK */}
                  {filteredListings.length === 0 ? (
                    <EmptyState
                      icon={Building2}
                      title="No Listings Found"
                      description={listingSearch || listingStatusFilter ? "No properties match your active search terms or status filters. Try resetting filters." : "There are no property listings currently active on the platform."}
                      onReset={listingSearch || listingStatusFilter ? () => { setListingSearch(''); setListingStatusFilter(''); } : null}
                    />
                  ) : (
                    <>
                      <AdminDataTable>
                        <table className="w-full border-collapse text-left text-sm">
                          <thead className="bg-slate-50 text-xs uppercase tracking-wider text-slate-500 border-b border-slate-200/60">
                            <tr>
                              <th className="px-4 py-3.5 w-10">
                                <input
                                  type="checkbox"
                                  checked={listingPagination.items.length > 0 && listingPagination.items.every(l => selectedListingIds.includes(l._id))}
                                  onChange={(e) => {
                                    const currentIds = listingPagination.items.map(l => l._id)
                                    if (e.target.checked) {
                                      setSelectedListingIds(prev => [...new Set([...prev, ...currentIds])])
                                    } else {
                                      setSelectedListingIds(prev => prev.filter(id => !currentIds.includes(id)))
                                    }
                                  }}
                                  className="h-4.5 w-4.5 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
                                />
                              </th>
                              <th className="px-4 py-3.5">Property</th>
                              <th className="px-4 py-3.5">Owner</th>
                              <th className="px-4 py-3.5">Rent</th>
                              <th className="px-4 py-3.5">Status</th>
                              <th className="px-4 py-3.5">Created</th>
                              <th className="px-4 py-3.5 text-right">Actions</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-slate-100">
                            {listingPagination.items.map((listing) => (
                              <tr key={listing._id} className={`hover:bg-slate-50/60 transition ${selectedListingIds.includes(listing._id) ? 'bg-indigo-50/30' : ''}`}>
                                <td className="px-4 py-3">
                                  <input
                                    type="checkbox"
                                    checked={selectedListingIds.includes(listing._id)}
                                    onChange={() => {
                                      setSelectedListingIds(prev =>
                                        prev.includes(listing._id) ? prev.filter(id => id !== listing._id) : [...prev, listing._id]
                                      )
                                    }}
                                    className="h-4.5 w-4.5 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
                                  />
                                </td>
                                <td className="px-4 py-3">
                                  <div className="flex items-center gap-3">
                                    {listing.images?.[0]?.url ? (
                                      <img src={listing.images[0].url} alt={listing.title} className="h-12 w-12 rounded-xl object-cover border border-slate-100" />
                                    ) : (
                                      <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-slate-50 text-slate-400 border border-slate-100">
                                        <Building2 className="h-5 w-5" />
                                      </div>
                                    )}
                                    <div className="min-w-0">
                                      <p className="font-semibold text-slate-900 truncate max-w-xs">{listing.title}</p>
                                      <p className="text-xs text-slate-400 truncate max-w-xs">{listing.location}</p>
                                    </div>
                                  </div>
                                </td>
                                <td className="px-4 py-3 text-slate-600 font-medium">{listing.owner?.name || 'Unknown Owner'}</td>
                                <td className="px-4 py-3 font-semibold text-indigo-700">₹{listing.rent?.toLocaleString()}</td>
                                <td className="px-4 py-3">
                                  <button
                                    type="button"
                                    onClick={() => handleToggleListing(listing._id, listing.isActive)}
                                    className={`rounded-full px-3 py-1 text-[10px] font-bold uppercase tracking-wider transition cursor-pointer ${listing.status === 'filled' ? 'bg-emerald-500 text-white' : listing.isActive ? 'bg-emerald-100 text-emerald-800 hover:bg-emerald-200' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'}`}
                                  >
                                    {listing.status === 'filled' ? 'Filled' : listing.isActive ? 'Active' : 'Hidden'}
                                  </button>
                                </td>
                                <td className="px-4 py-3 text-slate-500 font-medium">{formatDate(listing.createdAt)}</td>
                                <td className="px-4 py-3 text-right">
                                  <div className="flex items-center justify-end gap-2">
                                    <button
                                      type="button"
                                      onClick={() => { setSelectedEntity({ type: 'listing', data: listing }); setAuditorTab('overview'); }}
                                      className="rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 transition hover:bg-slate-50 cursor-pointer"
                                    >
                                      Audit
                                    </button>
                                    <button
                                      type="button"
                                      onClick={() => handleDeleteListing(listing._id, listing.title)}
                                      className="rounded-lg border border-rose-200 bg-rose-50/50 px-3 py-1.5 text-xs font-semibold text-rose-700 transition hover:bg-rose-100/80 cursor-pointer"
                                    >
                                      Delete
                                    </button>
                                  </div>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </AdminDataTable>
                      <AdminPagination page={listingPagination.page} totalPages={listingPagination.totalPages} onPageChange={setListingPage} />
                    </>
                  )}
                </section>
              )}

              {activeTab === 'interests' && (
                <section className="space-y-4">
                  <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                    <div className="grid flex-1 gap-4 sm:grid-cols-2">
                      <AdminSearchBar value={interestSearch} onChange={setInterestSearch} placeholder="Search tenant, owner, or listing..." />
                      <div className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-600 flex items-center">
                        Showing {filteredInterests.length} compatibility match cases
                      </div>
                    </div>
                    <button
                      onClick={() => handleExportCSV('interests')}
                      className="flex items-center justify-center gap-2 rounded-xl bg-slate-950 px-5 py-3 text-sm font-bold text-white shadow-sm hover:bg-slate-800 transition cursor-pointer"
                    >
                      <Download className="h-4 w-4" />
                      Export CSV
                    </button>
                  </div>

                  {/* INTERESTS DYNAMIC EMPTY STATE CHECK */}
                  {filteredInterests.length === 0 ? (
                    <EmptyState
                      icon={Heart}
                      title="No Interest Requests Found"
                      description={interestSearch ? "No compatibility matching records match your search query. Try clearing the search." : "No tenant-landlord interest requests have been submitted yet."}
                      onReset={interestSearch ? () => setInterestSearch('') : null}
                    />
                  ) : (
                    <>
                      <AdminDataTable>
                        <table className="w-full border-collapse text-left text-sm">
                          <thead className="bg-slate-50 text-xs uppercase tracking-wider text-slate-500 border-b border-slate-200/60">
                            <tr>
                              <th className="px-4 py-3.5">Tenant</th>
                              <th className="px-4 py-3.5">Owner</th>
                              <th className="px-4 py-3.5">Listing</th>
                              <th className="px-4 py-3.5">Compatibility</th>
                              <th className="px-4 py-3.5">Status</th>
                              <th className="px-4 py-3.5">Created</th>
                              <th className="px-4 py-3.5 text-right">Actions</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-slate-100">
                            {interestPagination.items.map((interest) => (
                              <tr key={interest._id} className="hover:bg-slate-50/60 transition">
                                <td className="px-4 py-3">
                                  <p className="font-semibold text-slate-900">{interest.tenant?.name || 'Tenant'}</p>
                                  <p className="text-xs text-slate-400 font-mono">{interest.tenant?.email}</p>
                                </td>
                                <td className="px-4 py-3">
                                  <p className="font-semibold text-slate-900">{interest.owner?.name || 'Owner'}</p>
                                  <p className="text-xs text-slate-400 font-mono">{interest.owner?.email}</p>
                                </td>
                                <td className="px-4 py-3">
                                  <p className="font-semibold text-slate-900 truncate max-w-[200px]">{interest.listing?.title || 'Listing'}</p>
                                  <p className="text-xs font-bold text-indigo-600">₹{interest.listing?.rent?.toLocaleString()}</p>
                                </td>
                                <td className="px-4 py-3">
                                  <div className="flex items-center gap-2">
                                    <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-indigo-50 font-extrabold text-indigo-700 border border-indigo-100">
                                      {interest.compatibility?.score ?? '—'}
                                    </div>
                                    <span className="text-xs text-slate-500 font-semibold">AI Rating</span>
                                  </div>
                                </td>
                                <td className="px-4 py-3">
                                  <span className={`rounded-full px-3 py-1 text-[10px] font-bold uppercase tracking-wider ${interest.status === 'accepted' ? 'bg-emerald-100 text-emerald-800' : interest.status === 'declined' ? 'bg-rose-100 text-rose-800' : 'bg-amber-100 text-amber-800'}`}>
                                    {interest.status}
                                  </span>
                                </td>
                                <td className="px-4 py-3 text-slate-500 font-medium">{formatDate(interest.createdAt)}</td>
                                <td className="px-4 py-3 text-right">
                                  <div className="flex items-center justify-end gap-2">
                                    <button
                                      type="button"
                                      onClick={() => setSelectedEntity({ type: 'interest', data: interest })}
                                      className="rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 transition hover:bg-slate-50 cursor-pointer"
                                    >
                                      View
                                    </button>
                                    <button
                                      type="button"
                                      onClick={() => handleDeleteInterest(interest._id)}
                                      className="rounded-lg border border-rose-200 bg-rose-50/50 px-3 py-1.5 text-xs font-semibold text-rose-700 transition hover:bg-rose-100/80 cursor-pointer"
                                    >
                                      Delete
                                    </button>
                                  </div>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </AdminDataTable>
                      <AdminPagination page={interestPagination.page} totalPages={interestPagination.totalPages} onPageChange={setInterestPage} />
                    </>
                  )}
                </section>
              )}

              {activeTab === 'chats' && (
                <section className="space-y-4">
                  <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                    <div className="grid flex-1 gap-4 sm:grid-cols-2">
                      <AdminSearchBar value={chatSearch} onChange={setChatSearch} placeholder="Search chats by tenant, owner, or listing..." />
                      <div className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-600 flex items-center">
                        Showing {filteredChats.length} active logs of chats
                      </div>
                    </div>
                    <button
                      onClick={() => handleExportCSV('chats')}
                      className="flex items-center justify-center gap-2 rounded-xl bg-slate-900 px-5 py-3 text-sm font-bold text-white shadow-sm hover:bg-slate-800 transition cursor-pointer"
                    >
                      <Download className="h-4 w-4" />
                      Export CSV
                    </button>
                  </div>

                  {/* CHATS DYNAMIC EMPTY STATE CHECK */}
                  {filteredChats.length === 0 ? (
                    <EmptyState
                      icon={MessageSquare}
                      title="No Active Chats"
                      description={chatSearch ? "No chat logs match your search terms." : "No messages or conversations have been started between tenants and owners yet."}
                      onReset={chatSearch ? () => setChatSearch('') : null}
                    />
                  ) : (
                    <>
                      <AdminDataTable>
                        <table className="w-full border-collapse text-left text-sm">
                          <thead className="bg-slate-50 text-xs uppercase tracking-wider text-slate-500 border-b border-slate-200/60">
                            <tr>
                              <th className="px-4 py-3.5">Owner</th>
                              <th className="px-4 py-3.5">Tenant</th>
                              <th className="px-4 py-3.5">Listing</th>
                              <th className="px-4 py-3.5">Last Message</th>
                              <th className="px-4 py-3.5">Last Active</th>
                              <th className="px-4 py-3.5 text-right">Actions</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-slate-100">
                            {chatPagination.items.map((chat) => (
                              <tr key={chat._id} className="hover:bg-slate-50/60 transition">
                                <td className="px-4 py-3">
                                  <p className="font-semibold text-slate-900">{chat.owner?.name || 'Owner'}</p>
                                  <p className="text-xs text-slate-400 font-mono">{chat.owner?.email}</p>
                                </td>
                                <td className="px-4 py-3">
                                  <p className="font-semibold text-slate-900">{chat.tenant?.name || 'Tenant'}</p>
                                  <p className="text-xs text-slate-400 font-mono">{chat.tenant?.email}</p>
                                </td>
                                <td className="px-4 py-3 font-semibold text-slate-800 truncate max-w-[150px]">{chat.listing?.title || 'Listing'}</td>
                                <td className="px-4 py-3 text-slate-600 max-w-[200px] truncate">{chat.lastMessage?.content || 'No messages yet'}</td>
                                <td className="px-4 py-3 text-slate-500 font-medium">{formatDate(chat.lastMessageAt || chat.updatedAt)}</td>
                                <td className="px-4 py-3 text-right">
                                  <div className="flex items-center justify-end gap-2">
                                    <button
                                      type="button"
                                      onClick={() => openChatHistory(chat)}
                                      className="rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 transition hover:bg-slate-50 flex items-center gap-1.5 cursor-pointer"
                                    >
                                      <MessageCircle className="h-3.5 w-3.5 text-indigo-600" />
                                      Read Chat
                                    </button>
                                    <button
                                      type="button"
                                      onClick={() => handleDeleteChat(chat._id)}
                                      className="rounded-lg border border-rose-200 bg-rose-50/50 px-3 py-1.5 text-xs font-semibold text-rose-700 transition hover:bg-rose-100/80 cursor-pointer"
                                    >
                                      Delete
                                    </button>
                                  </div>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </AdminDataTable>
                      <AdminPagination page={chatPagination.page} totalPages={chatPagination.totalPages} onPageChange={setChatPage} />
                    </>
                  )}
                </section>
              )}

              {activeTab === 'activity' && (
                <section className="space-y-4">
                  <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                    <div className="grid flex-1 gap-4 sm:grid-cols-2">
                      <AdminSearchBar value={activitySearch} onChange={setActivitySearch} placeholder="Search activity logs..." />
                      <div className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-600 flex items-center">
                        Showing {filteredActivity.length} timeline logs of activities
                      </div>
                    </div>
                    <button
                      onClick={() => handleExportCSV('activity')}
                      className="flex items-center justify-center gap-2 rounded-xl bg-slate-900 px-5 py-3 text-sm font-bold text-white shadow-sm hover:bg-slate-800 transition cursor-pointer"
                    >
                      <Download className="h-4 w-4" />
                      Export CSV
                    </button>
                  </div>

                  {/* ACTIVITY LOGS DYNAMIC EMPTY STATE CHECK */}
                  {activityPagination.items.length === 0 ? (
                    <EmptyState
                      icon={FolderOpen}
                      title="No Activity Logs"
                      description={activitySearch ? "No activity logs match your filter options." : "There are no administrator activity logs recorded on the platform."}
                      onReset={activitySearch ? () => setActivitySearch('') : null}
                    />
                  ) : (
                    <>
                      {/* Redesigned activity timeline log */}
                      <div className="relative pl-6 before:absolute before:left-3 before:top-4 before:bottom-4 before:w-[2px] before:bg-indigo-100">
                        {activityPagination.items.map((log) => {
                          let dotColor = 'bg-slate-300'
                          if (log.action.includes('delete')) dotColor = 'bg-rose-500'
                          else if (log.action.includes('create') || log.action.includes('add') || log.action.includes('unblock')) dotColor = 'bg-emerald-500'
                          else if (log.action.includes('update') || log.action.includes('status') || log.action.includes('role') || log.action.includes('block')) dotColor = 'bg-amber-500'

                          return (
                            <div key={log._id} className="relative mb-6 last:mb-0">
                              {/* Dot timeline indicator */}
                              <span className={`absolute -left-6 top-1.5 h-3.5 w-3.5 rounded-full border-4 border-white ${dotColor} shadow-sm`} />
                              
                              <div className="rounded-2xl border border-slate-200/60 bg-white p-4 shadow-sm hover:shadow-md transition-all">
                                <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                                  <div>
                                    <div className="flex flex-wrap items-center gap-2">
                                      <span className="rounded-lg bg-indigo-50 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-indigo-700">
                                        {log.action}
                                      </span>
                                      <span className="text-xs text-slate-400 font-mono">ID: {log._id}</span>
                                    </div>
                                    <p className="mt-2 text-sm font-semibold text-slate-800">{log.description}</p>
                                    <div className="mt-2 flex items-center gap-2 text-xs text-slate-500">
                                      <span className="font-semibold text-slate-700">{log.user?.name || 'System'}</span>
                                      <span>·</span>
                                      <span className="uppercase font-bold text-[10px] tracking-wide text-slate-400">{log.user?.role || 'system'}</span>
                                    </div>
                                  </div>
                                  <span className="self-start rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-500 sm:self-center">
                                    {formatDate(log.createdAt)}
                                  </span>
                                </div>
                              </div>
                            </div>
                          )
                        })}
                      </div>

                      <AdminPagination page={activityPagination.page} totalPages={activityPagination.totalPages} onPageChange={setActivityPage} />
                    </>
                  )}
                </section>
              )}

              {activeTab === 'settings' && (
                <div className="space-y-6 max-w-4xl mx-auto">
                  <div className="grid gap-6 md:grid-cols-2">
                    {/* Profile Info Form */}
                    <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm flex flex-col justify-between">
                      <form onSubmit={handleProfileSubmit} className="space-y-5">
                        <h2 className="text-md font-bold text-slate-800 flex items-center gap-2 border-b border-slate-100 pb-3" style={{ fontFamily: 'Outfit, sans-serif' }}>
                          <User className="h-5 w-5 text-indigo-600" />
                          Profile Details
                        </h2>

                        {profileSuccess && (
                          <div className="flex items-center gap-2.5 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-xs text-emerald-800">
                            <CheckCircle2 className="h-4 w-4 text-emerald-500 shrink-0" />
                            <span>{profileSuccess}</span>
                          </div>
                        )}

                        {profileError && (
                          <div className="flex items-center gap-2.5 rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-xs text-rose-800">
                            <AlertCircle className="h-4 w-4 text-rose-500 shrink-0" />
                            <span>{profileError}</span>
                          </div>
                        )}

                        <div className="space-y-1.5">
                          <label className="text-xs font-bold text-slate-600 uppercase tracking-wider block">Full Name</label>
                          <input
                            type="text"
                            placeholder="Your full name"
                            value={profileName}
                            onChange={(e) => setProfileName(e.target.value)}
                            className="w-full rounded-xl border border-slate-200 bg-white py-2.5 px-4 text-sm text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100"
                          />
                        </div>

                        <div className="space-y-1.5">
                          <label className="text-xs font-bold text-slate-600 uppercase tracking-wider block">Email Address</label>
                          <input
                            type="email"
                            placeholder="your.email@example.com"
                            value={profileEmail}
                            onChange={(e) => setProfileEmail(e.target.value)}
                            className="w-full rounded-xl border border-slate-200 bg-white py-2.5 px-4 text-sm text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100"
                          />
                        </div>

                        <div className="pt-2">
                          <button
                            type="submit"
                            disabled={profileSaving}
                            className="flex w-full items-center justify-center gap-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 py-2.5 text-xs font-bold text-white shadow-md shadow-indigo-100 transition disabled:opacity-50 cursor-pointer"
                          >
                            {profileSaving ? (
                              <>
                                <Loader2 className="h-4 w-4 animate-spin" />
                                Saving Changes...
                              </>
                            ) : (
                              <>
                                <Save className="h-4 w-4" />
                                Save Details
                              </>
                            )}
                          </button>
                        </div>
                      </form>
                    </div>

                    {/* Change Password Form */}
                    <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm flex flex-col justify-between">
                      <form onSubmit={handlePasswordSubmit} className="space-y-4">
                        <h2 className="text-md font-bold text-slate-800 flex items-center gap-2 border-b border-slate-100 pb-3" style={{ fontFamily: 'Outfit, sans-serif' }}>
                          <Lock className="h-5 w-5 text-indigo-600" />
                          Change Password
                        </h2>

                        {passwordSuccess && (
                          <div className="flex items-center gap-2.5 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-xs text-emerald-800">
                            <CheckCircle2 className="h-4 w-4 text-emerald-500 shrink-0" />
                            <span>{passwordSuccess}</span>
                          </div>
                        )}

                        {passwordError && (
                          <div className="flex items-center gap-2.5 rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-xs text-rose-800">
                            <AlertCircle className="h-4 w-4 text-rose-500 shrink-0" />
                            <span>{passwordError}</span>
                          </div>
                        )}

                        <div className="space-y-1.5">
                          <label className="text-xs font-bold text-slate-600 uppercase tracking-wider block">Current Password</label>
                          <input
                            type="password"
                            placeholder="••••••••"
                            value={currentPassword}
                            onChange={(e) => setCurrentPassword(e.target.value)}
                            className="w-full rounded-xl border border-slate-200 bg-white py-2.5 px-4 text-sm text-slate-800 outline-none transition focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100"
                          />
                        </div>

                        <div className="space-y-1.5">
                          <label className="text-xs font-bold text-slate-600 uppercase tracking-wider block">New Password</label>
                          <input
                            type="password"
                            placeholder="••••••••"
                            value={newPassword}
                            onChange={(e) => setNewPassword(e.target.value)}
                            className="w-full rounded-xl border border-slate-200 bg-white py-2.5 px-4 text-sm text-slate-800 outline-none transition focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100"
                          />
                        </div>

                        <div className="space-y-1.5">
                          <label className="text-xs font-bold text-slate-600 uppercase tracking-wider block">Confirm New Password</label>
                          <input
                            type="password"
                            placeholder="••••••••"
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            className="w-full rounded-xl border border-slate-200 bg-white py-2.5 px-4 text-sm text-slate-800 outline-none transition focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100"
                          />
                        </div>

                        <div className="pt-2">
                          <button
                            type="submit"
                            disabled={passwordSaving}
                            className="flex w-full items-center justify-center gap-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 py-2.5 text-xs font-bold text-white shadow-md shadow-indigo-100 transition disabled:opacity-50 cursor-pointer"
                          >
                            {passwordSaving ? (
                              <>
                                <Loader2 className="h-4 w-4 animate-spin" />
                                Updating Password...
                              </>
                            ) : (
                              <>
                                <Lock className="h-4 w-4" />
                                Change Password
                              </>
                            )}
                          </button>
                        </div>
                      </form>
                    </div>
                  </div>
                </div>
              )}
            </motion.div>
          </AnimatePresence>
        </>
      )}

      {/* Floating sliding bulk action bar */}
      <AnimatePresence>
        {((activeTab === 'users' && selectedUserIds.length > 0) || (activeTab === 'listings' && selectedListingIds.length > 0)) && (
          <motion.div
            initial={{ y: 80, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 80, opacity: 0 }}
            className="fixed bottom-6 left-1/2 z-40 w-[90%] max-w-2xl -translate-x-1/2 rounded-2xl bg-slate-900 px-6 py-4 text-white shadow-2xl flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between border border-slate-800"
          >
            <div>
              <p className="text-sm font-bold">
                {activeTab === 'users' ? selectedUserIds.length : selectedListingIds.length} items selected
              </p>
              <p className="text-[10px] text-slate-400">Perform quick batch operations on checked rows</p>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              {activeTab === 'users' && (
                <>
                  <button
                    onClick={() => handleBulkUserStatus(true)}
                    className="rounded-xl bg-emerald-600 hover:bg-emerald-500 px-3.5 py-2 text-xs font-bold transition flex items-center gap-1.5 cursor-pointer"
                  >
                    <Check className="h-3.5 w-3.5" />
                    Unblock
                  </button>
                  <button
                    onClick={() => handleBulkUserStatus(false)}
                    className="rounded-xl bg-amber-600 hover:bg-amber-500 px-3.5 py-2 text-xs font-bold transition flex items-center gap-1.5 cursor-pointer"
                  >
                    <Ban className="h-3.5 w-3.5" />
                    Block
                  </button>
                  <button
                    onClick={handleBulkDeleteUsers}
                    className="rounded-xl bg-rose-600 hover:bg-rose-500 px-3.5 py-2 text-xs font-bold transition flex items-center gap-1.5 cursor-pointer"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                    Delete
                  </button>
                </>
              )}
              {activeTab === 'listings' && (
                <>
                  <button
                    onClick={() => handleBulkListingStatus(true)}
                    className="rounded-xl bg-emerald-600 hover:bg-emerald-500 px-3.5 py-2 text-xs font-bold transition flex items-center gap-1.5 cursor-pointer"
                  >
                    <Check className="h-3.5 w-3.5" />
                    Activate
                  </button>
                  <button
                    onClick={() => handleBulkListingStatus(false)}
                    className="rounded-xl bg-amber-600 hover:bg-amber-500 px-3.5 py-2 text-xs font-bold transition flex items-center gap-1.5 cursor-pointer"
                  >
                    <Ban className="h-3.5 w-3.5" />
                    Deactivate
                  </button>
                  <button
                    onClick={handleBulkDeleteListings}
                    className="rounded-xl bg-rose-600 hover:bg-rose-500 px-3.5 py-2 text-xs font-bold transition flex items-center gap-1.5 cursor-pointer"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                    Delete
                  </button>
                </>
              )}
              <button
                onClick={() => {
                  setSelectedUserIds([])
                  setSelectedListingIds([])
                }}
                className="rounded-xl bg-white/10 hover:bg-white/20 p-2 text-slate-300 hover:text-white transition cursor-pointer"
              >
                <X className="h-4.5 w-4.5" />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Enhanced detail auditing inspectors */}
      <AnimatePresence>
        {selectedEntity && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/70 p-4 backdrop-blur-sm">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="max-h-[85vh] w-full max-w-2xl overflow-y-auto rounded-3xl bg-white p-6 shadow-2xl border border-slate-100 flex flex-col"
            >
              {/* Header */}
              <div className="flex items-start justify-between gap-4 border-b border-slate-100 pb-4">
                <div>
                  <span className="rounded-lg bg-slate-100 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-slate-500">
                    Audit Inspect : {selectedType}
                  </span>
                  <h3 className="mt-2 text-2xl font-bold text-slate-900 leading-tight">
                    {selectedType === 'user' ? selectedData.name : selectedType === 'listing' ? selectedData.title : 'Details Viewer'}
                  </h3>
                </div>
                <button
                  type="button"
                  onClick={() => setSelectedEntity(null)}
                  className="rounded-full bg-slate-100 p-2 text-slate-500 hover:bg-slate-200 transition cursor-pointer"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              {/* Tabbed Auditing Sub-Navigation for Users and Listings */}
              {(selectedType === 'user' || selectedType === 'listing') && (
                <div className="flex border-b border-slate-100 mt-4 gap-1.5 p-1 bg-slate-50 rounded-xl">
                  <button
                    onClick={() => setAuditorTab('overview')}
                    className={`flex-1 text-center py-2 text-xs font-bold rounded-lg transition cursor-pointer ${auditorTab === 'overview' ? 'bg-white text-slate-900 shadow-sm border border-slate-200/50' : 'text-slate-500 hover:text-slate-800'}`}
                  >
                    Overview
                  </button>
                  {selectedType === 'user' && (
                    <>
                      <button
                        onClick={() => setAuditorTab('listings')}
                        className={`flex-1 text-center py-2 text-xs font-bold rounded-lg transition cursor-pointer ${auditorTab === 'listings' ? 'bg-white text-slate-900 shadow-sm border border-slate-200/50' : 'text-slate-500 hover:text-slate-800'}`}
                      >
                        Listings ({userAuditorListings.length})
                      </button>
                      <button
                        onClick={() => setAuditorTab('interests')}
                        className={`flex-1 text-center py-2 text-xs font-bold rounded-lg transition cursor-pointer ${auditorTab === 'interests' ? 'bg-white text-slate-900 shadow-sm border border-slate-200/50' : 'text-slate-500 hover:text-slate-800'}`}
                      >
                        Interests ({userAuditorInterests.length})
                      </button>
                    </>
                  )}
                  {selectedType === 'listing' && (
                    <button
                      onClick={() => setAuditorTab('interests')}
                      className={`flex-1 text-center py-2 text-xs font-bold rounded-lg transition cursor-pointer ${auditorTab === 'interests' ? 'bg-white text-slate-900 shadow-sm border border-slate-200/50' : 'text-slate-500 hover:text-slate-800'}`}
                    >
                      Prospects ({listingAuditorInterests.length})
                    </button>
                  )}
                </div>
              )}

              {/* Modal Body Contents */}
              <div className="mt-6 flex-1 text-sm text-slate-700">
                {selectedType === 'user' && (
                  <>
                    {auditorTab === 'overview' && (
                      <div className="space-y-4">
                        <div className="flex items-center gap-4 bg-slate-50 p-4 rounded-2xl border border-slate-100">
                          {selectedData.avatar ? (
                            <img src={selectedData.avatar} alt={selectedData.name} className="h-16 w-16 rounded-2xl object-cover border border-white shadow" />
                          ) : (
                            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-indigo-100 font-extrabold text-indigo-700 text-xl border border-white shadow">
                              {selectedData.name?.slice(0, 2).toUpperCase()}
                            </div>
                          )}
                          <div>
                            <p className="text-base font-bold text-slate-900">{selectedData.name}</p>
                            <p className="text-xs text-slate-500">{selectedData.email}</p>
                            <span className="mt-1.5 inline-block rounded bg-indigo-50 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-indigo-600 border border-indigo-100">
                              Role: {selectedData.role}
                            </span>
                          </div>
                        </div>

                        <div className="grid gap-4 sm:grid-cols-2">
                          <div className="rounded-xl border border-slate-200 p-4 space-y-1">
                            <p className="text-xs font-bold text-slate-400 uppercase tracking-wide">Status</p>
                            <p className="text-sm font-semibold flex items-center gap-1.5">
                              <span className={`h-2 w-2 rounded-full ${selectedData.isActive ? 'bg-emerald-500' : 'bg-rose-500'}`} />
                              {selectedData.isActive ? 'Active (Good Standing)' : 'Blocked / Suspended'}
                            </p>
                          </div>
                          <div className="rounded-xl border border-slate-200 p-4 space-y-1">
                            <p className="text-xs font-bold text-slate-400 uppercase tracking-wide">Joined Platform</p>
                            <p className="text-sm font-semibold text-slate-800">{formatDate(selectedData.createdAt)}</p>
                          </div>
                        </div>

                        <div className="rounded-xl border border-slate-200 p-4 space-y-2">
                          <p className="text-xs font-bold text-slate-400 uppercase tracking-wide">Database Credentials</p>
                          <p className="text-xs font-mono bg-slate-50 p-2.5 rounded-lg border border-slate-100 break-all select-all">
                            ID: {selectedData._id}
                          </p>
                        </div>
                      </div>
                    )}

                    {auditorTab === 'listings' && (
                      <div className="space-y-3">
                        {userAuditorListings.length === 0 ? (
                          <p className="text-center py-6 text-slate-400">This owner doesn't have any listings yet.</p>
                        ) : (
                          userAuditorListings.map(listing => (
                            <div key={listing._id} className="flex items-center justify-between border border-slate-150 p-3 rounded-xl bg-slate-50">
                              <div className="min-w-0">
                                <p className="font-bold text-slate-800 truncate">{listing.title}</p>
                                <p className="text-xs text-slate-500">{listing.location} · <span className="font-semibold text-indigo-600">₹{listing.rent?.toLocaleString()}</span></p>
                              </div>
                              <button
                                onClick={() => handleToggleListing(listing._id, listing.isActive)}
                                className={`rounded-xl px-2.5 py-1 text-xs font-semibold transition cursor-pointer ${listing.isActive ? 'bg-emerald-500/10 text-emerald-700 hover:bg-emerald-500/20' : 'bg-slate-200 text-slate-700 hover:bg-slate-350'}`}
                              >
                                {listing.isActive ? 'Active' : 'Hidden'}
                              </button>
                            </div>
                          ))
                        )}
                      </div>
                    )}

                    {auditorTab === 'interests' && (
                      <div className="space-y-3">
                        {userAuditorInterests.length === 0 ? (
                          <p className="text-center py-6 text-slate-400">No matching user interests recorded.</p>
                        ) : (
                          userAuditorInterests.map(interest => (
                            <div key={interest._id} className="border border-slate-150 p-3 rounded-xl bg-slate-50 text-xs">
                              <div className="flex items-center justify-between">
                                <span className="font-bold text-slate-800">
                                  {interest.tenant?.name === selectedData.name ? `Requested: ${interest.listing?.title}` : `Received from: ${interest.tenant?.name}`}
                                </span>
                                <span className={`rounded-full px-2 py-0.5 font-bold uppercase ${interest.status === 'accepted' ? 'bg-emerald-100 text-emerald-800' : interest.status === 'declined' ? 'bg-rose-100 text-rose-800' : 'bg-amber-100 text-amber-800'}`}>
                                  {interest.status}
                                </span>
                              </div>
                              <div className="flex items-center justify-between mt-2 text-slate-500">
                                <span>Compatibility Rating: <strong className="text-indigo-600">{interest.compatibility?.score ?? '—'}</strong></span>
                                <span>Date: {formatDate(interest.createdAt)}</span>
                              </div>
                            </div>
                          ))
                        )}
                      </div>
                    )}
                  </>
                )}

                {selectedType === 'listing' && (
                  <>
                    {auditorTab === 'overview' && (
                      <div className="space-y-4">
                        {/* Styled carousel of images */}
                        {selectedData.images && selectedData.images.length > 0 ? (
                          <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-thin scrollbar-thumb-slate-200">
                            {selectedData.images.map((img, idx) => (
                              <img key={idx} src={img.url} alt={`Listing thumbnail ${idx}`} className="h-28 w-40 object-cover rounded-xl border border-slate-200 flex-shrink-0" />
                            ))}
                          </div>
                        ) : (
                          <div className="h-32 bg-slate-100 border border-slate-200/50 rounded-2xl flex flex-col items-center justify-center text-slate-400 gap-1.5">
                            <Building2 className="h-8 w-8 stroke-1" />
                            <p className="text-xs">No property pictures uploaded.</p>
                          </div>
                        )}

                        <div className="grid gap-4 sm:grid-cols-2">
                          <div className="rounded-xl border border-slate-200 p-4 space-y-1 bg-indigo-50/20 border-indigo-100">
                            <p className="text-xs font-bold text-indigo-400 uppercase tracking-wide">Monthly Rent</p>
                            <p className="text-xl font-black text-indigo-700">₹{selectedData.rent?.toLocaleString()}</p>
                          </div>
                          <div className="rounded-xl border border-slate-200 p-4 space-y-1">
                            <p className="text-xs font-bold text-slate-400 uppercase tracking-wide">Status</p>
                            <p className="text-sm font-semibold flex items-center gap-1.5">
                              <span className={`h-2.5 w-2.5 rounded-full ${selectedData.status === 'filled' ? 'bg-amber-500' : selectedData.isActive ? 'bg-emerald-500' : 'bg-slate-400'}`} />
                              {selectedData.status === 'filled' ? 'Filled (Tenancy Closed)' : selectedData.isActive ? 'Active & Live' : 'Hidden'}
                            </p>
                          </div>
                        </div>

                        <div className="rounded-xl border border-slate-200 p-4 space-y-3">
                          <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wide">Specifications</h4>
                          <div className="grid grid-cols-2 gap-2 text-xs">
                            <p><strong>Room Type:</strong> {selectedData.roomType}</p>
                            <p><strong>Furnishing:</strong> {selectedData.furnished ? 'Furnished' : 'Unfurnished'}</p>
                            <p><strong>Location:</strong> {selectedData.location}</p>
                            <p><strong>Amenities:</strong> {selectedData.amenities?.join(', ') || 'None'}</p>
                          </div>
                        </div>

                        <div className="rounded-xl border border-slate-200 p-4 space-y-2">
                          <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wide">Property Owner Profile</h4>
                          <div className="flex items-center gap-3">
                            <div className="h-9 w-9 rounded-full bg-slate-200 font-bold text-slate-700 flex items-center justify-center uppercase">
                              {selectedData.owner?.name?.slice(0, 2) || 'O'}
                            </div>
                            <div>
                              <p className="font-semibold text-slate-900 text-xs">{selectedData.owner?.name || 'Owner Name'}</p>
                              <p className="text-[10px] text-slate-500">{selectedData.owner?.email}</p>
                            </div>
                          </div>
                        </div>

                        <div className="rounded-xl border border-slate-200 p-4 space-y-1">
                          <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wide">Description</h4>
                          <p className="text-xs leading-relaxed text-slate-600 bg-slate-50 p-2.5 rounded-lg border border-slate-100">
                            {selectedData.description || 'No description provided.'}
                          </p>
                        </div>
                      </div>
                    )}

                    {auditorTab === 'interests' && (
                      <div className="space-y-3">
                        {listingAuditorInterests.length === 0 ? (
                          <p className="text-center py-6 text-slate-400">No match interests sent for this listing.</p>
                        ) : (
                          listingAuditorInterests.map(interest => (
                            <div key={interest._id} className="flex items-center justify-between border border-slate-150 p-3 rounded-xl bg-slate-50">
                              <div>
                                <p className="font-bold text-slate-800">{interest.tenant?.name || 'Tenant'}</p>
                                <p className="text-xs text-slate-400">{interest.tenant?.email} · compatibility: <strong className="text-indigo-600">{interest.compatibility?.score ?? '—'}</strong></p>
                              </div>
                              <span className={`rounded-full px-2 py-0.5 text-[10px] font-bold uppercase ${interest.status === 'accepted' ? 'bg-emerald-100 text-emerald-800' : interest.status === 'declined' ? 'bg-rose-100 text-rose-800' : 'bg-amber-100 text-amber-800'}`}>
                                {interest.status}
                              </span>
                            </div>
                          ))
                        )}
                      </div>
                    )}
                  </>
                )}

                {selectedType === 'interest' && (
                  <div className="space-y-4">
                    <div className="rounded-2xl border border-indigo-100 bg-indigo-50/20 p-5 flex items-center justify-between border-dashed">
                      <div>
                        <p className="text-[10px] font-bold text-indigo-500 uppercase tracking-wider">AI Compatibility Match</p>
                        <p className="text-xs text-slate-500 mt-0.5">Rating based on tenant profile preferences</p>
                      </div>
                      <div className="h-14 w-14 rounded-2xl bg-indigo-600 font-black text-white text-2xl flex items-center justify-center shadow-lg shadow-indigo-600/25">
                        {selectedData.compatibility?.score ?? '—'}
                      </div>
                    </div>

                    <div className="rounded-xl border border-slate-200 p-4 space-y-3">
                      <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wide">Parties Involved</h4>
                      <div className="grid gap-3 sm:grid-cols-2 text-xs">
                        <div className="p-3 bg-slate-50 rounded-lg">
                          <p className="font-bold text-slate-500">Tenant (Requester)</p>
                          <p className="font-bold text-slate-800 mt-1">{selectedData.tenant?.name}</p>
                          <p className="text-slate-400 font-mono mt-0.5">{selectedData.tenant?.email}</p>
                        </div>
                        <div className="p-3 bg-slate-50 rounded-lg">
                          <p className="font-bold text-slate-500">Owner (Landlord)</p>
                          <p className="font-bold text-slate-800 mt-1">{selectedData.owner?.name}</p>
                          <p className="text-slate-400 font-mono mt-0.5">{selectedData.owner?.email}</p>
                        </div>
                      </div>
                    </div>

                    <div className="rounded-xl border border-slate-200 p-4 space-y-1">
                      <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wide">Property Target</h4>
                      <p className="text-sm font-semibold text-slate-800">{selectedData.listing?.title}</p>
                      <p className="text-xs text-slate-500">{selectedData.listing?.location} · ₹{selectedData.listing?.rent?.toLocaleString()}/mo</p>
                    </div>

                    <div className="rounded-xl border border-slate-200 p-4 space-y-2">
                      <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wide">Compatibility Rating Explanation</h4>
                      <p className="text-xs leading-relaxed text-slate-600 bg-slate-50 p-2.5 rounded-lg border border-slate-100">
                        {selectedData.compatibility?.explanation || 'No AI explanation generated yet.'}
                      </p>
                    </div>

                    {selectedData.tenantMessage && (
                      <div className="rounded-xl border border-slate-200 p-4 space-y-2">
                        <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wide">Tenant Greeting Message</h4>
                        <p className="text-xs leading-relaxed text-slate-600 bg-slate-50 p-2.5 rounded-lg border border-slate-100">
                          "{selectedData.tenantMessage}"
                        </p>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Premium Chat Transcript Modal */}
      <AnimatePresence>
        {selectedChat && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/70 p-4 backdrop-blur-sm">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="max-h-[85vh] w-full max-w-2xl overflow-y-auto rounded-3xl bg-white p-6 shadow-2xl border border-slate-100 flex flex-col"
            >
              {/* Header */}
              <div className="flex items-start justify-between gap-4 border-b border-slate-100 pb-4">
                <div>
                  <span className="rounded-lg bg-indigo-50 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-indigo-600 border border-indigo-100">
                    Audit : Chat History Transcript
                  </span>
                  <h3 className="mt-2 text-xl font-bold text-slate-900 leading-tight">
                    {selectedChat.listing?.title || 'Platform Conversation'}
                  </h3>
                  <p className="text-xs text-slate-500 mt-1">
                    Landlord: <strong className="text-slate-800">{selectedChat.owner?.name}</strong> · Tenant: <strong className="text-slate-800">{selectedChat.tenant?.name}</strong>
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={handleExportChatTranscript}
                    disabled={chatMessages.length === 0}
                    title="Export logs as txt"
                    className="rounded-xl border border-slate-200 bg-white p-2.5 text-slate-600 hover:bg-slate-50 transition disabled:opacity-40 cursor-pointer"
                  >
                    <FileDown className="h-4.5 w-4.5" />
                  </button>
                  <button
                    type="button"
                    onClick={() => setSelectedChat(null)}
                    className="rounded-full bg-slate-100 p-2 text-slate-500 hover:bg-slate-200 transition cursor-pointer"
                  >
                    <X className="h-5 w-5" />
                  </button>
                </div>
              </div>

              {/* Chat Transcript Panel styled like a real app messaging stack */}
              <div className="mt-6 flex-1 min-h-[350px] overflow-y-auto pr-2 space-y-4">
                {chatLoading ? (
                  <div className="flex items-center justify-center py-20 text-slate-500">
                    <Loader2 className="h-6 w-6 animate-spin text-indigo-600 mr-2" />
                    <span className="text-sm font-semibold">Decrypting message logs...</span>
                  </div>
                ) : chatMessages.length === 0 ? (
                  <div className="rounded-2xl border border-dashed border-slate-200 bg-slate-50 py-16 text-center text-slate-400">
                    No messages have been exchanged in this chat room yet.
                  </div>
                ) : (
                  chatMessages.map((message) => {
                    const isOwnerSender = message.sender?._id === selectedChat.owner?._id
                    return (
                      <div key={message._id} className={`flex gap-3 max-w-[80%] ${isOwnerSender ? 'ml-auto flex-row-reverse' : 'mr-auto'}`}>
                        {/* Mini Initials Avatar */}
                        <div className="h-8 w-8 rounded-full bg-slate-100 text-[10px] font-bold flex items-center justify-center border border-slate-200 flex-shrink-0 uppercase self-end">
                          {message.sender?.name?.slice(0, 2) || 'U'}
                        </div>
                        <div>
                          <div className={`p-3 rounded-2xl text-xs leading-relaxed ${isOwnerSender ? 'bg-indigo-600 text-white rounded-br-none shadow-indigo-100 shadow' : 'bg-slate-100 text-slate-800 rounded-bl-none shadow-sm'}`}>
                            <p className="font-extrabold text-[10px] mb-1 opacity-70">{message.sender?.name}</p>
                            <p className="whitespace-pre-wrap">{message.content}</p>
                          </div>
                          <span className={`block text-[9px] text-slate-400 mt-1 ${isOwnerSender ? 'text-right' : ''}`}>
                            {formatDate(message.createdAt)}
                          </span>
                        </div>
                      </div>
                    )
                  })
                )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* FLOATING TOAST NOTIFICATIONS STACK */}
      <div className="fixed bottom-6 right-6 left-6 md:left-auto z-50 flex flex-col gap-2.5 max-w-sm w-auto md:w-full pointer-events-none">
        <AnimatePresence>
          {toasts.map(toast => (
            <motion.div
              key={toast.id}
              initial={{ opacity: 0, y: 20, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -20, scale: 0.95 }}
              className={`rounded-2xl border p-4 shadow-xl backdrop-blur-md flex items-center justify-between gap-3 text-sm pointer-events-auto ${
                toast.type === 'error'
                  ? 'border-rose-200 bg-rose-50/90 text-rose-800'
                  : toast.type === 'warning'
                  ? 'border-amber-200 bg-amber-50/90 text-amber-800'
                  : toast.type === 'info'
                  ? 'border-indigo-200 bg-indigo-50/90 text-indigo-800'
                  : 'border-emerald-200 bg-emerald-50/90 text-emerald-800'
              }`}
            >
              <div className="flex items-center gap-2.5">
                {toast.type === 'error' ? (
                  <AlertCircle className="h-5 w-5 text-rose-500 shrink-0" />
                ) : toast.type === 'warning' ? (
                  <AlertTriangle className="h-5 w-5 text-amber-500 shrink-0" />
                ) : toast.type === 'info' ? (
                  <Clock className="h-5 w-5 text-indigo-500 shrink-0" />
                ) : (
                  <CheckCircle2 className="h-5 w-5 text-emerald-500 shrink-0" />
                )}
                <span className="font-semibold">{toast.message}</span>
              </div>
              <button
                onClick={() => setToasts(prev => prev.filter(t => t.id !== toast.id))}
                className="text-slate-400 hover:text-slate-600 transition cursor-pointer shrink-0"
              >
                <X className="h-4 w-4" />
              </button>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </div>
  )
}

export default AdminDashboard