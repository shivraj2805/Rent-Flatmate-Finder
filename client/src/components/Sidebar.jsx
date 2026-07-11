import { NavLink } from 'react-router-dom'
import {
  LayoutDashboard,
  Building2,
  PlusSquare,
  List,
  Search,
  UserCircle,
  Heart,
  MessageSquare,
  Settings,
  Shield,
} from 'lucide-react'
import useAuth from '../hooks/useAuth.jsx'

const NavItem = ({ to, icon: Icon, label, end = false }) => (
  <NavLink
    to={to}
    end={end}
    className={({ isActive }) =>
      [
        'flex items-center gap-3 rounded-xl px-3.5 py-2.5 text-sm font-medium transition-all duration-150',
        isActive
          ? 'bg-indigo-50 text-indigo-700 font-semibold'
          : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900',
      ].join(' ')
    }
  >
    {({ isActive }) => (
      <>
        <Icon
          className={`h-4.5 w-4.5 flex-shrink-0 ${isActive ? 'text-indigo-600' : 'text-slate-400'}`}
          strokeWidth={isActive ? 2.2 : 1.8}
        />
        <span>{label}</span>
        {isActive && (
          <span className="ml-auto h-1.5 w-1.5 rounded-full bg-indigo-500" />
        )}
      </>
    )}
  </NavLink>
)

const SectionLabel = ({ label }) => (
  <p className="mb-1 mt-5 px-3 text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400 first:mt-0">
    {label}
  </p>
)

const Sidebar = () => {
  const { user } = useAuth()
  const isOwnerOrAdmin = user?.role === 'owner' || user?.role === 'admin'
  const isTenantOrAdmin = user?.role === 'tenant' || user?.role === 'admin'

  return (
    <aside className="hidden w-64 flex-shrink-0 border-r border-slate-200 bg-white lg:flex lg:flex-col sticky top-16 h-[calc(100vh-4rem)]">
      <nav className="flex-1 overflow-y-auto p-4">
        {/* Overview */}
        <SectionLabel label="Overview" />
        <NavItem to="/dashboard" icon={LayoutDashboard} label="Dashboard" end />

        {/* Owner section */}
        {isOwnerOrAdmin && (
          <>
            <SectionLabel label="Owner Tools" />
            <NavItem to="/dashboard/owner" icon={Building2} label="Owner Overview" end />
            <NavItem to="/dashboard/owner/listings" icon={List} label="My Listings" />
            <NavItem to="/dashboard/owner/listings/new" icon={PlusSquare} label="Add Listing" />
            <NavItem to="/dashboard/owner/interests" icon={Heart} label="Interest Requests" />
            <NavItem to="/dashboard/tenant/chats" icon={MessageSquare} label="My Chats" />
          </>
        )}

        {/* Tenant section */}
        {isTenantOrAdmin && (
          <>
            <SectionLabel label="Tenant Tools" />
            <NavItem to="/dashboard/tenant/browse" icon={Search} label="Browse Listings" />
            <NavItem to="/dashboard/tenant/profile" icon={UserCircle} label="My Profile" />
            <NavItem to="/dashboard/tenant/interests" icon={Heart} label="My Interests" />
            <NavItem to="/dashboard/tenant/chats" icon={MessageSquare} label="My Chats" />
          </>
        )}

        {user?.role === 'admin' && (
          <>
            <SectionLabel label="Admin Tools" />
            <NavItem to="/admin/dashboard" icon={Shield} label="Admin Dashboard" />
          </>
        )}

        {/* General */}
        <SectionLabel label="Account" />
        <NavItem to="/dashboard/settings" icon={Settings} label="Settings" />
      </nav>

      {/* Footer */}
      <div className="border-t border-slate-100 p-4">
        <div className="rounded-xl bg-indigo-50 p-3">
          <p className="text-xs font-semibold text-indigo-800">RoomSync v1.0</p>
          <p className="mt-0.5 text-[10px] text-indigo-500">Rent & Flatmate Finder</p>
        </div>
      </div>
    </aside>
  )
}

export default Sidebar