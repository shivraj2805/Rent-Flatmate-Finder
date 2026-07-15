import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { House, ArrowRight, Sparkles } from 'lucide-react'
import useAuth from '../hooks/useAuth.jsx'
import logoImg from '../assets/logo.png'

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
  const [validationError, setValidationError] = useState('')

  const handleChange = (event) => {
    let { name, value } = event.target
    if (name === 'name') {
      value = value.replace(/[0-9]/g, '')
    }
    setValidationError('')
    clearError()
    setForm((current) => ({ ...current, [name]: value }))
  }

  const handleSubmit = async (event) => {
    event.preventDefault()
    clearError()
    setValidationError('')

    // Validate name
    const trimmedName = form.name.trim()
    if (trimmedName.length < 2) {
      setValidationError('Name must be at least 2 characters long')
      return
    }
    if (/\d/.test(trimmedName)) {
      setValidationError('Name cannot contain numbers')
      return
    }

    // Validate email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(form.email)) {
      setValidationError('Please provide a valid email address')
      return
    }

    // Validate password
    if (form.password.length < 8) {
      setValidationError('Password must be at least 8 characters long')
      return
    }
    if (!/(?=.*[a-zA-Z])(?=.*\d)/.test(form.password)) {
      setValidationError('Password must contain at least one letter and one number')
      return
    }

    setSubmitting(true)
    try {
      await register({ ...form, name: trimmedName })
      navigate('/dashboard', { replace: true })
    } catch (err) {
      // Errors from server are set in the context error state
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <main className="relative flex min-h-screen items-center justify-center bg-slate-50 px-4 py-12 text-slate-900 overflow-hidden">
      {/* Background glowing decorations */}
      <div className="absolute top-[-10%] left-[-10%] h-[50%] w-[50%] rounded-full bg-indigo-500/5 blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] h-[50%] w-[50%] rounded-full bg-emerald-500/5 blur-[120px] pointer-events-none" />

      <div className="relative z-10 grid w-full max-w-5xl overflow-hidden rounded-3xl border border-slate-200/80 bg-white shadow-2xl shadow-slate-200/60 lg:grid-cols-[1fr_1fr]">
        
        {/* Left Side: Brand Panel */}
        <section className="hidden flex-col justify-between border-r border-slate-100 bg-[linear-gradient(135deg,#fcfcfd_0%,#f8fafc_60%,#eef2ff_100%)] p-10 lg:flex text-left">
          <div className="space-y-6">
            <Link to="/" className="flex items-center group">
              <img src={logoImg} alt="RoomSync Logo" className="h-20 w-auto object-contain hover:scale-102 transition-transform duration-300" />
            </Link>

            <div className="space-y-4 pt-4">
              <span className="inline-flex items-center gap-1 text-[10px] font-extrabold uppercase tracking-wider text-indigo-600 bg-indigo-50 border border-indigo-100/50 px-2.5 py-1 rounded-full">
                <Sparkles className="h-3 w-3" /> get started free
              </span>
              <h1 
                className="text-3xl font-extrabold text-slate-950 tracking-tight leading-tight"
                style={{ fontFamily: 'Outfit, sans-serif' }}
              >
                Create your account as a tenant or owner
              </h1>
              <p className="text-sm leading-relaxed text-slate-500">
                Join our verified network in Pune. Discover compatible flatmates or list rooms to find ideal tenants.
              </p>
            </div>
          </div>

          <div className="rounded-2xl border border-slate-150 bg-white/70 backdrop-blur-sm p-5 text-xs font-medium text-slate-500 leading-relaxed">
            ✨ Registration roles are strictly validated (Tenant or Owner) to sync correctly with authorization gates.
          </div>
        </section>

        {/* Right Side: Form Panel */}
        <section className="p-8 sm:p-12 flex flex-col justify-center text-left">
          <Link 
            to="/" 
            className="lg:hidden mb-6 inline-flex w-fit items-center gap-2 rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-xs font-bold text-slate-600 shadow-sm transition hover:bg-slate-50 hover:text-slate-900"
          >
            <House className="h-3.5 w-3.5" />
            Back to Home
          </Link>

          <div className="mb-8">
            <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Join the Community</p>
            <h2 
              className="mt-2.5 text-3xl font-extrabold text-slate-950"
              style={{ fontFamily: 'Outfit, sans-serif' }}
            >
              Register
            </h2>
          </div>

          <form className="space-y-4" onSubmit={handleSubmit}>
            <label className="block space-y-1.5">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-600">Full Name</span>
              <input
                type="text"
                name="name"
                value={form.name}
                onChange={handleChange}
                required
                className="w-full rounded-xl border border-slate-200 bg-slate-50/50 px-4 py-2.5 text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-indigo-600 focus:bg-white text-sm"
                placeholder="Alex Morgan"
              />
            </label>

            <label className="block space-y-1.5">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-600">Email Address</span>
              <input
                type="email"
                name="email"
                value={form.email}
                onChange={handleChange}
                required
                className="w-full rounded-xl border border-slate-200 bg-slate-50/50 px-4 py-2.5 text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-indigo-600 focus:bg-white text-sm"
                placeholder="alex@example.com"
              />
            </label>

            <label className="block space-y-1.5">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-600">Password</span>
              <input
                type="password"
                name="password"
                value={form.password}
                onChange={handleChange}
                required
                className="w-full rounded-xl border border-slate-200 bg-slate-50/50 px-4 py-2.5 text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-indigo-600 focus:bg-white text-sm"
                placeholder="Minimum 8 characters"
              />
            </label>

            <label className="block space-y-1.5">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-600">Select Role</span>
              <select
                name="role"
                value={form.role}
                onChange={handleChange}
                className="w-full rounded-xl border border-slate-200 bg-slate-50/50 px-4 py-2.5 text-slate-900 outline-none transition focus:border-indigo-600 focus:bg-white text-sm cursor-pointer"
              >
                <option value="tenant">Tenant (Looking for flat/flatmate)</option>
                <option value="owner">Owner (Has flat/room to rent)</option>
              </select>
            </label>

            {validationError || error ? (
              <div className="rounded-xl border border-rose-100 bg-rose-50 px-4 py-3 text-xs font-semibold text-rose-600 leading-relaxed">
                {validationError || error}
              </div>
            ) : null}

            <button
              type="submit"
              disabled={submitting}
              className="w-full inline-flex items-center justify-center gap-1.5 rounded-xl bg-slate-950 py-3 text-sm font-bold text-white shadow-lg hover:bg-indigo-600 hover:scale-[1.01] transition-all duration-200 disabled:cursor-not-allowed disabled:opacity-70 focus:outline-none mt-2"
            >
              <span>{submitting ? 'Creating account...' : 'Register'}</span>
              <ArrowRight className="h-4 w-4" />
            </button>
          </form>

          <p className="mt-6 text-xs font-medium text-slate-400 uppercase tracking-wider text-center lg:text-left">
            Already registered?{' '}
            <Link to="/login" className="font-bold text-indigo-600 hover:text-indigo-700">
              Login
            </Link>
          </p>
        </section>

      </div>
    </main>
  )
}

export default Register