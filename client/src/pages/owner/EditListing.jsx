import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { ArrowLeft } from 'lucide-react'
import ListingForm from './ListingForm.jsx'
import listingService from '../../services/listingService.js'

const EditListing = () => {
  const { listingId } = useParams()
  const navigate = useNavigate()
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')
  const [initialValues, setInitialValues] = useState(null)

  useEffect(() => {
    const loadListing = async () => {
      try {
        const response = await listingService.getListingById(listingId)
        const listing = response.listing
        setInitialValues({
          title: listing.title,
          description: listing.description,
          location: listing.location,
          rent: listing.rent,
          availableFrom: listing.availableFrom?.slice(0, 10) || '',
          roomType: listing.roomType,
          genderPreference: listing.genderPreference,
          furnished: listing.furnished,
          amenities: Array.isArray(listing.amenities) ? listing.amenities.join(', ') : '',
          isActive: listing.isActive,
          images: listing.images || [],
        })
      } catch (requestError) {
        setError(requestError?.response?.data?.message || 'Failed to load listing')
      } finally {
        setLoading(false)
      }
    }
    loadListing()
  }, [listingId])

  const handleSubmit = async (payload) => {
    setError('')
    setSubmitting(true)
    try {
      await listingService.updateListing(listingId, payload)
      navigate('/dashboard/owner/listings', { replace: true })
    } catch (requestError) {
      setError(requestError?.response?.data?.message || 'Failed to update listing')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <button
          type="button"
          onClick={() => navigate(-1)}
          className="mb-3 flex items-center gap-1.5 text-xs font-semibold text-slate-400 transition hover:text-slate-600"
        >
          <ArrowLeft className="h-3.5 w-3.5" /> Back to Listings
        </button>
        <p className="text-xs font-bold uppercase tracking-widest text-slate-400">Owner Tools</p>
        <h1 className="mt-1 text-2xl font-bold text-slate-900" style={{ fontFamily: 'Outfit, sans-serif' }}>
          Edit Listing
        </h1>
        <p className="mt-1 text-sm text-slate-500">Update your listing details below.</p>
      </div>

      {/* Error */}
      {error && (
        <div className="flex items-center gap-3 rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
          <span>⚠️</span> {error}
        </div>
      )}

      {/* Loading skeleton */}
      {loading ? (
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-16 animate-pulse rounded-2xl border border-slate-100 bg-slate-100" />
          ))}
        </div>
      ) : initialValues ? (
        <ListingForm
          submitLabel="Save Changes"
          submitting={submitting}
          onSubmit={handleSubmit}
          initialValues={initialValues}
        />
      ) : null}
    </div>
  )
}

export default EditListing