import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
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

  if (loading) {
    return <div className="rounded-[2rem] border border-white/10 bg-white/5 p-6 text-slate-300">Loading listing...</div>
  }

  return (
    <div className="space-y-6">
      <section className="rounded-[2rem] border border-white/10 bg-white/5 p-6">
        <p className="text-sm uppercase tracking-[0.35em] text-slate-400">Edit listing</p>
        <h1 className="mt-3 text-3xl font-semibold text-white">Update listing details</h1>
      </section>

      {error ? (
        <div className="rounded-2xl border border-rose-400/20 bg-rose-400/10 px-4 py-3 text-sm text-rose-200">
          {error}
        </div>
      ) : null}

      {initialValues ? (
        <ListingForm
          submitLabel="Update Listing"
          submitting={submitting}
          onSubmit={handleSubmit}
          initialValues={initialValues}
        />
      ) : null}
    </div>
  )
}

export default EditListing