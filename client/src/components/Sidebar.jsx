import { NavLink } from 'react-router-dom'
import useAuth from '../hooks/useAuth.jsx'

const linkClassName = ({ isActive }) =>
  [
    'rounded-2xl px-4 py-3 text-sm font-medium transition',
    isActive
      ? 'bg-emerald-400/15 text-emerald-200 border border-emerald-400/20'
      : 'text-slate-300 hover:bg-white/5 hover:text-white',
  ].join(' ')

const Sidebar = () => {
  const { user } = useAuth()

  return (
    <aside className="border-r border-white/10 bg-slate-950/60 px-4 py-6">
      <nav className="space-y-2">
        <NavLink to="/dashboard" end className={linkClassName}>
          Dashboard
        </NavLink>

        {(user?.role === 'owner' || user?.role === 'admin') && (
          <>
            <NavLink to="/dashboard/owner" end className={linkClassName}>
              Owner Overview
            </NavLink>
            <NavLink to="/dashboard/owner/listings" className={linkClassName}>
              My Listings
            </NavLink>
            <NavLink to="/dashboard/owner/listings/new" className={linkClassName}>
              Add Listing
            </NavLink>
          </>
        )}
      </nav>
    </aside>
  )
}

export default Sidebar