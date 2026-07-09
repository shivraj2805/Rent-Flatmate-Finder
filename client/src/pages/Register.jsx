import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import useAuth from '../hooks/useAuth.jsx'

const Register = () => {
  const navigate = useNavigate()
  const { register, error, clearError } = useAuth()
  const [form, setForm] = useState({
    name: '',
    email: '',
    password: '',
    role: 'tenant',
  })
  const [submitting, setSubmitting] = useState(false)

  const handleChange = (event) => {
    const { name, value } = event.target
    setForm((current) => ({ ...current, [name]: value }))
  }

  const handleSubmit = async (event) => {
    event.preventDefault()
    clearError()
    setSubmitting(true)

    try {
      await register(form)
      navigate('/dashboard', { replace: true })
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-950 px-4 py-10 text-slate-100">
      <div className="grid w-full max-w-5xl overflow-hidden rounded-[2rem] border border-white/10 bg-white/5 shadow-2xl shadow-emerald-950/20 lg:grid-cols-[1fr_1fr]">
        <section className="hidden flex-col justify-between border-r border-white/10 bg-[radial-gradient(circle_at_top,_rgba(16,185,129,0.18),_transparent_55%),linear-gradient(160deg,#0f172a_0%,#020617_100%)] p-10 lg:flex">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.35em] text-emerald-200">
              Join the platform
            </p>
            <h1 className="mt-6 max-w-md text-4xl font-semibold tracking-tight text-white">
              Create an account as a tenant or owner.
            </h1>
          </div>

          <div className="rounded-3xl border border-white/10 bg-white/5 p-6 text-sm text-slate-300">
            Role selection is limited to tenant and owner during registration, matching the backend rules.
          </div>
        </section>

        <section className="p-6 sm:p-10">
          <div className="mb-8">
            <p className="text-sm uppercase tracking-[0.35em] text-slate-400">Start here</p>
            <h2 className="mt-3 text-3xl font-semibold text-white">Register</h2>
          </div>

          <form className="space-y-5" onSubmit={handleSubmit}>
            <label className="block space-y-2">
              <span className="text-sm font-medium text-slate-300">Full name</span>
              <input
                type="text"
                name="name"
                value={form.name}
                onChange={handleChange}
                required
                className="w-full rounded-2xl border border-white/10 bg-slate-900/70 px-4 py-3 text-slate-100 outline-none transition placeholder:text-slate-500 focus:border-emerald-400/50"
                placeholder="Alex Morgan"
              />
            </label>

            <label className="block space-y-2">
              <span className="text-sm font-medium text-slate-300">Email</span>
              <input
                type="email"
                name="email"
                value={form.email}
                onChange={handleChange}
                required
                className="w-full rounded-2xl border border-white/10 bg-slate-900/70 px-4 py-3 text-slate-100 outline-none transition placeholder:text-slate-500 focus:border-emerald-400/50"
                placeholder="you@example.com"
              />
            </label>

            <label className="block space-y-2">
              <span className="text-sm font-medium text-slate-300">Password</span>
              <input
                type="password"
                name="password"
                value={form.password}
                onChange={handleChange}
                required
                className="w-full rounded-2xl border border-white/10 bg-slate-900/70 px-4 py-3 text-slate-100 outline-none transition placeholder:text-slate-500 focus:border-emerald-400/50"
                placeholder="Minimum 8 characters"
              />
            </label>

            <label className="block space-y-2">
              <span className="text-sm font-medium text-slate-300">Role</span>
              <select
                name="role"
                value={form.role}
                onChange={handleChange}
                className="w-full rounded-2xl border border-white/10 bg-slate-900/70 px-4 py-3 text-slate-100 outline-none transition focus:border-emerald-400/50"
              >
                <option value="tenant">Tenant</option>
                <option value="owner">Owner</option>
              </select>
            </label>

            {error ? (
              <div className="rounded-2xl border border-rose-400/20 bg-rose-400/10 px-4 py-3 text-sm text-rose-200">
                {error}
              </div>
            ) : null}

            <button
              type="submit"
              disabled={submitting}
              className="w-full rounded-2xl bg-emerald-400 px-4 py-3 font-semibold text-slate-950 transition hover:bg-emerald-300 disabled:cursor-not-allowed disabled:opacity-70"
            >
              {submitting ? 'Creating account...' : 'Register'}
            </button>
          </form>

          <p className="mt-6 text-sm text-slate-400">
            Already registered?{' '}
            <Link to="/login" className="font-medium text-emerald-200 hover:text-emerald-100">
              Login
            </Link>
          </p>
        </section>
      </div>
    </main>
  )
}

export default Register