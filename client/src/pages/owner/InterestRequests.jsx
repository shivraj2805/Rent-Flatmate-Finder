import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import {
  Heart, MapPin, Calendar, Check, X,
  Clock, AlertCircle, Info, User, ChevronDown, ChevronUp, Sparkles, Loader2, MessageSquare
} from 'lucide-react'
import interestService from '../../services/interestService'

const InterestRequests = () => {
  const [requests, setRequests] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  // Accordion open states
  const [expandedRequestId, setExpandedRequestId] = useState(null)

  // Modals for responding
  const [activeRespondRequest, setActiveRespondRequest] = useState(null) // request object
  const [respondStatus, setRespondStatus] = useState('') // 'accepted' or 'declined'
  const [responseMessage, setResponseMessage] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [actionSuccess, setActionSuccess] = useState('')

  const fetchRequests = async () => {
    setLoading(true)
    setError('')
    try {
      const response = await interestService.getMyInterests()
      if (response.success) {
        setRequests(response.interests || [])
      }
    } catch (err) {
      setError(err?.response?.data?.message || 'Failed to load received interest requests')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchRequests()
  }, [])

  const handleOpenRespondModal = (request, status) => {
    setActiveRespondRequest(request)
    setRespondStatus(status)
    setResponseMessage('')
    setActionSuccess('')
  }

  const handleCloseRespondModal = () => {
    setActiveRespondRequest(null)
    setRespondStatus('')
    setResponseMessage('')
  }

  const handleRespondSubmit = async (e) => {
    e.preventDefault()
    if (!activeRespondRequest) return

    setSubmitting(true)
    try {
      const response = await interestService.respondToInterest(
        activeRespondRequest._id,
        respondStatus,
        responseMessage
      )

      if (response.success) {
        setActionSuccess(`Successfully ${respondStatus} the request!`)
        // Update request status locally
        setRequests(requests.map(req => 
          req._id === activeRespondRequest._id 
            ? { ...req, status: respondStatus, ownerResponseMessage: responseMessage, respondedAt: new Date() }
            : req
        ))
        
        setTimeout(() => {
          handleCloseRespondModal()
        }, 1500)
      }
    } catch (err) {
      setError(err?.response?.data?.message || 'Failed to submit response')
    } finally {
      setSubmitting(false)
    }
  }

  const toggleExpand = (id) => {
    setExpandedRequestId(expandedRequestId === id ? null : id)
  }

  const getStatusBadge = (status) => {
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
      <div className="rounded-3xl bg-gradient-to-br from-violet-600 via-indigo-600 to-indigo-800 p-6 text-white shadow-xl shadow-indigo-100">
        <div className="flex items-center gap-2">
          <Heart className="h-4.5 w-4.5 text-indigo-200" />
          <span className="text-xs font-bold uppercase tracking-widest text-indigo-100">Owner Tools</span>
        </div>
        <h1 className="mt-2 text-2xl font-bold text-white" style={{ fontFamily: 'Outfit, sans-serif' }}>
          Interest Requests Received
        </h1>
        <p className="mt-1 text-sm text-indigo-100 max-w-lg">
          Review details of tenants who are interested in renting your properties. Inspect their tenant compatibility profile, and respond directly.
        </p>
      </div>

      {error && (
        <div className="flex items-center gap-3 rounded-2xl border border-rose-200 bg-rose-50 px-5 py-4 text-sm text-rose-800 shadow-sm">
          <AlertCircle className="h-5 w-5 text-rose-500 shrink-0" />
          <div>{error}</div>
        </div>
      )}

      {requests.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-3xl border-2 border-dashed border-slate-200 bg-white py-16 text-center">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-50 text-slate-400">
            <Heart className="h-7 w-7" strokeWidth={1.5} />
          </div>
          <h3 className="mt-4 text-base font-bold text-slate-700">No interest requests received</h3>
          <p className="mt-1 text-sm text-slate-400 max-w-xs">
            As soon as tenants express interest in your listed properties, they will show up here.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {requests.map((req) => {
            const listing = req.listing || {}
            const tenant = req.tenant || {}
            const profile = req.tenantProfile
            const isExpanded = expandedRequestId === req._id

            return (
              <div
                key={req._id}
                className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition hover:shadow-md"
              >
                {/* Collapsed Card view */}
                <div className="p-5 flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div className="flex items-start gap-4">
                    {/* Tenant Avatar */}
                    <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-500 to-violet-500 text-sm font-bold text-white shrink-0">
                      {tenant.name ? tenant.name.split(' ').map((n) => n[0]).join('').toUpperCase().slice(0, 2) : 'T'}
                    </div>

                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <h3 className="font-bold text-slate-800 text-sm sm:text-base truncate" style={{ fontFamily: 'Outfit, sans-serif' }}>
                          {tenant.name || 'Tenant'}
                        </h3>
                        <span className={`rounded-full border px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider ${getStatusBadge(req.status)}`}>
                          {req.status}
                        </span>
                      </div>
                      <p className="text-xs text-indigo-600 font-semibold truncate">
                        Interested in: {listing.title || 'Unknown Property'}
                      </p>
                      <p className="mt-0.5 text-[10px] text-slate-400 font-semibold flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        Received: {new Date(req.createdAt).toLocaleDateString('en-IN')}
                      </p>
                    </div>
                  </div>

                  {/* Actions & Collapser */}
                  <div className="flex items-center justify-between md:justify-end gap-3 pt-3 md:pt-0 border-t md:border-t-0 border-slate-100">
                    <button
                      onClick={() => toggleExpand(req._id)}
                      className="flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-50 transition cursor-pointer"
                    >
                      {isExpanded ? (
                        <>
                          Hide Info
                          <ChevronUp className="h-3.5 w-3.5" />
                        </>
                      ) : (
                        <>
                          Review Request
                          <ChevronDown className="h-3.5 w-3.5" />
                        </>
                      )}
                    </button>

                    {req.status === 'pending' && (
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleOpenRespondModal(req, 'declined')}
                          className="flex items-center justify-center h-8.5 w-8.5 rounded-xl border border-rose-200 bg-rose-50 hover:bg-rose-100 text-rose-600 transition cursor-pointer"
                          title="Decline"
                        >
                          <X className="h-4.5 w-4.5" />
                        </button>
                        <button
                          onClick={() => handleOpenRespondModal(req, 'accepted')}
                          className="flex items-center justify-center h-8.5 w-8.5 rounded-xl border border-emerald-200 bg-emerald-50 hover:bg-emerald-100 text-emerald-600 transition cursor-pointer"
                          title="Accept"
                        >
                          <Check className="h-4.5 w-4.5" />
                        </button>
                      </div>
                    )}

                    {req.status === 'accepted' && (
                      <Link
                        to={`/dashboard/tenant/chats?interestId=${req._id}`}
                        className="flex items-center gap-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 px-3.5 py-2 text-xs font-bold text-white transition cursor-pointer shadow-sm hover:shadow"
                      >
                        <MessageSquare className="h-3.5 w-3.5" />
                        Chat
                      </Link>
                    )}
                  </div>
                </div>

                {/* Expanded Details section */}
                {isExpanded && (
                  <div className="bg-slate-50 border-t border-slate-200/80 p-5 space-y-5 text-sm">
                    {/* Interest Message */}
                    <div className="space-y-1.5">
                      <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">Tenant Message</h4>
                      <p className="bg-white border border-slate-200 rounded-xl p-3.5 text-xs text-slate-700 italic">
                        "{req.tenantMessage || 'No message provided.'}"
                      </p>
                    </div>

                    {/* Compatibility Score (Step 11 requirement) */}
                    {req.compatibility && (
                      <div className="rounded-xl border border-indigo-100 bg-indigo-50/50 p-4 space-y-2">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-1.5">
                            <Sparkles className="h-4 w-4 text-indigo-600 animate-pulse" />
                            <span className="text-[10px] font-bold text-indigo-900 uppercase tracking-wider">Tenant Compatibility Match</span>
                          </div>
                          <span className={`rounded-xl px-2 py-0.5 text-[10px] font-bold text-white shadow-sm ${
                            req.compatibility.score >= 80 ? 'bg-emerald-600' :
                            req.compatibility.score >= 50 ? 'bg-amber-500' :
                            'bg-rose-500'
                          }`}>
                            {req.compatibility.score}% Match
                          </span>
                        </div>
                        <p className="text-xs text-indigo-800 leading-relaxed font-medium">
                          {req.compatibility.explanation}
                        </p>
                      </div>
                    )}

                    {/* Tenant Profile details (Step 6 fields) */}
                    <div className="space-y-3">
                      <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                        <User className="h-4 w-4 text-indigo-500" />
                        Tenant Profile Preferences
                      </h4>
                      {profile ? (
                        <div className="grid gap-4 sm:grid-cols-2">
                          {/* Locations */}
                          <div className="bg-white border border-slate-200 rounded-xl p-3 space-y-1">
                            <span className="text-[10px] font-bold text-slate-400 uppercase">Preferred Locations</span>
                            <div className="flex flex-wrap gap-1 mt-1">
                              {profile.preferredLocations?.map((loc) => (
                                <span key={loc} className="rounded-lg bg-indigo-50 px-2 py-0.5 text-xs font-semibold text-indigo-700">
                                  {loc}
                                </span>
                              ))}
                            </div>
                          </div>

                          {/* Budget */}
                          <div className="bg-white border border-slate-200 rounded-xl p-3 space-y-0.5">
                            <span className="text-[10px] font-bold text-slate-400 uppercase">Monthly Budget Range</span>
                            <p className="text-sm font-bold text-indigo-600">
                              ₹{profile.budgetRange?.min?.toLocaleString()} - ₹{profile.budgetRange?.max?.toLocaleString()}
                            </p>
                          </div>

                          {/* Move in Date */}
                          <div className="bg-white border border-slate-200 rounded-xl p-3 space-y-0.5">
                            <span className="text-[10px] font-bold text-slate-400 uppercase">Move-In Date</span>
                            <p className="text-xs font-bold text-slate-800">
                              {new Date(profile.moveInDate).toLocaleDateString('en-IN', {
                                day: 'numeric',
                                month: 'short',
                                year: 'numeric',
                              })}
                            </p>
                          </div>

                          {/* Bio */}
                          <div className="bg-white border border-slate-200 rounded-xl p-3 space-y-0.5 sm:col-span-2">
                            <span className="text-[10px] font-bold text-slate-400 uppercase">About Tenant</span>
                            <p className="text-xs text-slate-600 leading-relaxed">
                              {profile.bio || 'No bio written.'}
                            </p>
                          </div>

                          {/* Room preferences */}
                          {profile.roomPreferences && profile.roomPreferences.length > 0 && (
                            <div className="sm:col-span-2 space-y-1">
                              <span className="text-[10px] font-bold text-slate-400 uppercase block">Room Preferences</span>
                              <div className="flex flex-wrap gap-1.5 mt-0.5">
                                {profile.roomPreferences.map((r) => (
                                  <span key={r} className="rounded-xl bg-violet-50 text-violet-700 border border-violet-100 px-2.5 py-1 text-xs font-semibold">
                                    {r}
                                  </span>
                                ))}
                              </div>
                            </div>
                          )}

                          {/* Lifestyle tags */}
                          {profile.lifestylePreferences && profile.lifestylePreferences.length > 0 && (
                            <div className="sm:col-span-2 space-y-1">
                              <span className="text-[10px] font-bold text-slate-400 uppercase block">Lifestyle & Habits</span>
                              <div className="flex flex-wrap gap-1.5 mt-0.5">
                                {profile.lifestylePreferences.map((t) => (
                                  <span key={t} className="rounded-full bg-slate-100 border border-slate-200 px-2.5 py-0.5 text-xs font-semibold text-slate-600">
                                    {t}
                                  </span>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>
                      ) : (
                        <div className="rounded-xl border border-dashed border-slate-200 bg-white p-4 text-center text-xs text-slate-400">
                          Tenant has not completed their compatibility profile yet.
                        </div>
                      )}
                    </div>

                    {/* Response display (if already responded) */}
                    {req.status !== 'pending' && (
                      <div className="border-t border-slate-200/80 pt-4 space-y-1.5">
                        <div className="flex items-center gap-1.5 text-xs font-bold text-slate-500 uppercase">
                          <MessageSquare className="h-3.5 w-3.5" />
                          <span>My Response Message:</span>
                          {req.respondedAt && (
                            <span className="font-normal text-slate-400 text-[10px] lowercase">
                              ({new Date(req.respondedAt).toLocaleDateString('en-IN')})
                            </span>
                          )}
                        </div>
                        <p className="bg-white border border-slate-200 rounded-xl p-3.5 text-xs text-slate-700">
                          {req.ownerResponseMessage || 'Accepted without message.'}
                        </p>
                      </div>
                    )}
                  </div>
                )}
              </div>
            )
          })}
        </div>
      )}

      {/* Accept / Decline Response Modal */}
      {activeRespondRequest && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl space-y-5">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-md font-bold text-slate-800 flex items-center gap-2" style={{ fontFamily: 'Outfit, sans-serif' }}>
                <Sparkles className="h-5 w-5 text-indigo-500" />
                {respondStatus === 'accepted' ? 'Accept Interest Request' : 'Decline Interest Request'}
              </h3>
              <button
                onClick={handleCloseRespondModal}
                disabled={submitting}
                className="text-slate-400 hover:text-slate-600 transition"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {actionSuccess ? (
              <div className="flex flex-col items-center justify-center py-6 text-center space-y-3">
                <Check className="h-12 w-12 rounded-full bg-emerald-100 text-emerald-600 p-2" />
                <p className="text-sm font-semibold text-emerald-800">{actionSuccess}</p>
              </div>
            ) : (
              <form onSubmit={handleRespondSubmit} className="space-y-4">
                <div className="bg-slate-50 border border-slate-100 rounded-2xl p-4 text-xs space-y-1">
                  <p className="font-bold text-slate-700">Tenant: {activeRespondRequest.tenant.name}</p>
                  <p className="text-slate-500 font-medium">Property: {activeRespondRequest.listing.title}</p>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-600 uppercase tracking-wider block">
                    Response Message (Optional)
                  </label>
                  <textarea
                    placeholder={respondStatus === 'accepted' 
                      ? "e.g. Hi! I'd love to discuss moving in. Let's chat!" 
                      : "e.g. Sorry, the room is no longer available or not matching."}
                    value={responseMessage}
                    onChange={(e) => setResponseMessage(e.target.value)}
                    maxLength={1500}
                    rows={4}
                    className="w-full rounded-xl border border-slate-200 bg-white p-3 text-sm text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100"
                  />
                </div>

                <div className="flex justify-end gap-3 pt-3 border-t border-slate-100">
                  <button
                    type="button"
                    onClick={handleCloseRespondModal}
                    disabled={submitting}
                    className="rounded-xl border border-slate-200 px-5 py-2.5 text-xs font-semibold text-slate-600 hover:bg-slate-50 transition cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={submitting}
                    className={`flex items-center justify-center gap-1.5 rounded-xl px-5 py-2.5 text-xs font-bold text-white shadow transition cursor-pointer ${respondStatus === 'accepted' ? 'bg-emerald-600 hover:bg-emerald-500 shadow-emerald-100' : 'bg-rose-500 hover:bg-rose-400 shadow-rose-100'}`}
                  >
                    {submitting ? (
                      <>
                        <Loader2 className="h-4.5 w-4.5 animate-spin" />
                        Submitting...
                      </>
                    ) : (
                      <>
                        {respondStatus === 'accepted' ? 'Accept Request' : 'Decline Request'}
                      </>
                    )}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  )
}

export default InterestRequests
