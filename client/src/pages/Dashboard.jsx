import useAuth from '../hooks/useAuth.jsx'

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
    </div>
  )
}

export default Dashboard