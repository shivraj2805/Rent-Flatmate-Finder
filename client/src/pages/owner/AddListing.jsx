import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
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
      <section className="rounded-[2rem] border border-white/10 bg-white/5 p-6">
        <p className="text-sm uppercase tracking-[0.35em] text-slate-400">Add listing</p>
        <h1 className="mt-3 text-3xl font-semibold text-white">Create a new room listing</h1>
      </section>

      {error ? (
        <div className="rounded-2xl border border-rose-400/20 bg-rose-400/10 px-4 py-3 text-sm text-rose-200">
          {error}
        </div>
      ) : null}

      <ListingForm submitLabel="Create Listing" submitting={submitting} onSubmit={handleSubmit} />
    </div>
  )
}

export default AddListing