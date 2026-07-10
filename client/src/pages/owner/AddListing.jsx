import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ArrowLeft } from 'lucide-react'
import ListingForm from './ListingForm.jsx'
import listingService from '../../services/listingService.js'

const AddListing = () => {
  const navigate = useNavigate()
  const [error, setError] = useState('')
  const [submitting, setSubmitting] = useState(false)

  const handleSubmit = async (payload) => {
    setError('')
    setSubmitting(true)
    try {
      await listingService.createListing(payload)
      navigate('/dashboard/owner/listings', { replace: true })
    } catch (requestError) {
      setError(requestError?.response?.data?.message || 'Failed to create listing')
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
          <ArrowLeft className="h-3.5 w-3.5" /> Back
        </button>
        <p className="text-xs font-bold uppercase tracking-widest text-slate-400">Owner Tools</p>
        <h1 className="mt-1 text-2xl font-bold text-slate-900" style={{ fontFamily: 'Outfit, sans-serif' }}>
          Add New Listing
        </h1>
        <p className="mt-1 text-sm text-slate-500">
          Fill in the details below to create your new room listing.
        </p>
      </div>

      {/* Error */}
      {error && (
        <div className="flex items-center gap-3 rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
          <span>⚠️</span> {error}
        </div>
      )}

      <ListingForm submitLabel="Publish Listing" submitting={submitting} onSubmit={handleSubmit} />
    </div>
  )
}

export default AddListing