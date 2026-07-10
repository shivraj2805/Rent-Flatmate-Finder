import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { PlusCircle, MapPin, Calendar, Building2, Edit2, Trash2, Eye, EyeOff, CheckCircle2, X, ChevronLeft, ChevronRight } from 'lucide-react'
import listingService from '../../services/listingService.js'

const roomTypeLabel = {
  'private-room': 'Private Room',
  'shared-room': 'Shared Room',
  studio: 'Studio',
  apartment: 'Apartment',
  other: 'Other',
}

const MyListings = () => {
  const [listings, setListings] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [deletingId, setDeletingId] = useState('')
  const [activePhotoGallery, setActivePhotoGallery] = useState(null)
  const [activePhotoIndex, setActivePhotoIndex] = useState(0)

  const openGallery = (images, index = 0) => {
    setActivePhotoGallery(images.map((img) => img.url))
    setActivePhotoIndex(index)
  }

  const loadListings = async () => {
    setLoading(true)
    setError('')
    try {
      const response = await listingService.getMyListings()
      setListings(response.listings || [])
    } catch (requestError) {
      setError(requestError?.response?.data?.message || 'Failed to load listings')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadListings()
  }, [])

  const handleMarkAsFilled = async (listingId) => {
    const confirmed = window.confirm('Are you sure you want to mark this listing as filled? This will hide it from tenant search results.')
    if (!confirmed) return
    try {
      await listingService.updateListingStatus(listingId, 'filled')
      setListings((prev) =>
        prev.map((l) => (l._id === listingId ? { ...l, status: 'filled' } : l))
      )
    } catch (requestError) {
      setError(requestError?.response?.data?.message || 'Failed to update status')
    }
  }

  const handleDelete = async (listingId) => {
    const confirmed = window.confirm('Are you sure you want to permanently delete this listing?')
    if (!confirmed) return
    setDeletingId(listingId)
    try {
      await listingService.deleteListing(listingId)
      setListings((prev) => prev.filter((l) => l._id !== listingId))
    } catch (requestError) {
      setError(requestError?.response?.data?.message || 'Failed to delete listing')
    } finally {
      setDeletingId('')
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs font-bold uppercase tracking-widest text-slate-400">Owner Tools</p>
          <h1 className="mt-1 text-2xl font-bold text-slate-900" style={{ fontFamily: 'Outfit, sans-serif' }}>
            My Listings
          </h1>
          <p className="mt-1 text-sm text-slate-500">
            {listings.length} total · {listings.filter((l) => l.isActive).length} active
          </p>
        </div>
        <Link
          to="/dashboard/owner/listings/new"
          className="flex items-center gap-2 rounded-xl bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white shadow-md shadow-indigo-200 transition hover:bg-indigo-500"
        >
          <PlusCircle className="h-4 w-4" />
          Add Listing
        </Link>
      </div>

      {/* Error */}
      {error && (
        <div className="flex items-center gap-3 rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
          <span className="text-base">⚠️</span>
          {error}
        </div>
      )}

      {/* Loading */}
      {loading ? (
        <div className="grid gap-4 xl:grid-cols-2">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-48 animate-pulse rounded-2xl border border-slate-100 bg-slate-100" />
          ))}
        </div>
      ) : listings.length === 0 ? (
        /* Empty State */
        <div className="flex flex-col items-center justify-center rounded-3xl border-2 border-dashed border-slate-200 bg-white py-20 text-center">
          <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-slate-100 text-slate-400">
            <Building2 className="h-8 w-8" strokeWidth={1} />
          </div>
          <h3 className="mt-4 text-base font-semibold text-slate-700">No listings yet</h3>
          <p className="mt-1 text-sm text-slate-400">Create your first listing to start attracting tenants</p>
          <Link
            to="/dashboard/owner/listings/new"
            className="mt-5 flex items-center gap-2 rounded-xl bg-indigo-600 px-5 py-2.5 text-sm font-semibold text-white shadow-md shadow-indigo-200 transition hover:bg-indigo-500"
          >
            <PlusCircle className="h-4 w-4" />
            Create First Listing
          </Link>
        </div>
      ) : (
        /* Listings Grid */
        <div className="grid gap-5 xl:grid-cols-2">
          {listings.map((listing) => (
            <article
              key={listing._id}
              className="group overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition hover:shadow-md"
            >
              {/* Image / Placeholder */}
              <div
                className={`relative h-44 overflow-hidden bg-slate-100 ${listing.images?.[0] ? 'cursor-pointer' : ''}`}
                onClick={() => listing.images?.[0] && openGallery(listing.images, 0)}
              >
                {listing.images?.[0] ? (
                  <img
                    src={listing.images[0].url}
                    alt={listing.title}
                    className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                  />
                ) : (
                  <div className="flex h-full items-center justify-center text-slate-300">
                    <Building2 className="h-12 w-12" strokeWidth={1} />
                  </div>
                )}
                {/* Status badge */}
                {listing.status === 'filled' ? (
                  <span className="absolute right-3 top-3 flex items-center gap-1 rounded-full bg-amber-100 px-2.5 py-1 text-[10px] font-bold uppercase text-amber-700 shadow-sm">
                    <CheckCircle2 className="h-3 w-3" />
                    Filled
                  </span>
                ) : (
                  <span
                    className={`absolute right-3 top-3 flex items-center gap-1 rounded-full px-2.5 py-1 text-[10px] font-bold uppercase shadow-sm ${
                      listing.isActive
                        ? 'bg-emerald-100 text-emerald-700'
                        : 'bg-slate-200 text-slate-600'
                    }`}
                  >
                    {listing.isActive ? <Eye className="h-3 w-3" /> : <EyeOff className="h-3 w-3" />}
                    {listing.isActive ? 'Active' : 'Inactive'}
                  </span>
                )}
                {/* Room type and Furnishing badges */}
                <div className="absolute left-3 top-3 flex flex-wrap gap-1.5">
                  <span className="rounded-full bg-black/60 px-2.5 py-1 text-[10px] font-semibold text-white backdrop-blur-sm">
                    {roomTypeLabel[listing.roomType] || listing.roomType}
                  </span>
                  <span className={`rounded-full px-2.5 py-1 text-[10px] font-semibold text-white backdrop-blur-sm ${listing.furnished ? 'bg-indigo-600/80' : 'bg-slate-600/80'}`}>
                    {listing.furnished ? 'Furnished' : 'Unfurnished'}
                  </span>
                </div>
              </div>

              {/* Content */}
              <div className="p-5">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <h2 className="truncate text-base font-bold text-slate-900">{listing.title}</h2>
                    <p className="mt-1 flex items-center gap-1 text-xs text-slate-500">
                      <MapPin className="h-3 w-3 flex-shrink-0 text-slate-400" />
                      {listing.location}
                    </p>
                  </div>
                  <p className="flex-shrink-0 text-lg font-bold text-indigo-600">
                    ₹{listing.rent?.toLocaleString()}
                    <span className="text-xs font-normal text-slate-400">/mo</span>
                  </p>
                </div>

                <p className="mt-3 line-clamp-2 text-xs leading-relaxed text-slate-500">
                  {listing.description}
                </p>

                {/* Available from */}
                <p className="mt-3 flex items-center gap-1.5 text-xs text-slate-500">
                  <Calendar className="h-3.5 w-3.5 text-slate-400" />
                  Available from{' '}
                  <span className="font-semibold text-slate-700">
                    {new Date(listing.availableFrom).toLocaleDateString('en-IN', {
                      day: 'numeric',
                      month: 'short',
                      year: 'numeric',
                    })}
                  </span>
                </p>

                {/* Image thumbnails */}
                {listing.images?.length > 1 && (
                  <div className="mt-3 flex gap-1.5">
                    {listing.images.slice(1, 4).map((img, idx) => (
                      <img
                        key={img.url || idx}
                        src={img.url}
                        alt=""
                        className="h-10 w-14 rounded-lg object-cover cursor-pointer hover:opacity-85 transition"
                        onClick={() => openGallery(listing.images, idx + 1)}
                      />
                    ))}
                    {listing.images.length > 4 && (
                      <button
                        type="button"
                        onClick={() => openGallery(listing.images, 4)}
                        className="flex h-10 w-14 items-center justify-center rounded-lg bg-slate-100 text-xs font-semibold text-slate-500 hover:bg-slate-200 transition cursor-pointer"
                      >
                        +{listing.images.length - 4}
                      </button>
                    )}
                  </div>
                )}

                {/* Actions */}
                <div className="mt-4 flex flex-wrap gap-2 border-t border-slate-100 pt-4">
                  <Link
                    to={`/dashboard/owner/listings/${listing._id}/edit`}
                    className="flex flex-1 min-w-[70px] items-center justify-center gap-1 rounded-xl border border-slate-200 bg-slate-50 py-2 text-xs font-semibold text-slate-700 transition hover:border-indigo-200 hover:bg-indigo-50 hover:text-indigo-700"
                  >
                    <Edit2 className="h-3.5 w-3.5" />
                    Edit
                  </Link>
                  {listing.status !== 'filled' && (
                    <button
                      type="button"
                      onClick={() => handleMarkAsFilled(listing._id)}
                      className="flex flex-1 min-w-[100px] items-center justify-center gap-1 rounded-xl border border-amber-100 bg-amber-50 py-2 text-xs font-semibold text-amber-700 transition hover:bg-amber-100"
                    >
                      <CheckCircle2 className="h-3.5 w-3.5" />
                      Mark Filled
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={() => handleDelete(listing._id)}
                    disabled={deletingId === listing._id}
                    className="flex flex-1 min-w-[70px] items-center justify-center gap-1 rounded-xl border border-rose-100 bg-rose-50 py-2 text-xs font-semibold text-rose-600 transition hover:bg-rose-100 disabled:opacity-60"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                    {deletingId === listing._id ? 'Deleting…' : 'Delete'}
                  </button>
                </div>
              </div>
            </article>
          ))}
        </div>
      )}

      {/* Lightbox / Gallery Modal */}
      {activePhotoGallery && activePhotoGallery.length > 0 && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 p-4 backdrop-blur-md">
          <div className="relative max-w-4xl w-full flex flex-col items-center">
            {/* Close button */}
            <button
              onClick={() => setActivePhotoGallery(null)}
              className="absolute -top-14 right-2 text-white/80 hover:text-white transition bg-white/10 hover:bg-white/20 p-2 rounded-full cursor-pointer"
            >
              <X className="h-6 w-6" />
            </button>

            {/* Main Image */}
            <div className="relative w-full h-[65vh] flex items-center justify-center bg-slate-950/70 rounded-3xl overflow-hidden border border-white/10 shadow-2xl">
              <img
                src={activePhotoGallery[activePhotoIndex]}
                alt="Gallery View"
                className="max-h-full max-w-full object-contain"
              />

              {/* Prev / Next controls */}
              {activePhotoGallery.length > 1 && (
                <>
                  <button
                    onClick={() => setActivePhotoIndex((i) => (i - 1 + activePhotoGallery.length) % activePhotoGallery.length)}
                    className="absolute left-4 bg-black/40 hover:bg-black/60 text-white p-2.5 rounded-full backdrop-blur-sm transition-all hover:scale-105 cursor-pointer"
                  >
                    <ChevronLeft className="h-6 w-6" />
                  </button>
                  <button
                    onClick={() => setActivePhotoIndex((i) => (i + 1) % activePhotoGallery.length)}
                    className="absolute right-4 bg-black/40 hover:bg-black/60 text-white p-2.5 rounded-full backdrop-blur-sm transition-all hover:scale-105 cursor-pointer"
                  >
                    <ChevronRight className="h-6 w-6" />
                  </button>
                </>
              )}
            </div>

            {/* Thumbnails row in modal */}
            {activePhotoGallery.length > 1 && (
              <div className="mt-5 flex gap-2 overflow-x-auto max-w-full py-2 px-1">
                {activePhotoGallery.map((url, i) => (
                  <button
                    key={url}
                    onClick={() => setActivePhotoIndex(i)}
                    className={`relative h-14 w-20 rounded-xl overflow-hidden shrink-0 border-2 transition-all cursor-pointer ${
                      i === activePhotoIndex ? 'border-indigo-500 scale-105 shadow-md shadow-indigo-500/20' : 'border-transparent opacity-50 hover:opacity-100'
                    }`}
                  >
                    <img src={url} alt="" className="h-full w-full object-cover" />
                  </button>
                ))}
              </div>
            )}
            
            {/* Status indicators */}
            <p className="mt-3 text-xs font-bold text-white/50 uppercase tracking-widest">
              {activePhotoIndex + 1} of {activePhotoGallery.length}
            </p>
          </div>
        </div>
      )}
    </div>
  )
}

export default MyListings