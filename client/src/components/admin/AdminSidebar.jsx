import { NavLink } from 'react-router-dom'
import {
  LayoutDashboard,
  Users,
  Building2,
  Heart,
  MessageSquare,
  Activity,
  Settings,
  LogOut,
  Shield,
} from 'lucide-react'
import useAuth from '../../hooks/useAuth.jsx'

const items = [
  { to: '/admin/dashboard', label: 'Dashboard', icon: LayoutDashboard, end: true },
  { to: '/admin/users', label: 'Users', icon: Users },
  { to: '/admin/listings', label: 'Listings', icon: Building2 },
  { to: '/admin/interests', label: 'Interest Requests', icon: Heart },
  { to: '/admin/chats', label: 'Chats', icon: MessageSquare },
  { to: '/admin/activity', label: 'Activity Logs', icon: Activity },
  { to: '/admin/settings', label: 'Settings', icon: Settings },
]

const AdminSidebar = ({ mobileOpen = false, onClose = () => {} }) => {
  const { user, logout } = useAuth()

  const handleLogout = () => {
    onClose()
    logout()
  }

  return (
    <>
      <aside
        className={`fixed inset-y-0 left-0 z-40 w-72 transform border-r border-slate-200 bg-white shadow-2xl transition-transform duration-200 lg:static lg:z-auto lg:flex lg:w-72 lg:flex-col lg:shadow-none ${mobileOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}`}
      >
        <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4 lg:px-6">
          <div className="flex items-center gap-2.5">
            <span className="flex h-10 w-10 items-center justify-center rounded-2xl bg-slate-900 text-white">
              <Shield className="h-5 w-5" />
            </span>
            <div>
              <p className="text-sm font-bold text-slate-900">Admin Panel</p>
              <p className="text-xs text-slate-500">RoomSync control center</p>
            </div>
          </div>
          <button type="button" onClick={onClose} className="rounded-lg p-2 text-slate-500 hover:bg-slate-100 lg:hidden">
            ×
          </button>
        </div>

        <div className="border-b border-slate-100 px-5 py-4">
          <p className="text-xs font-semibold uppercase tracking-widest text-slate-400">Signed in as</p>
          <p className="mt-1 text-sm font-bold text-slate-900">{user?.name}</p>
          <p className="text-xs text-slate-500">{user?.email}</p>
        </div>

        <nav className="flex-1 overflow-y-auto p-4">
          <div className="space-y-1">
            {items.map(({ to, label, icon: Icon, end }) => (
              <NavLink
                key={to}
                to={to}
                end={end}
                onClick={onClose}
                className={({ isActive }) =>
                  [
                    'flex items-center gap-3 rounded-xl px-3.5 py-2.5 text-sm font-medium transition',
                    isActive ? 'bg-slate-900 text-white shadow-sm' : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900',
                  ].join(' ')
                }
              >
                <Icon className="h-4.5 w-4.5 flex-shrink-0" />
                <span>{label}</span>
              </NavLink>
            ))}
          </div>
        </nav>

        <div className="border-t border-slate-100 p-4">
          <button
            type="button"
            onClick={handleLogout}
            className="flex w-full items-center justify-center gap-2 rounded-xl bg-rose-50 px-4 py-2.5 text-sm font-bold text-rose-600 transition hover:bg-rose-100"
          >
            <LogOut className="h-4 w-4" />
            Logout
          </button>
        </div>
      </aside>

      {mobileOpen && <div className="fixed inset-0 z-30 bg-slate-900/50 lg:hidden" onClick={onClose} />}
    </>
  )
}

export default AdminSidebar