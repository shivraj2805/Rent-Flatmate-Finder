import { NavLink } from 'react-router-dom'

const linkClassName = ({ isActive }) =>
  [
    'rounded-2xl px-4 py-3 text-sm font-medium transition',
    isActive
      ? 'bg-emerald-400/15 text-emerald-200 border border-emerald-400/20'
      : 'text-slate-300 hover:bg-white/5 hover:text-white',
  ].join(' ')

const Sidebar = () => {
  return (
    <aside className="border-r border-white/10 bg-slate-950/60 px-4 py-6">
      <nav className="space-y-2">
        <NavLink to="/dashboard" end className={linkClassName}>
          Dashboard
        </NavLink>
        <div className="rounded-2xl border border-dashed border-white/10 px-4 py-3 text-sm text-slate-500">
          Owner and tenant pages will expand in later steps.
        </div>
      </nav>
    </aside>
  )
}

export default Sidebar