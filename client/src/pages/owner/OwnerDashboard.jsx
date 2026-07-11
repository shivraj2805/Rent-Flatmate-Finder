import { Link } from 'react-router-dom'
import { Building2, PlusCircle, List, TrendingUp, Heart } from 'lucide-react'
import useAuth from '../../hooks/useAuth.jsx'

const OwnerDashboard = () => {
  const { user } = useAuth()

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs font-bold uppercase tracking-widest text-slate-400">Owner Tools</p>
          <h1 className="mt-1 text-2xl font-bold text-slate-900" style={{ fontFamily: 'Outfit, sans-serif' }}>
            Owner Overview
          </h1>
          <p className="mt-1 text-sm text-slate-500">
            Manage all your listings and property tools from one place.
          </p>
        </div>
        <Link
          to="/dashboard/owner/listings/new"
          className="hidden items-center gap-2 rounded-xl bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white shadow-md shadow-indigo-200 transition hover:bg-indigo-500 sm:flex"
        >
          <PlusCircle className="h-4 w-4" />
          Add Listing
        </Link>
      </div>

      {/* Cards Grid */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {/* Add Listing */}
        <Link
          to="/dashboard/owner/listings/new"
          className="group flex flex-col rounded-2xl border border-indigo-200 bg-indigo-50 p-6 transition-all hover:border-indigo-300 hover:shadow-md hover:shadow-indigo-100"
        >
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-indigo-100 text-indigo-600 transition group-hover:bg-indigo-600 group-hover:text-white">
            <PlusCircle className="h-6 w-6" strokeWidth={1.8} />
          </div>
          <p className="mt-4 text-xs font-bold uppercase tracking-widest text-indigo-400">Create</p>
          <p className="mt-1 text-base font-bold text-slate-800">Add a New Listing</p>
          <p className="mt-1 text-sm text-slate-500">Post a new room or flat to attract tenants</p>
          <span className="mt-4 text-xs font-semibold text-indigo-600 group-hover:underline">
            Get started →
          </span>
        </Link>

        {/* View Listings */}
        <Link
          to="/dashboard/owner/listings"
          className="group flex flex-col rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition-all hover:border-indigo-200 hover:shadow-md"
        >
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-slate-100 text-slate-600 transition group-hover:bg-indigo-100 group-hover:text-indigo-600">
            <List className="h-6 w-6" strokeWidth={1.8} />
          </div>
          <p className="mt-4 text-xs font-bold uppercase tracking-widest text-slate-400">Manage</p>
          <p className="mt-1 text-base font-bold text-slate-800">View My Listings</p>
          <p className="mt-1 text-sm text-slate-500">Edit, activate, or remove existing listings</p>
          <span className="mt-4 text-xs font-semibold text-indigo-600 group-hover:underline">
            Open listings →
          </span>
        </Link>

        {/* Analytics placeholder */}
        <div className="flex flex-col rounded-2xl border border-slate-200 bg-white p-6 shadow-sm opacity-80">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-amber-50 text-amber-500">
            <TrendingUp className="h-6 w-6" strokeWidth={1.8} />
          </div>
          <p className="mt-4 text-xs font-bold uppercase tracking-widest text-slate-400">Coming Soon</p>
          <p className="mt-1 text-base font-bold text-slate-800">Analytics & Insights</p>
          <p className="mt-1 text-sm text-slate-500">Track interest requests and tenant engagement</p>
          <span className="mt-4 inline-flex items-center gap-1 rounded-full bg-amber-50 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-amber-600">
            Step 7
          </span>
        </div>

        {/* Interest Requests */}
        <Link
          to="/dashboard/owner/interests"
          className="group flex flex-col rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition-all hover:border-indigo-200 hover:shadow-md"
        >
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-violet-50 text-violet-500 transition group-hover:bg-violet-600 group-hover:text-white">
            <Heart className="h-6 w-6" strokeWidth={1.8} />
          </div>
          <p className="mt-4 text-xs font-bold uppercase tracking-widest text-violet-400">Manage</p>
          <p className="mt-1 text-base font-bold text-slate-800">Interest Requests</p>
          <p className="mt-1 text-sm text-slate-500">Accept or decline tenant interest requests</p>
          <span className="mt-4 text-xs font-semibold text-indigo-600 group-hover:underline">
            Review requests →
          </span>
        </Link>

        {/* Cloudinary */}
        <div className="flex flex-col rounded-2xl border border-emerald-200 bg-emerald-50 p-6">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-100 text-emerald-600">
            <svg viewBox="0 0 24 24" fill="none" className="h-6 w-6" stroke="currentColor" strokeWidth={1.8}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5" />
            </svg>
          </div>
          <p className="mt-4 text-xs font-bold uppercase tracking-widest text-emerald-600">Cloudinary</p>
          <p className="mt-1 text-base font-bold text-slate-800">Image Upload Ready</p>
          <p className="mt-1 text-sm text-slate-500">Upload up to 10 images per listing via Cloudinary CDN</p>
          <span className="mt-4 inline-flex items-center gap-1 rounded-full bg-emerald-100 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-emerald-700">
            ✓ Configured
          </span>
        </div>
      </div>

      {/* Tip Banner */}
      <div className="rounded-2xl border border-indigo-100 bg-indigo-50 p-5">
        <p className="text-sm font-semibold text-indigo-800">💡 Pro Tip</p>
        <p className="mt-1 text-sm text-indigo-600">
          Add detailed descriptions, multiple images, and accurate amenities to your listings. This helps the AI compatibility engine match you with the most suitable tenants.
        </p>
      </div>
    </div>
  )
}

export default OwnerDashboard