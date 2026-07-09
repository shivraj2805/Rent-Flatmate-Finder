import { Link } from 'react-router-dom'
import useAuth from '../hooks/useAuth.jsx'

const Navbar = () => {
  const { user, logout } = useAuth()

  return (
    <header className="border-b border-white/10 bg-slate-950/80 backdrop-blur">
      <div className="mx-auto flex h-16 w-full max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <Link to="/dashboard" className="text-sm font-semibold tracking-[0.3em] text-emerald-200">
          RENT FINDER
        </Link>

        <div className="flex items-center gap-3">
          <div className="hidden text-right sm:block">
            <p className="text-sm font-medium text-white">{user?.name}</p>
            <p className="text-xs uppercase tracking-[0.25em] text-slate-400">{user?.role}</p>
          </div>

          <button
            type="button"
            onClick={logout}
            className="rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm font-medium text-slate-200 transition hover:border-emerald-400/40 hover:bg-emerald-400/10"
          >
            Logout
          </button>
        </div>
      </div>
    </header>
  )
}

export default Navbar