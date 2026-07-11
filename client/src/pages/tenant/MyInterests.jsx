import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { Heart, MapPin, Calendar, MessageSquare, ArrowRight, Clock, AlertCircle, Sparkles } from 'lucide-react'
import interestService from '../../services/interestService'

const MyInterests = () => {
  const [interests, setInterests] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const fetchInterests = async () => {
    setLoading(true)
    setError('')
    try {
      const response = await interestService.getMyInterests()
      if (response.success) {
        setInterests(response.interests || [])
      }
    } catch (err) {
      setError(err?.response?.data?.message || 'Failed to fetch expressed interests')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchInterests()
  }, [])

  const getStatusStyle = (status) => {
    switch (status) {
      case 'accepted':
        return 'bg-emerald-100 text-emerald-800 border-emerald-200'
      case 'declined':
        return 'bg-rose-100 text-rose-800 border-rose-200'
      default:
        return 'bg-amber-100 text-amber-800 border-amber-200'
    }
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="h-32 animate-pulse rounded-3xl bg-slate-200" />
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-40 animate-pulse rounded-2xl bg-slate-100" />
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Header Banner */}
      <div className="rounded-3xl bg-gradient-to-r from-rose-500 to-indigo-600 p-6 text-white shadow-xl shadow-indigo-100 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <Heart className="h-4.5 w-4.5 text-rose-200 fill-rose-200" />
            <span className="text-xs font-bold uppercase tracking-widest text-indigo-100">
              Tenant Tools
            </span>
          </div>
          <h1 className="mt-2 text-2xl font-bold" style={{ fontFamily: 'Outfit, sans-serif' }}>
            My Expressed Interests
          </h1>
          <p className="mt-1 text-sm text-indigo-100 max-w-lg">
            Track room listings you have expressed interest in. Once an owner accepts, you will be able to initiate direct messaging.
          </p>
        </div>
        <Link
          to="/dashboard/tenant/browse"
          className="flex items-center gap-2 rounded-xl bg-white px-4 py-2.5 text-xs font-bold text-indigo-700 shadow-md transition hover:bg-indigo-50 hover:scale-[1.02] self-start md:self-center"
        >
          Browse More Rooms
        </Link>
      </div>

      {error && (
        <div className="flex items-center gap-3 rounded-2xl border border-rose-200 bg-rose-50 px-5 py-4 text-sm text-rose-800 shadow-sm">
          <AlertCircle className="h-5 w-5 text-rose-500 shrink-0" />
          <div>{error}</div>
        </div>
      )}

      {/* Interests list */}
      {interests.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-3xl border-2 border-dashed border-slate-200 bg-white py-16 text-center">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-rose-50 text-rose-500">
            <Heart className="h-7 w-7" strokeWidth={1.5} />
          </div>
          <h3 className="mt-4 text-base font-bold text-slate-700">No interests expressed yet</h3>
          <p className="mt-1 text-sm text-slate-400 max-w-xs">
            Start browsing flat listings and hit "Express Interest" to connect with owners.
          </p>
          <Link
            to="/dashboard/tenant/browse"
            className="mt-5 inline-flex items-center gap-2 rounded-xl bg-slate-900 px-5 py-2.5 text-xs font-bold text-white shadow transition hover:bg-indigo-600"
          >
            Find a Room
            <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {interests.map((interest) => {
            const listing = interest.listing || {}
            const owner = interest.owner || {}
            return (
              <div
                key={interest._id}
                className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition hover:shadow-md"
              >
                <div className="flex flex-col md:flex-row">
                  {/* Photo Thumbnail */}
                  <div className="relative w-full md:w-48 h-32 md:h-auto shrink-0 bg-slate-100">
                    {listing.images?.[0] ? (
                      <img
                        src={listing.images[0].url}
                        alt={listing.title}
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center text-slate-300">
                        <Heart className="h-8 w-8" />
                      </div>
                    )}
                  </div>

                  {/* Details Section */}
                  <div className="p-5 flex-1 flex flex-col justify-between gap-4">
                    <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-2">
                      <div>
                        <h3 className="font-bold text-slate-900 text-sm sm:text-base line-clamp-1" style={{ fontFamily: 'Outfit, sans-serif' }}>
                          {listing.title || 'Unknown Listing'}
                        </h3>
                        <p className="mt-0.5 flex items-center gap-1 text-[11px] text-slate-500">
                          <MapPin className="h-3 w-3 text-slate-400" />
                          {listing.location}
                        </p>
                      </div>

                      <div className="flex items-center gap-2 shrink-0 self-start">
                        <span className={`rounded-full border px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider ${getStatusStyle(interest.status)}`}>
                          {interest.status}
                        </span>
                      </div>
                    </div>

                    {/* Messages panel */}
                    <div className="space-y-2 rounded-xl bg-slate-50 p-3.5 border border-slate-100 text-xs">
                      {/* Tenant Message */}
                      <div className="space-y-1">
                        <div className="flex items-center gap-1 text-[10px] font-bold text-slate-400 uppercase">
                          <span>My Message:</span>
                          <span className="font-normal text-[9px] lowercase">({new Date(interest.createdAt).toLocaleDateString('en-IN')})</span>
                        </div>
                        <p className="text-slate-600 italic">
                          "{interest.tenantMessage || 'No message provided.'}"
                        </p>
                      </div>

                      {/* Owner response message */}
                      {interest.status !== 'pending' && (
                        <div className="pt-2 border-t border-slate-200/60 space-y-1">
                          <div className="flex items-center gap-1 text-[10px] font-bold text-indigo-500 uppercase">
                            <span>Owner's Response ({owner.name}):</span>
                            {interest.respondedAt && (
                              <span className="font-normal text-slate-400 text-[9px] lowercase">
                                ({new Date(interest.respondedAt).toLocaleDateString('en-IN')})
                              </span>
                            )}
                          </div>
                          <p className="text-slate-700 font-medium">
                            {interest.ownerResponseMessage ? `"${interest.ownerResponseMessage}"` : 'Accepted without additional message.'}
                          </p>
                        </div>
                      )}
                    </div>

                    {/* Row Footer */}
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between border-t border-slate-100 pt-3 gap-2">
                      <div className="flex items-center gap-1 text-[10px] text-slate-400 font-semibold uppercase">
                        <Clock className="h-3 w-3" />
                        <span>Sent: {new Date(interest.createdAt).toLocaleDateString('en-IN')}</span>
                      </div>

                      <div className="flex items-center gap-2">
                        {interest.status === 'accepted' ? (
                          <Link
                            to="/dashboard/tenant/chats"
                            className="inline-flex items-center gap-1 rounded-xl bg-indigo-600 hover:bg-indigo-500 px-4 py-2 text-xs font-bold text-white transition cursor-pointer shadow-sm"
                          >
                            <MessageSquare className="h-3.5 w-3.5" />
                            Chat with Owner
                          </Link>
                        ) : (
                          <span className="text-[10px] font-bold text-slate-400 uppercase italic">
                            {interest.status === 'declined' ? 'Declined by Owner' : 'Awaiting owner response'}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}

export default MyInterests
