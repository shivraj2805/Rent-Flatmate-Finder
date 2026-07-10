import { Link } from 'react-router-dom'
import useAuth from '../../hooks/useAuth.jsx'

const OwnerDashboard = () => {
  const { user } = useAuth()

  return (
    <div className="space-y-6">
      <section className="rounded-[2rem] border border-white/10 bg-white/5 p-6">
        <p className="text-sm uppercase tracking-[0.35em] text-slate-400">Owner dashboard</p>
        <h1 className="mt-3 text-3xl font-semibold text-white">
          Manage your listings, {user?.name || 'owner'}
        </h1>
        <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-300">
          Create, edit, and manage your room listings from one place.
        </p>
      </section>

      <div className="grid gap-4 md:grid-cols-3">
        <Link
          to="/dashboard/owner/listings/new"
          className="rounded-3xl border border-emerald-400/20 bg-emerald-400/10 p-5 transition hover:border-emerald-400/40 hover:bg-emerald-400/15"
        >
          <p className="text-xs uppercase tracking-[0.3em] text-emerald-200">Create</p>
          <p className="mt-3 text-lg font-semibold text-white">Add a new listing</p>
        </Link>
        <Link
          to="/dashboard/owner/listings"
          className="rounded-3xl border border-white/10 bg-slate-900/60 p-5 transition hover:bg-slate-900/80"
        >
          <p className="text-xs uppercase tracking-[0.3em] text-slate-500">Manage</p>
          <p className="mt-3 text-lg font-semibold text-white">View my listings</p>
        </Link>
        <div className="rounded-3xl border border-white/10 bg-slate-900/60 p-5">
          <p className="text-xs uppercase tracking-[0.3em] text-slate-500">Workflow</p>
          <p className="mt-3 text-lg font-semibold text-white">Cloudinary upload ready</p>
        </div>
      </div>
    </div>
  )
}

export default OwnerDashboard