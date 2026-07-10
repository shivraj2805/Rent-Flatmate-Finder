import useAuth from '../hooks/useAuth.jsx'
import { Link } from 'react-router-dom'

const Dashboard = () => {
  const { user } = useAuth()

  return (
    <div className="space-y-6">
      <section className="rounded-[2rem] border border-white/10 bg-white/5 p-6 shadow-2xl shadow-emerald-950/10">
        <p className="text-sm uppercase tracking-[0.35em] text-slate-400">Dashboard</p>
        <h1 className="mt-3 text-3xl font-semibold text-white">
          Welcome back, {user?.name || 'User'}
        </h1>
        <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-300">
          Your authenticated shell is ready. Later steps will plug the owner and tenant
          workflow into this dashboard layout.
        </p>
      </section>

      <section className="grid gap-4 md:grid-cols-3">
        {[
          { label: 'Role', value: user?.role || 'tenant' },
          { label: 'Session', value: 'Protected' },
          { label: 'Next', value: 'Owner and tenant modules' },
        ].map((item) => (
          <div key={item.label} className="rounded-3xl border border-white/10 bg-slate-900/60 p-5">
            <p className="text-xs uppercase tracking-[0.3em] text-slate-500">{item.label}</p>
            <p className="mt-3 text-lg font-semibold text-white">{item.value}</p>
          </div>
        ))}
      </section>

      {(user?.role === 'owner' || user?.role === 'admin') && (
        <section className="rounded-[2rem] border border-emerald-400/20 bg-emerald-400/10 p-6">
          <p className="text-sm uppercase tracking-[0.35em] text-emerald-200">Owner tools</p>
          <div className="mt-4 flex flex-wrap gap-3">
            <Link
              to="/dashboard/owner/listings/new"
              className="rounded-2xl bg-emerald-400 px-4 py-3 text-sm font-semibold text-slate-950"
            >
              Add Listing
            </Link>
            <Link
              to="/dashboard/owner/listings"
              className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm font-semibold text-white"
            >
              View My Listings
            </Link>
          </div>
        </section>
      )}
    </div>
  )
}

export default Dashboard