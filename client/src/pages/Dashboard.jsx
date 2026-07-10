import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import {
  Building2, PlusCircle, List, TrendingUp, Eye, EyeOff,
  Search, UserCircle, Heart, MessageSquare, ArrowRight,
  CheckCircle2, Sparkles, MapPin,
} from 'lucide-react'
import useAuth from '../hooks/useAuth.jsx'
import listingService from '../services/listingService.js'

// ─── Reusable atoms ────────────────────────────────────────────────────────────

const StatCard = ({ icon: Icon, label, value, sub, color = 'indigo' }) => {
  const colors = {
    indigo: 'bg-indigo-50 text-indigo-600 border-indigo-100',
    emerald: 'bg-emerald-50 text-emerald-600 border-emerald-100',
    amber: 'bg-amber-50 text-amber-600 border-amber-100',
    rose: 'bg-rose-50 text-rose-600 border-rose-100',
    violet: 'bg-violet-50 text-violet-600 border-violet-100',
    slate: 'bg-slate-100 text-slate-600 border-slate-200',
  }

  return (
    <div className="flex flex-col rounded-2xl border border-slate-200 bg-white p-5 shadow-sm shadow-slate-100 transition hover:shadow-md hover:shadow-slate-100">
      <div className={`flex h-10 w-10 items-center justify-center rounded-xl border ${colors[color]}`}>
        <Icon className="h-5 w-5" strokeWidth={1.8} />
      </div>
      <p className="mt-4 text-2xl font-bold text-slate-900">{value}</p>
      <p className="mt-0.5 text-sm font-semibold text-slate-700">{label}</p>
      {sub && <p className="mt-1 text-xs text-slate-400">{sub}</p>}
    </div>
  )
}

const ActionCard = ({ to, icon: Icon, title, description, badge, color = 'indigo' }) => {
  const colors = {
    indigo: 'hover:border-indigo-200 hover:bg-indigo-50/50 group-hover:text-indigo-600',
    emerald: 'hover:border-emerald-200 hover:bg-emerald-50/50 group-hover:text-emerald-600',
    violet: 'hover:border-violet-200 hover:bg-violet-50/50 group-hover:text-violet-600',
    amber: 'hover:border-amber-200 hover:bg-amber-50/50 group-hover:text-amber-600',
    slate: 'hover:border-slate-300 hover:bg-slate-50',
  }

  const iconColors = {
    indigo: 'bg-indigo-50 text-indigo-500 group-hover:bg-indigo-100',
    emerald: 'bg-emerald-50 text-emerald-500 group-hover:bg-emerald-100',
    violet: 'bg-violet-50 text-violet-500 group-hover:bg-violet-100',
    amber: 'bg-amber-50 text-amber-500 group-hover:bg-amber-100',
    slate: 'bg-slate-100 text-slate-500 group-hover:bg-slate-200',
  }

  return (
    <Link
      to={to}
      className={`group flex items-start gap-4 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition-all duration-200 ${colors[color]}`}
    >
      <div className={`flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-xl transition-colors ${iconColors[color]}`}>
        <Icon className="h-5 w-5" strokeWidth={1.8} />
      </div>
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2">
          <p className="text-sm font-semibold text-slate-800 group-hover:text-slate-900">{title}</p>
          {badge && (
            <span className="rounded-full bg-indigo-100 px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider text-indigo-600">
              {badge}
            </span>
          )}
        </div>
        <p className="mt-0.5 text-xs leading-relaxed text-slate-500">{description}</p>
      </div>
      <ArrowRight className="h-4 w-4 flex-shrink-0 text-slate-300 transition-all group-hover:translate-x-1 group-hover:text-slate-500" />
    </Link>
  )
}

// ─── Owner Dashboard ───────────────────────────────────────────────────────────

const OwnerDashboard = ({ user }) => {
  const [stats, setStats] = useState({ total: 0, active: 0, inactive: 0 })
  const [recentListings, setRecentListings] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const load = async () => {
      try {
        const res = await listingService.getMyListings()
        const listings = res.listings || []
        setStats({
          total: listings.length,
          active: listings.filter((l) => l.isActive).length,
          inactive: listings.filter((l) => !l.isActive).length,
        })
        setRecentListings(listings.slice(0, 3))
      } catch {
        // silently ignore
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [])

  const hour = new Date().getHours()
  const greeting = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening'

  return (
    <div className="space-y-8">
      {/* Welcome Banner */}
      <section className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-indigo-600 via-indigo-700 to-violet-700 p-7 text-white shadow-xl shadow-indigo-200">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_right,_rgba(255,255,255,0.08)_0%,transparent_60%)]" />
        <div className="pointer-events-none absolute -right-10 -top-10 h-48 w-48 rounded-full bg-white/5 blur-2xl" />
        <div className="relative z-10">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-white/15 px-3 py-1 text-[10px] font-bold uppercase tracking-widest text-white/90 backdrop-blur-sm">
            🏠 Owner Dashboard
          </span>
          <h1 className="mt-3 text-2xl font-bold" style={{ fontFamily: 'Outfit, sans-serif' }}>
            {greeting}, {user?.name?.split(' ')[0]}! 👋
          </h1>
          <p className="mt-1.5 max-w-md text-sm text-indigo-100">
            You have <strong className="text-white">{stats.active} active listing{stats.active !== 1 ? 's' : ''}</strong> visible to tenants right now.
          </p>
          <div className="mt-5 flex flex-wrap gap-3">
            <Link
              to="/dashboard/owner/listings/new"
              className="inline-flex items-center gap-2 rounded-xl bg-white px-5 py-2.5 text-sm font-bold text-indigo-700 shadow-md transition-all hover:bg-indigo-50 hover:scale-[1.02]"
            >
              <PlusCircle className="h-4 w-4" />
              Add New Listing
            </Link>
            <Link
              to="/dashboard/owner/listings"
              className="inline-flex items-center gap-2 rounded-xl border border-white/25 bg-white/10 px-5 py-2.5 text-sm font-semibold text-white backdrop-blur-sm transition-all hover:bg-white/20"
            >
              <List className="h-4 w-4" />
              View All Listings
            </Link>
          </div>
        </div>
      </section>

      {/* Stats Grid */}
      <section>
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-xs font-bold uppercase tracking-widest text-slate-400">Portfolio Overview</h2>
        </div>
        {loading ? (
          <div className="grid gap-4 sm:grid-cols-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-28 animate-pulse rounded-2xl border border-slate-100 bg-slate-100" />
            ))}
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-3">
            <StatCard icon={Building2} label="Total Listings" value={stats.total} sub="All your properties" color="indigo" />
            <StatCard icon={Eye} label="Active" value={stats.active} sub="Visible to tenants" color="emerald" />
            <StatCard icon={EyeOff} label="Inactive" value={stats.inactive} sub="Currently hidden" color="slate" />
          </div>
        )}
      </section>

      {/* Recent Listings */}
      {!loading && recentListings.length > 0 && (
        <section>
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-xs font-bold uppercase tracking-widest text-slate-400">Recent Listings</h2>
            <Link to="/dashboard/owner/listings" className="text-xs font-semibold text-indigo-600 hover:text-indigo-700">
              View all →
            </Link>
          </div>
          <div className="grid gap-3 sm:grid-cols-3">
            {recentListings.map((listing) => (
              <Link
                key={listing._id}
                to={`/dashboard/owner/listings/${listing._id}/edit`}
                className="group rounded-2xl border border-slate-200 bg-white p-4 shadow-sm transition hover:border-indigo-200 hover:shadow-md"
              >
                {listing.images?.[0] ? (
                  <img
                    src={listing.images[0].url}
                    alt={listing.title}
                    className="mb-3 h-28 w-full rounded-xl object-cover"
                  />
                ) : (
                  <div className="mb-3 flex h-28 w-full items-center justify-center rounded-xl bg-slate-100 text-slate-400">
                    <Building2 className="h-8 w-8" strokeWidth={1} />
                  </div>
                )}
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <p className="truncate text-sm font-semibold text-slate-800">{listing.title}</p>
                    <p className="mt-0.5 flex items-center gap-1 text-xs text-slate-500">
                      <MapPin className="h-3 w-3" />
                      {listing.location}
                    </p>
                  </div>
                  {listing.status === 'filled' ? (
                    <span className="flex-shrink-0 rounded-full bg-amber-100 px-2 py-0.5 text-[9px] font-bold uppercase text-amber-700">
                      Filled
                    </span>
                  ) : (
                    <span className={`flex-shrink-0 rounded-full px-2 py-0.5 text-[9px] font-bold uppercase ${listing.isActive ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-500'}`}>
                      {listing.isActive ? 'Live' : 'Off'}
                    </span>
                  )}
                </div>
                <p className="mt-2 text-sm font-bold text-indigo-600">₹{listing.rent?.toLocaleString()}/mo</p>
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* Quick Actions */}
      <section>
        <div className="mb-4">
          <h2 className="text-xs font-bold uppercase tracking-widest text-slate-400">Quick Actions</h2>
        </div>
        <div className="grid gap-3 sm:grid-cols-2">
          <ActionCard
            to="/dashboard/owner/listings/new"
            icon={PlusCircle}
            title="Create a New Listing"
            description="Post a new room or apartment to attract compatible tenants"
            badge="Quick"
            color="indigo"
          />
          <ActionCard
            to="/dashboard/owner/listings"
            icon={List}
            title="Manage My Listings"
            description="View, edit, toggle visibility, or delete your existing listings"
            color="emerald"
          />
          <ActionCard
            to="/dashboard/owner"
            icon={TrendingUp}
            title="Analytics Overview"
            description="Track tenant interest and listing performance metrics"
            color="violet"
          />
          <ActionCard
            to="/dashboard"
            icon={Building2}
            title="Portfolio Summary"
            description="See a high-level overview of all your properties"
            color="amber"
          />
        </div>
      </section>
    </div>
  )
}

// ─── Tenant Dashboard ──────────────────────────────────────────────────────────

const TenantDashboard = ({ user }) => {
  const hour = new Date().getHours()
  const greeting = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening'

  const steps = [
    {
      icon: UserCircle,
      step: '01',
      title: 'Complete Your Profile',
      desc: 'Set your preferred location, budget, and move-in date.',
      color: 'violet',
      to: '/dashboard/tenant/profile',
      cta: 'Set Up Profile',
    },
    {
      icon: Search,
      step: '02',
      title: 'Browse AI-Matched Rooms',
      desc: 'Our AI engine scores every listing based on your compatibility.',
      color: 'indigo',
      to: '/dashboard/tenant/browse',
      cta: 'Browse Now',
    },
    {
      icon: Heart,
      step: '03',
      title: 'Express Interest',
      desc: 'Send interest to owners and wait for their response.',
      color: 'rose',
      to: '/dashboard/tenant/interests',
      cta: 'View Interests',
    },
    {
      icon: MessageSquare,
      step: '04',
      title: 'Chat & Move In',
      desc: 'When an owner accepts, chat instantly and finalize plans.',
      color: 'emerald',
      to: '/dashboard/tenant/chats',
      cta: 'Open Chats',
    },
  ]

  const colorMap = {
    violet: { bg: 'bg-violet-50', border: 'border-violet-200', text: 'text-violet-700', iconBg: 'bg-violet-100', iconText: 'text-violet-600', btn: 'bg-violet-600 hover:bg-violet-500' },
    indigo: { bg: 'bg-indigo-50', border: 'border-indigo-200', text: 'text-indigo-700', iconBg: 'bg-indigo-100', iconText: 'text-indigo-600', btn: 'bg-indigo-600 hover:bg-indigo-500' },
    rose: { bg: 'bg-rose-50', border: 'border-rose-200', text: 'text-rose-700', iconBg: 'bg-rose-100', iconText: 'text-rose-600', btn: 'bg-rose-500 hover:bg-rose-400' },
    emerald: { bg: 'bg-emerald-50', border: 'border-emerald-200', text: 'text-emerald-700', iconBg: 'bg-emerald-100', iconText: 'text-emerald-600', btn: 'bg-emerald-600 hover:bg-emerald-500' },
  }

  return (
    <div className="space-y-8">
      {/* Welcome Banner */}
      <section className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-violet-600 via-indigo-600 to-blue-600 p-7 text-white shadow-xl shadow-violet-200">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_right,_rgba(255,255,255,0.08)_0%,transparent_60%)]" />
        <div className="pointer-events-none absolute -right-10 -top-10 h-48 w-48 rounded-full bg-white/5 blur-2xl" />
        <div className="relative z-10">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-white/15 px-3 py-1 text-[10px] font-bold uppercase tracking-widest text-white/90 backdrop-blur-sm">
            <Sparkles className="h-3 w-3" /> Tenant Dashboard
          </span>
          <h1 className="mt-3 text-2xl font-bold" style={{ fontFamily: 'Outfit, sans-serif' }}>
            {greeting}, {user?.name?.split(' ')[0]}! 🔍
          </h1>
          <p className="mt-1.5 max-w-md text-sm text-indigo-100">
            Find your perfect room with <strong className="text-white">AI-powered compatibility matching</strong>. Let's get started.
          </p>
          <div className="mt-5 flex flex-wrap gap-3">
            <Link
              to="/dashboard/tenant/browse"
              className="inline-flex items-center gap-2 rounded-xl bg-white px-5 py-2.5 text-sm font-bold text-violet-700 shadow-md transition-all hover:bg-violet-50 hover:scale-[1.02]"
            >
              <Search className="h-4 w-4" />
              Browse Listings
            </Link>
            <Link
              to="/dashboard/tenant/profile"
              className="inline-flex items-center gap-2 rounded-xl border border-white/25 bg-white/10 px-5 py-2.5 text-sm font-semibold text-white backdrop-blur-sm transition-all hover:bg-white/20"
            >
              <UserCircle className="h-4 w-4" />
              My Profile
            </Link>
          </div>
        </div>
      </section>

      {/* Stats Row */}
      <section>
        <div className="mb-4">
          <h2 className="text-xs font-bold uppercase tracking-widest text-slate-400">Your Status</h2>
        </div>
        <div className="grid gap-4 sm:grid-cols-3">
          <StatCard icon={CheckCircle2} label="Account Status" value="Active" sub="Your profile is live" color="emerald" />
          <StatCard icon={Heart} label="Interests Sent" value="—" sub="Coming in Step 6" color="rose" />
          <StatCard icon={MessageSquare} label="Active Chats" value="—" sub="Coming in Step 7" color="violet" />
        </div>
      </section>

      {/* How It Works */}
      <section>
        <div className="mb-4">
          <h2 className="text-xs font-bold uppercase tracking-widest text-slate-400">How RoomSync Works</h2>
        </div>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {steps.map(({ icon: Icon, step, title, desc, color, to, cta }) => {
            const c = colorMap[color]
            return (
              <div
                key={step}
                className={`flex flex-col rounded-2xl border ${c.border} ${c.bg} p-5 transition hover:shadow-md`}
              >
                <div className="flex items-center gap-2.5">
                  <div className={`flex h-9 w-9 items-center justify-center rounded-xl ${c.iconBg}`}>
                    <Icon className={`h-4.5 w-4.5 ${c.iconText}`} strokeWidth={1.8} />
                  </div>
                  <span className={`text-[10px] font-bold uppercase tracking-widest ${c.text}`}>
                    Step {step}
                  </span>
                </div>
                <p className="mt-3 text-sm font-bold text-slate-800">{title}</p>
                <p className="mt-1 flex-1 text-xs leading-relaxed text-slate-500">{desc}</p>
                <Link
                  to={to}
                  className={`mt-4 inline-flex items-center justify-center gap-1.5 rounded-xl px-4 py-2 text-xs font-bold text-white transition-all ${c.btn}`}
                >
                  {cta} →
                </Link>
              </div>
            )
          })}
        </div>
      </section>

      {/* Quick Actions */}
      <section>
        <div className="mb-4">
          <h2 className="text-xs font-bold uppercase tracking-widest text-slate-400">Quick Actions</h2>
        </div>
        <div className="grid gap-3 sm:grid-cols-2">
          <ActionCard
            to="/dashboard/tenant/profile"
            icon={UserCircle}
            title="Setup My Profile"
            description="Set preferences to get matched with compatible rooms"
            badge="Start here"
            color="violet"
          />
          <ActionCard
            to="/dashboard/tenant/browse"
            icon={Search}
            title="Browse All Listings"
            description="Explore rooms ranked by your compatibility score"
            color="indigo"
          />
          <ActionCard
            to="/dashboard/tenant/interests"
            icon={Heart}
            title="My Interest Requests"
            description="Track the interest requests you've sent to owners"
            color="rose"
          />
          <ActionCard
            to="/dashboard/tenant/chats"
            icon={MessageSquare}
            title="Messages"
            description="Chat with owners who have accepted your request"
            color="emerald"
          />
        </div>
      </section>
    </div>
  )
}

// ─── Root Dispatcher ───────────────────────────────────────────────────────────

const Dashboard = () => {
  const { user } = useAuth()

  if (user?.role === 'owner' || user?.role === 'admin') {
    return <OwnerDashboard user={user} />
  }

  return <TenantDashboard user={user} />
}

export default Dashboard