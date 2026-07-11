import { useState } from 'react'
import { Link } from 'react-router-dom'
import { House, LogOut, Bell, ChevronDown, User, Shield } from 'lucide-react'
import useAuth from '../hooks/useAuth.jsx'

const Navbar = () => {
  const { user, logout } = useAuth()
  const [menuOpen, setMenuOpen] = useState(false)

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
        <Link to="/dashboard" className="flex items-center gap-2.5 group">
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
          {/* Notification bell (placeholder) */}
          <button
            type="button"
            className="relative flex h-9 w-9 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-500 transition hover:bg-slate-50 hover:text-slate-700"
          >
            <Bell className="h-4 w-4" />
            <span className="absolute right-1.5 top-1.5 h-2 w-2 rounded-full bg-indigo-500 ring-2 ring-white" />
          </button>

          {/* User menu */}
          <div className="relative">
            <button
              type="button"
              onClick={() => setMenuOpen((v) => !v)}
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