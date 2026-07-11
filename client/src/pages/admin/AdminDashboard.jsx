import { useEffect, useMemo, useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
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

const roleColors = ['#0f172a', '#4f46e5', '#10b981', '#f97316']

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

const AdminDashboard = () => {
  const location = useLocation()
  const [activeTab, setActiveTab] = useState(getActiveTabFromPath(location.pathname))
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [successMsg, setSuccessMsg] = useState('')

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

  const pageSize = 8

  const loadData = async () => {
    setLoading(true)
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
      setError(requestError?.response?.data?.message || 'Failed to load admin data')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    setActiveTab(getActiveTabFromPath(location.pathname))
  }, [location.pathname])

  useEffect(() => {
    loadData()
  }, [])

  const refresh = async (message = '') => {
    if (message) setSuccessMsg(message)
    await loadData()
  }

  const handleUpdateUserRole = async (userId, role) => {
    try {
      const response = await adminService.updateUserRole(userId, role)
      if (response.success) await refresh(response.message)
    } catch (requestError) {
      setError(requestError?.response?.data?.message || 'Failed to update user role')
    }
  }

  const handleToggleUserStatus = async (userId, currentStatus) => {
    try {
      const response = await adminService.updateUserStatus(userId, !currentStatus)
      if (response.success) await refresh(response.message)
    } catch (requestError) {
      setError(requestError?.response?.data?.message || 'Failed to update user status')
    }
  }

  const handleDeleteUser = async (userId, name) => {
    if (!window.confirm(`Delete ${name}? This removes the account, listings, interests, and chats.`)) return
    try {
      const response = await adminService.deleteUser(userId)
      if (response.success) await refresh(response.message)
    } catch (requestError) {
      setError(requestError?.response?.data?.message || 'Failed to delete user')
    }
  }

  const handleToggleListing = async (listingId, currentActive) => {
    try {
      const response = await adminService.toggleListingStatus(listingId, !currentActive)
      if (response.success) await refresh(response.message)
    } catch (requestError) {
      setError(requestError?.response?.data?.message || 'Failed to update listing status')
    }
  }

  const handleDeleteListing = async (listingId, title) => {
    if (!window.confirm(`Delete listing "${title}"? Images, interests, and chats will also be removed.`)) return
    try {
      const response = await adminService.deleteListing(listingId)
      if (response.success) await refresh(response.message)
    } catch (requestError) {
      setError(requestError?.response?.data?.message || 'Failed to delete listing')
    }
  }

  const handleDeleteInterest = async (interestId) => {
    if (!window.confirm('Delete this interest request?')) return
    try {
      const response = await adminService.deleteInterest(interestId)
      if (response.success) await refresh(response.message)
    } catch (requestError) {
      setError(requestError?.response?.data?.message || 'Failed to delete interest request')
    }
  }

  const handleDeleteChat = async (chatId) => {
    if (!window.confirm('Delete this chat and all its messages?')) return
    try {
      const response = await adminService.deleteChat(chatId)
      if (response.success) await refresh(response.message)
    } catch (requestError) {
      setError(requestError?.response?.data?.message || 'Failed to delete chat')
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
      setError(requestError?.response?.data?.message || 'Failed to load chat history')
    } finally {
      setChatLoading(false)
    }
  }

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

  return (
    <div className="space-y-6">
      <div className="rounded-3xl bg-gradient-to-r from-slate-950 via-indigo-950 to-slate-900 p-6 text-white shadow-xl">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-indigo-200">
              <Shield className="h-4 w-4" />
              Admin Control Center
            </div>
            <h1 className="mt-2 text-3xl font-bold" style={{ fontFamily: 'Outfit, sans-serif' }}>
              Rent & Flatmate Finder Admin Panel
            </h1>
            <p className="mt-2 max-w-2xl text-sm text-slate-200">
              Manage platform users, listings, interest requests, chats, activity logs, and analytics from one place.
            </p>
          </div>
          <Link
            to="/admin/activity"
            className="inline-flex items-center gap-2 self-start rounded-xl bg-white px-4 py-2.5 text-sm font-bold text-slate-900 shadow-sm transition hover:bg-slate-100"
          >
            <Clock className="h-4 w-4" />
            Recent Activity
          </Link>
        </div>
      </div>

      {successMsg && (
        <div className="flex items-center gap-3 rounded-2xl border border-emerald-200 bg-emerald-50 px-5 py-4 text-sm text-emerald-800 shadow-sm">
          <CheckCircle2 className="h-5 w-5 shrink-0 text-emerald-500" />
          <div>{successMsg}</div>
        </div>
      )}

      {error && <div className="rounded-2xl border border-rose-200 bg-rose-50 px-5 py-4 text-sm text-rose-800 shadow-sm">{error}</div>}

      {loading ? (
        <div className="flex items-center justify-center rounded-3xl border border-slate-200 bg-white py-20 shadow-sm">
          <div className="flex items-center gap-3 text-slate-600">
            <Loader2 className="h-5 w-5 animate-spin" />
            Loading admin analytics...
          </div>
        </div>
      ) : (
        <>
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-5">
            <AdminStatCard label="Total Users" value={stats.users.total} icon={Users} tone="indigo" sublabel={`${stats.users.tenants} tenants · ${stats.users.owners} owners`} />
            <AdminStatCard label="Total Listings" value={stats.listings.total} icon={Building2} tone="violet" sublabel={`${stats.listings.active} active · ${stats.listings.filled} filled`} />
            <AdminStatCard label="Interest Requests" value={stats.interests.total} icon={Heart} tone="rose" sublabel={`${stats.interests.accepted} accepted · ${stats.interests.pending} pending`} />
            <AdminStatCard label="Total Chats" value={stats.chats.total} icon={MessageSquare} tone="emerald" sublabel={`${stats.messages.total} total messages`} />
            <AdminStatCard label="Filled Listings" value={stats.listings.filled} icon={UserCog} tone="slate" sublabel="Closed for tenancy" />
          </div>

          <div className="flex flex-wrap gap-2 rounded-2xl border border-slate-200 bg-white p-2 shadow-sm">
            {tabs.map(({ key, label, icon: Icon }) => (
              <Link
                key={key}
                to={`/admin/${key}`}
                onClick={() => setActiveTab(key)}
                className={`inline-flex items-center gap-2 rounded-xl px-4 py-2.5 text-xs font-bold uppercase tracking-wider transition ${activeTab === key ? 'bg-slate-900 text-white' : 'text-slate-600 hover:bg-slate-100'}`}
              >
                <Icon className="h-4 w-4" />
                {label}
              </Link>
            ))}
          </div>

          {activeTab === 'dashboard' && (
            <div className="space-y-6">
              <div className="grid gap-6 xl:grid-cols-2">
                <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                  <h2 className="text-sm font-bold uppercase tracking-wider text-slate-700">Users by Role</h2>
                  <div className="mt-4 h-72">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie data={stats.charts.usersByRole} dataKey="count" nameKey="role" outerRadius={95} innerRadius={55} paddingAngle={4}>
                          {stats.charts.usersByRole.map((entry, index) => (
                            <Cell key={entry.role} fill={roleColors[index % roleColors.length]} />
                          ))}
                        </Pie>
                        <Tooltip />
                        <Legend />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                  <h2 className="text-sm font-bold uppercase tracking-wider text-slate-700">Listings by Status</h2>
                  <div className="mt-4 h-72">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={stats.charts.listingStatus}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} />
                        <XAxis dataKey="label" />
                        <YAxis allowDecimals={false} />
                        <Tooltip />
                        <Bar dataKey="count" radius={[10, 10, 0, 0]} fill="#4f46e5" />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              </div>

              <div className="grid gap-6 xl:grid-cols-2">
                <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                  <h2 className="text-sm font-bold uppercase tracking-wider text-slate-700">Monthly Registrations</h2>
                  <div className="mt-4 h-72">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={stats.charts.monthlyRegistrations}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} />
                        <XAxis dataKey="month" />
                        <YAxis allowDecimals={false} />
                        <Tooltip />
                        <Line type="monotone" dataKey="count" stroke="#10b981" strokeWidth={3} dot={{ r: 4 }} />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                  <h2 className="text-sm font-bold uppercase tracking-wider text-slate-700">Monthly Listings Created</h2>
                  <div className="mt-4 h-72">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={stats.charts.monthlyListings}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} />
                        <XAxis dataKey="month" />
                        <YAxis allowDecimals={false} />
                        <Tooltip />
                        <Line type="monotone" dataKey="count" stroke="#f97316" strokeWidth={3} dot={{ r: 4 }} />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              </div>

              <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                <h2 className="text-sm font-bold uppercase tracking-wider text-slate-700">Listings by Location</h2>
                <div className="mt-4 h-72">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={stats.charts.listingsByLocation} layout="vertical">
                      <CartesianGrid strokeDasharray="3 3" horizontal={false} />
                      <XAxis type="number" allowDecimals={false} />
                      <YAxis type="category" dataKey="location" width={140} />
                      <Tooltip />
                      <Bar dataKey="count" fill="#0f172a" radius={[0, 10, 10, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'users' && (
            <section className="space-y-4">
              <div className="grid gap-4 lg:grid-cols-3">
                <AdminSearchBar value={userSearch} onChange={setUserSearch} placeholder="Search users by name or email" />
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
                <div className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-600">
                  Showing {userPagination.items.length} of {filteredUsers.length} users
                </div>
              </div>

              <AdminDataTable>
                <table className="w-full border-collapse text-left text-sm">
                  <thead className="bg-slate-50 text-xs uppercase tracking-wider text-slate-500">
                    <tr>
                      <th className="px-4 py-3">Profile</th>
                      <th className="px-4 py-3">Email</th>
                      <th className="px-4 py-3">Role</th>
                      <th className="px-4 py-3">Status</th>
                      <th className="px-4 py-3">Created</th>
                      <th className="px-4 py-3 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {userPagination.items.length === 0 ? (
                      <tr>
                        <td colSpan={6} className="px-4 py-10 text-center text-slate-400">No users found.</td>
                      </tr>
                    ) : (
                      userPagination.items.map((user) => (
                        <tr key={user._id} className="hover:bg-slate-50/60">
                          <td className="px-4 py-3">
                            <div className="flex items-center gap-3">
                              {user.avatar ? <img src={user.avatar} alt={user.name} className="h-10 w-10 rounded-xl object-cover" /> : <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-50 font-bold text-indigo-700">{user.name?.slice(0, 2).toUpperCase()}</div>}
                              <div>
                                <p className="font-semibold text-slate-900">{user.name}</p>
                                <p className="text-xs text-slate-500">{user._id}</p>
                              </div>
                            </div>
                          </td>
                          <td className="px-4 py-3 text-slate-600">{user.email}</td>
                          <td className="px-4 py-3">
                            <select value={user.role} onChange={(e) => handleUpdateUserRole(user._id, e.target.value)} className="rounded-lg border border-slate-200 bg-white px-2 py-1 text-sm outline-none focus:border-indigo-400">
                              <option value="tenant">Tenant</option>
                              <option value="owner">Owner</option>
                              <option value="admin">Admin</option>
                            </select>
                          </td>
                          <td className="px-4 py-3">
                            <button type="button" onClick={() => handleToggleUserStatus(user._id, user.isActive)} className={`rounded-full px-3 py-1 text-xs font-bold uppercase tracking-wider ${user.isActive ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'}`}>
                              {user.isActive ? 'Active' : 'Blocked'}
                            </button>
                          </td>
                          <td className="px-4 py-3 text-slate-500">{formatDate(user.createdAt)}</td>
                          <td className="px-4 py-3 text-right">
                            <div className="flex items-center justify-end gap-2">
                              <button type="button" onClick={() => setSelectedEntity({ type: 'user', data: user })} className="rounded-lg border border-slate-200 px-3 py-2 text-xs font-semibold text-slate-700 transition hover:bg-slate-50">View</button>
                              <button type="button" onClick={() => handleDeleteUser(user._id, user.name)} className="rounded-lg border border-rose-200 px-3 py-2 text-xs font-semibold text-rose-700 transition hover:bg-rose-50">Delete</button>
                            </div>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </AdminDataTable>
              <AdminPagination page={userPagination.page} totalPages={userPagination.totalPages} onPageChange={setUserPage} />
            </section>
          )}

          {activeTab === 'listings' && (
            <section className="space-y-4">
              <div className="grid gap-4 lg:grid-cols-3">
                <AdminSearchBar value={listingSearch} onChange={setListingSearch} placeholder="Search listings by title or location" />
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
                <div className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-600">Showing {listingPagination.items.length} of {filteredListings.length} listings</div>
              </div>

              <AdminDataTable>
                <table className="w-full border-collapse text-left text-sm">
                  <thead className="bg-slate-50 text-xs uppercase tracking-wider text-slate-500">
                    <tr>
                      <th className="px-4 py-3">Property</th>
                      <th className="px-4 py-3">Owner</th>
                      <th className="px-4 py-3">Rent</th>
                      <th className="px-4 py-3">Status</th>
                      <th className="px-4 py-3">Created</th>
                      <th className="px-4 py-3 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {listingPagination.items.length === 0 ? (
                      <tr><td colSpan={6} className="px-4 py-10 text-center text-slate-400">No listings found.</td></tr>
                    ) : (
                      listingPagination.items.map((listing) => (
                        <tr key={listing._id} className="hover:bg-slate-50/60">
                          <td className="px-4 py-3">
                            <div className="flex items-center gap-3">
                              {listing.images?.[0]?.url ? <img src={listing.images[0].url} alt={listing.title} className="h-12 w-12 rounded-xl object-cover" /> : <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-slate-100 text-slate-400"><Building2 className="h-5 w-5" /></div>}
                              <div>
                                <p className="font-semibold text-slate-900">{listing.title}</p>
                                <p className="text-xs text-slate-500">{listing.location}</p>
                              </div>
                            </div>
                          </td>
                          <td className="px-4 py-3 text-slate-600">{listing.owner?.name || 'Owner'}</td>
                          <td className="px-4 py-3 font-semibold text-indigo-700">₹{listing.rent?.toLocaleString()}</td>
                          <td className="px-4 py-3">
                            <button type="button" onClick={() => handleToggleListing(listing._id, listing.isActive)} className={`rounded-full px-3 py-1 text-xs font-bold uppercase tracking-wider ${listing.status === 'filled' ? 'bg-amber-100 text-amber-800' : listing.isActive ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-100 text-slate-700'}`}>
                              {listing.status === 'filled' ? 'Filled' : listing.isActive ? 'Active' : 'Hidden'}
                            </button>
                          </td>
                          <td className="px-4 py-3 text-slate-500">{formatDate(listing.createdAt)}</td>
                          <td className="px-4 py-3 text-right">
                            <div className="flex items-center justify-end gap-2">
                              <button type="button" onClick={() => setSelectedEntity({ type: 'listing', data: listing })} className="rounded-lg border border-slate-200 px-3 py-2 text-xs font-semibold text-slate-700 transition hover:bg-slate-50">View</button>
                              <button type="button" onClick={() => handleDeleteListing(listing._id, listing.title)} className="rounded-lg border border-rose-200 px-3 py-2 text-xs font-semibold text-rose-700 transition hover:bg-rose-50">Delete</button>
                            </div>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </AdminDataTable>
              <AdminPagination page={listingPagination.page} totalPages={listingPagination.totalPages} onPageChange={setListingPage} />
            </section>
          )}

          {activeTab === 'interests' && (
            <section className="space-y-4">
              <div className="grid gap-4 lg:grid-cols-2">
                <AdminSearchBar value={interestSearch} onChange={setInterestSearch} placeholder="Search tenant, owner, or listing" />
                <div className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-600">Showing {interestPagination.items.length} of {filteredInterests.length} requests</div>
              </div>

              <AdminDataTable>
                <table className="w-full border-collapse text-left text-sm">
                  <thead className="bg-slate-50 text-xs uppercase tracking-wider text-slate-500">
                    <tr>
                      <th className="px-4 py-3">Tenant</th>
                      <th className="px-4 py-3">Owner</th>
                      <th className="px-4 py-3">Listing</th>
                      <th className="px-4 py-3">Compatibility</th>
                      <th className="px-4 py-3">Status</th>
                      <th className="px-4 py-3">Created</th>
                      <th className="px-4 py-3 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {interestPagination.items.length === 0 ? (
                      <tr><td colSpan={7} className="px-4 py-10 text-center text-slate-400">No interest requests found.</td></tr>
                    ) : (
                      interestPagination.items.map((interest) => (
                        <tr key={interest._id} className="hover:bg-slate-50/60">
                          <td className="px-4 py-3"><p className="font-semibold text-slate-900">{interest.tenant?.name || 'Tenant'}</p><p className="text-xs text-slate-500">{interest.tenant?.email}</p></td>
                          <td className="px-4 py-3"><p className="font-semibold text-slate-900">{interest.owner?.name || 'Owner'}</p><p className="text-xs text-slate-500">{interest.owner?.email}</p></td>
                          <td className="px-4 py-3"><p className="font-semibold text-slate-900">{interest.listing?.title || 'Listing'}</p><p className="text-xs text-slate-500">₹{interest.listing?.rent?.toLocaleString()}</p></td>
                          <td className="px-4 py-3 font-semibold text-indigo-700">{interest.compatibility?.score ?? '—'}</td>
                          <td className="px-4 py-3"><span className={`rounded-full px-3 py-1 text-xs font-bold uppercase tracking-wider ${interest.status === 'accepted' ? 'bg-emerald-100 text-emerald-800' : interest.status === 'declined' ? 'bg-rose-100 text-rose-800' : 'bg-amber-100 text-amber-800'}`}>{interest.status}</span></td>
                          <td className="px-4 py-3 text-slate-500">{formatDate(interest.createdAt)}</td>
                          <td className="px-4 py-3 text-right">
                            <div className="flex items-center justify-end gap-2">
                              <button type="button" onClick={() => setSelectedEntity({ type: 'interest', data: interest })} className="rounded-lg border border-slate-200 px-3 py-2 text-xs font-semibold text-slate-700 transition hover:bg-slate-50">View</button>
                              <button type="button" onClick={() => handleDeleteInterest(interest._id)} className="rounded-lg border border-rose-200 px-3 py-2 text-xs font-semibold text-rose-700 transition hover:bg-rose-50">Delete</button>
                            </div>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </AdminDataTable>
              <AdminPagination page={interestPagination.page} totalPages={interestPagination.totalPages} onPageChange={setInterestPage} />
            </section>
          )}

          {activeTab === 'chats' && (
            <section className="space-y-4">
              <div className="grid gap-4 lg:grid-cols-2">
                <AdminSearchBar value={chatSearch} onChange={setChatSearch} placeholder="Search chats by tenant, owner, or listing" />
                <div className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-600">Showing {chatPagination.items.length} of {filteredChats.length} chats</div>
              </div>

              <AdminDataTable>
                <table className="w-full border-collapse text-left text-sm">
                  <thead className="bg-slate-50 text-xs uppercase tracking-wider text-slate-500">
                    <tr>
                      <th className="px-4 py-3">Owner</th>
                      <th className="px-4 py-3">Tenant</th>
                      <th className="px-4 py-3">Listing</th>
                      <th className="px-4 py-3">Last Message</th>
                      <th className="px-4 py-3">Last Active</th>
                      <th className="px-4 py-3 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {chatPagination.items.length === 0 ? (
                      <tr><td colSpan={6} className="px-4 py-10 text-center text-slate-400">No chats found.</td></tr>
                    ) : (
                      chatPagination.items.map((chat) => (
                        <tr key={chat._id} className="hover:bg-slate-50/60">
                          <td className="px-4 py-3"><p className="font-semibold text-slate-900">{chat.owner?.name || 'Owner'}</p><p className="text-xs text-slate-500">{chat.owner?.email}</p></td>
                          <td className="px-4 py-3"><p className="font-semibold text-slate-900">{chat.tenant?.name || 'Tenant'}</p><p className="text-xs text-slate-500">{chat.tenant?.email}</p></td>
                          <td className="px-4 py-3 font-semibold text-slate-900">{chat.listing?.title || 'Listing'}</td>
                          <td className="px-4 py-3 text-slate-600">{chat.lastMessage?.content ? chat.lastMessage.content.slice(0, 40) : 'No messages yet'}</td>
                          <td className="px-4 py-3 text-slate-500">{formatDate(chat.lastMessageAt || chat.updatedAt)}</td>
                          <td className="px-4 py-3 text-right">
                            <div className="flex items-center justify-end gap-2">
                              <button type="button" onClick={() => openChatHistory(chat)} className="rounded-lg border border-slate-200 px-3 py-2 text-xs font-semibold text-slate-700 transition hover:bg-slate-50">View History</button>
                              <button type="button" onClick={() => handleDeleteChat(chat._id)} className="rounded-lg border border-rose-200 px-3 py-2 text-xs font-semibold text-rose-700 transition hover:bg-rose-50">Delete</button>
                            </div>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </AdminDataTable>
              <AdminPagination page={chatPagination.page} totalPages={chatPagination.totalPages} onPageChange={setChatPage} />
            </section>
          )}

          {activeTab === 'activity' && (
            <section className="space-y-4">
              <div className="grid gap-4 lg:grid-cols-2">
                <AdminSearchBar value={activitySearch} onChange={setActivitySearch} placeholder="Search activity logs" />
                <div className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-600">Showing {activityPagination.items.length} of {filteredActivity.length} activities</div>
              </div>

              <div className="space-y-3">
                {activityPagination.items.length === 0 ? (
                  <div className="rounded-2xl border border-slate-200 bg-white px-6 py-12 text-center text-slate-400 shadow-sm">No activity logs found.</div>
                ) : (
                  activityPagination.items.map((log) => (
                    <div key={log._id} className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
                      <div className="flex items-start justify-between gap-4">
                        <div>
                          <p className="text-xs font-bold uppercase tracking-widest text-indigo-600">{log.action}</p>
                          <p className="mt-1 text-sm font-medium text-slate-900">{log.description}</p>
                          <p className="mt-1 text-xs text-slate-500">{log.user?.name || 'System'} · {log.user?.role || 'system'}</p>
                        </div>
                        <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-600">{formatDate(log.createdAt)}</span>
                      </div>
                    </div>
                  ))
                )}
              </div>

              <AdminPagination page={activityPagination.page} totalPages={activityPagination.totalPages} onPageChange={setActivityPage} />
            </section>
          )}

          {activeTab === 'settings' && (
            <div className="rounded-3xl border border-slate-200 bg-white p-8 shadow-sm">
              <h2 className="text-xl font-bold text-slate-900">Admin settings</h2>
              <p className="mt-2 text-sm text-slate-600">
                Use the shared account settings at{' '}
                <Link to="/dashboard/settings" className="font-semibold text-indigo-600 hover:text-indigo-500">
                  /dashboard/settings
                </Link>
                .
              </p>
            </div>
          )}
        </>
      )}

      {selectedEntity && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/70 p-4">
          <div className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-3xl bg-white p-6 shadow-2xl">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-xs font-bold uppercase tracking-widest text-slate-400">{selectedType}</p>
                <h3 className="mt-1 text-2xl font-bold text-slate-900">Details</h3>
              </div>
              <button type="button" onClick={() => setSelectedEntity(null)} className="rounded-full bg-slate-100 p-2 text-slate-600 hover:bg-slate-200">
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="mt-6 space-y-4 text-sm text-slate-700">
              {selectedType === 'user' && (
                <>
                  <p><strong>Name:</strong> {selectedData.name}</p>
                  <p><strong>Email:</strong> {selectedData.email}</p>
                  <p><strong>Role:</strong> {selectedData.role}</p>
                  <p><strong>Status:</strong> {selectedData.isActive ? 'Active' : 'Blocked'}</p>
                  <p><strong>Created:</strong> {formatDate(selectedData.createdAt)}</p>
                </>
              )}
              {selectedType === 'listing' && (
                <>
                  <p><strong>Title:</strong> {selectedData.title}</p>
                  <p><strong>Location:</strong> {selectedData.location}</p>
                  <p><strong>Rent:</strong> ₹{selectedData.rent?.toLocaleString()}</p>
                  <p><strong>Room Type:</strong> {selectedData.roomType}</p>
                  <p><strong>Furnishing:</strong> {selectedData.furnished ? 'Furnished' : 'Unfurnished'}</p>
                  <p><strong>Status:</strong> {selectedData.status === 'filled' ? 'Filled' : selectedData.isActive ? 'Active' : 'Hidden'}</p>
                </>
              )}
              {selectedType === 'interest' && (
                <>
                  <p><strong>Tenant:</strong> {selectedData.tenant?.name}</p>
                  <p><strong>Owner:</strong> {selectedData.owner?.name}</p>
                  <p><strong>Listing:</strong> {selectedData.listing?.title}</p>
                  <p><strong>Compatibility Score:</strong> {selectedData.compatibility?.score ?? '—'}</p>
                  <p><strong>Status:</strong> {selectedData.status}</p>
                  <p><strong>Message:</strong> {selectedData.tenantMessage || 'No message'}</p>
                </>
              )}
            </div>
          </div>
        </div>
      )}

      {selectedChat && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/70 p-4">
          <div className="max-h-[90vh] w-full max-w-3xl overflow-y-auto rounded-3xl bg-white p-6 shadow-2xl">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-xs font-bold uppercase tracking-widest text-slate-400">Chat History</p>
                <h3 className="mt-1 text-2xl font-bold text-slate-900">{selectedChat.listing?.title || 'Conversation'}</h3>
                <p className="mt-1 text-sm text-slate-500">{selectedChat.owner?.name} · {selectedChat.tenant?.name}</p>
              </div>
              <button type="button" onClick={() => setSelectedChat(null)} className="rounded-full bg-slate-100 p-2 text-slate-600 hover:bg-slate-200">
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="mt-6 space-y-3">
              {chatLoading ? (
                <div className="flex items-center gap-3 text-slate-600">
                  <Loader2 className="h-5 w-5 animate-spin" />
                  Loading messages...
                </div>
              ) : chatMessages.length === 0 ? (
                <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-10 text-center text-slate-400">No messages in this chat.</div>
              ) : (
                chatMessages.map((message) => (
                  <div key={message._id} className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                    <div className="flex items-center justify-between gap-3">
                      <p className="font-semibold text-slate-900">{message.sender?.name || 'User'}</p>
                      <p className="text-xs text-slate-500">{formatDate(message.createdAt)}</p>
                    </div>
                    <p className="mt-2 whitespace-pre-wrap text-sm text-slate-700">{message.content}</p>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default AdminDashboard