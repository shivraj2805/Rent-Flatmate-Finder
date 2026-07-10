import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import listingService from '../../services/listingService.js'

const MyListings = () => {
  const [listings, setListings] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [deletingId, setDeletingId] = useState('')

  const loadListings = async () => {
    setLoading(true)

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

  const handleDelete = async (listingId) => {
    const confirmed = window.confirm('Delete this listing permanently?')

    if (!confirmed) {
      return
    }

    setDeletingId(listingId)

    try {
      await listingService.deleteListing(listingId)
      await loadListings()
    } catch (requestError) {
      setError(requestError?.response?.data?.message || 'Failed to delete listing')
    } finally {
      setDeletingId('')
    }
  }

  if (loading) {
    return <div className="rounded-[2rem] border border-white/10 bg-white/5 p-6 text-slate-300">Loading listings...</div>
  }

  return (
    <div className="space-y-6">
      <section className="rounded-[2rem] border border-white/10 bg-white/5 p-6">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <p className="text-sm uppercase tracking-[0.35em] text-slate-400">My listings</p>
            <h1 className="mt-3 text-3xl font-semibold text-white">Manage your property listings</h1>
          </div>
          <Link
            to="/dashboard/owner/listings/new"
            className="rounded-2xl bg-emerald-400 px-4 py-3 text-sm font-semibold text-slate-950"
          >
            Add Listing
          </Link>
        </div>
      </section>

      {error ? (
        <div className="rounded-2xl border border-rose-400/20 bg-rose-400/10 px-4 py-3 text-sm text-rose-200">
          {error}
        </div>
      ) : null}

      {listings.length === 0 ? (
        <div className="rounded-[2rem] border border-dashed border-white/10 bg-white/5 p-10 text-center text-slate-400">
          You have not created any listings yet.
        </div>
      ) : (
        <div className="grid gap-4 xl:grid-cols-2">
          {listings.map((listing) => (
            <article key={listing._id} className="rounded-[2rem] border border-white/10 bg-slate-900/60 p-5">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-xs uppercase tracking-[0.3em] text-slate-500">{listing.roomType}</p>
                  <h2 className="mt-2 text-xl font-semibold text-white">{listing.title}</h2>
                  <p className="mt-2 text-sm text-slate-300">{listing.location}</p>
                </div>
                <span
                  className={`rounded-full px-3 py-1 text-xs font-semibold ${
                    listing.isActive
                      ? 'bg-emerald-400/15 text-emerald-200'
                      : 'bg-slate-500/15 text-slate-300'
                  }`}
                >
                  {listing.isActive ? 'Active' : 'Inactive'}
                </span>
              </div>

              <p className="mt-4 line-clamp-3 text-sm leading-6 text-slate-300">{listing.description}</p>

              {Array.isArray(listing.images) && listing.images.length > 0 ? (
                <div className="mt-4 grid grid-cols-3 gap-2">
                  {listing.images.slice(0, 3).map((imageUrl) => (
                    <img key={imageUrl} src={imageUrl} alt={listing.title} className="h-20 w-full rounded-2xl object-cover" />
                  ))}
                </div>
              ) : null}

              <div className="mt-5 flex flex-wrap gap-3">
                <Link
                  to={`/dashboard/owner/listings/${listing._id}/edit`}
                  className="rounded-2xl border border-white/10 bg-white/5 px-4 py-2 text-sm font-medium text-white"
                >
                  Edit
                </Link>
                <button
                  type="button"
                  onClick={() => handleDelete(listing._id)}
                  disabled={deletingId === listing._id}
                  className="rounded-2xl border border-rose-400/20 bg-rose-400/10 px-4 py-2 text-sm font-medium text-rose-100 disabled:opacity-70"
                >
                  {deletingId === listing._id ? 'Deleting...' : 'Delete'}
                </button>
              </div>
            </article>
          ))}
        </div>
      )}
    </div>
  )
}

export default MyListings