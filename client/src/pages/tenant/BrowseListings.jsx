import { useEffect, useState, useRef } from 'react'
import { Link } from 'react-router-dom'
import { MapPin, Calendar, Building2, Search, SlidersHorizontal, IndianRupee, Eye, X, ChevronLeft, ChevronRight, Heart, Loader2, Check, Sparkles } from 'lucide-react'
import listingService from '../../services/listingService.js'
import interestService from '../../services/interestService.js'
import useAuth from '../../hooks/useAuth.jsx'
import CompatibilityDetailCard from '../../components/compatibility/CompatibilityDetailCard.jsx'

const roomTypeLabel = {
  'private-room': 'Private Room',
  'shared-room': 'Shared Room',
  studio: 'Studio',
  apartment: 'Apartment',
  other: 'Other',
}

const BrowseListings = () => {
  const { user } = useAuth()
  const [listings, setListings] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  // Filter States
  const [search, setSearch] = useState('')
  const [location, setLocation] = useState('')
  const [maxRent, setMaxRent] = useState('')
  const [roomType, setRoomType] = useState('')
  const [showFilters, setShowFilters] = useState(false)
  const autoRefreshedRef = useRef(false)

  // Detailed Modal State
  const [selectedListing, setSelectedListing] = useState(null)
  const [activePhotoIndex, setActivePhotoIndex] = useState(0)

  // Interest States
  const [myInterests, setMyInterests] = useState([])
  const [interestMessage, setInterestMessage] = useState('')
  const [sendingInterest, setSendingInterest] = useState(false)
  const [interestSuccess, setInterestSuccess] = useState('')

  const fetchListings = async () => {
    setLoading(true)
    setError('')
    try {
      const params = {}
      if (search) params.search = search
      if (location) params.location = location
      if (maxRent) params.maxRent = maxRent
      if (roomType) params.roomType = roomType

      const response = await listingService.getAllListings(params)
      const fetched = response.listings || []
      setListings(fetched)

      // Sync active modal details with newly fetched listing (for background compatibility score updates)
      setSelectedListing((current) => {
        if (!current) return null
        const updated = fetched.find((l) => l._id === current._id)
        return updated || current
      })

      // If we haven't already auto-refreshed, and some listings have pending AI calculations,
      // trigger a single dynamic refresh after 3.5 seconds to pull the fresh scores
      const hasPendingAI = fetched.some((l) => l.compatibility?.source === 'rule-based-pending')
      if (hasPendingAI && !autoRefreshedRef.current) {
        autoRefreshedRef.current = true
        setTimeout(() => {
          fetchListings()
        }, 3500)
      }
    } catch (requestError) {
      setError(requestError?.response?.data?.message || 'Failed to fetch listings')
    } finally {
      setLoading(false)
    }
  }

  const fetchMyInterests = async () => {
    if (!user || user.role !== 'tenant') return
    try {
      const response = await interestService.getMyInterests()
      if (response.success) {
        setMyInterests(response.interests || [])
      }
    } catch (err) {
      console.error('Failed to load interests', err)
    }
  }

  const handleSendInterest = async (e) => {
    e.preventDefault()
    if (!selectedListing) return

    setSendingInterest(true)
    setInterestSuccess('')
    setError('')
    try {
      const response = await interestService.sendInterest(selectedListing._id, interestMessage)
      if (response.success) {
        setInterestSuccess('Interest expressed successfully!')
        setInterestMessage('')
        await fetchMyInterests()
      }
    } catch (err) {
      setError(err?.response?.data?.message || 'Failed to express interest')
    } finally {
      setSendingInterest(false)
    }
  }

  useEffect(() => {
    fetchListings()
    fetchMyInterests()
  }, [])

  const handleSearchSubmit = (e) => {
    e.preventDefault()
    autoRefreshedRef.current = false
    fetchListings()
  }

  const handleClearFilters = () => {
    setSearch('')
    setLocation('')
    setMaxRent('')
    setRoomType('')
    autoRefreshedRef.current = false
    // Re-fetch immediately
    setTimeout(() => {
      fetchListings()
    }, 0)
  }

  const openDetails = (listing) => {
    setSelectedListing(listing)
    setActivePhotoIndex(0)
    setInterestSuccess('')
    setInterestMessage('')
    setError('')
  }

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="rounded-3xl bg-gradient-to-r from-indigo-600 via-indigo-700 to-violet-700 p-6 text-white shadow-md shadow-indigo-100">
        <p className="text-xs font-bold uppercase tracking-widest text-indigo-200">Tenant Tools</p>
        <h1 className="mt-1 text-2xl font-bold" style={{ fontFamily: 'Outfit, sans-serif' }}>
          Browse Room Listings
        </h1>
        <p className="mt-1.5 text-sm text-indigo-100 max-w-lg">
          Find your next home in Pune. Browse verified listings and check compatibility scores.
        </p>
      </div>

      {/* Filter / Search Bar */}
      <form onSubmit={handleSearchSubmit} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-slate-400">
            <SlidersHorizontal className="h-4.5 w-4.5 text-indigo-500" />
            <span>Filters & Search</span>
          </div>
          {/* Mobile Filter Toggle Button */}
          <button
            type="button"
            onClick={() => setShowFilters(!showFilters)}
            className="flex lg:hidden items-center gap-1.5 rounded-xl border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs font-bold text-slate-700 hover:bg-slate-100 transition"
          >
            <SlidersHorizontal className="h-3.5 w-3.5" />
            <span>{showFilters ? 'Hide Filters' : 'Show Filters'}</span>
          </button>
        </div>

        {/* Search Row - Always Visible */}
        <div className="grid gap-4 lg:grid-cols-5 items-end">
          <div className="lg:col-span-4 space-y-1.5">
            <label className="text-xs font-semibold text-slate-500">Search Keywords</label>
            <div className="relative">
              <Search className="absolute left-3.5 top-3 h-4 w-4 text-slate-400" />
              <input
                type="text"
                placeholder="e.g. WiFi, AC, Cozy, Kothrud"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full rounded-xl border border-slate-200 bg-white py-2.5 pl-10 pr-4 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100"
              />
            </div>
          </div>
          <div className="hidden lg:flex gap-2">
            <button
              type="submit"
              className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-indigo-600 px-4 py-2.5 text-sm font-bold text-white shadow-md shadow-indigo-100 transition hover:bg-indigo-500 cursor-pointer"
            >
              <Search className="h-4 w-4" />
              Search
            </button>
            {(search || location || maxRent || roomType) && (
              <button
                type="button"
                onClick={handleClearFilters}
                className="flex items-center justify-center rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm font-semibold text-slate-600 transition hover:bg-slate-100 cursor-pointer"
              >
                Clear
              </button>
            )}
          </div>
        </div>

        {/* Collapsible / Responsive Grid for other filters */}
        <div className={`mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-4 items-end ${showFilters ? 'grid' : 'hidden lg:grid'}`}>
          {/* Location Filter */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-500">Location / Area</label>
            <div className="relative">
              <MapPin className="absolute left-3.5 top-3 h-4 w-4 text-slate-400" />
              <input
                type="text"
                placeholder="e.g. Koregaon Park"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                className="w-full rounded-xl border border-slate-200 bg-white py-2.5 pl-10 pr-4 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100"
              />
            </div>
          </div>

          {/* Max Rent Filter */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-500">Max Monthly Rent (₹)</label>
            <div className="relative">
              <span className="absolute left-3.5 top-2.5 text-sm font-semibold text-slate-400">₹</span>
              <input
                type="number"
                placeholder="e.g. 15000"
                value={maxRent}
                onChange={(e) => setMaxRent(e.target.value)}
                className="w-full rounded-xl border border-slate-200 bg-white py-2.5 pl-8 pr-4 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100"
              />
            </div>
          </div>

          {/* Room Type Filter */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-500">Room Type</label>
            <select
              value={roomType}
              onChange={(e) => setRoomType(e.target.value)}
              className="w-full rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm text-slate-900 outline-none transition focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100"
            >
              <option value="">Any Room Type</option>
              <option value="private-room">Private Room</option>
              <option value="shared-room">Shared Room</option>
              <option value="studio">Studio</option>
              <option value="apartment">Apartment</option>
              <option value="other">Other</option>
            </select>
          </div>

          {/* Mobile Actions block */}
          <div className="flex gap-2 lg:hidden pt-2">
            <button
              type="submit"
              className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-indigo-600 px-4 py-2.5 text-sm font-bold text-white shadow-md shadow-indigo-100 transition hover:bg-indigo-500 cursor-pointer"
            >
              <Search className="h-4 w-4" />
              Apply
            </button>
            {(search || location || maxRent || roomType) && (
              <button
                type="button"
                onClick={handleClearFilters}
                className="flex items-center justify-center rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm font-semibold text-slate-600 transition hover:bg-slate-100 cursor-pointer"
              >
                Clear
              </button>
            )}
          </div>
        </div>
      </form>

      {/* Error Message */}
      {error && (
        <div className="flex items-center gap-3 rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
          <span>⚠️</span> {error}
        </div>
      )}

      {/* Listings Grid */}
      {loading ? (
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-72 animate-pulse rounded-2xl border border-slate-100 bg-slate-100" />
          ))}
        </div>
      ) : listings.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-3xl border-2 border-dashed border-slate-200 bg-white py-16 text-center">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-50 text-slate-400">
            <Building2 className="h-7 w-7" strokeWidth={1.5} />
          </div>
          <h3 className="mt-4 text-base font-bold text-slate-700">No rooms available</h3>
          <p className="mt-1 text-sm text-slate-400 max-w-xs">
            We couldn't find any active listings matching your search. Try broadening your filters.
          </p>
        </div>
      ) : (
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {listings.map((listing) => (
            <article
              key={listing._id}
              className="group overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition hover:shadow-md flex flex-col justify-between"
            >
              {/* Image Section */}
              <div className="relative h-44 overflow-hidden bg-slate-100">
                {listing.images?.[0] ? (
                  <img
                    src={listing.images[0].url}
                    alt={listing.title}
                    className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                  />
                ) : (
                  <div className="flex h-full items-center justify-center text-slate-300">
                    <Building2 className="h-10 w-10" />
                  </div>
                )}

                {/* Badges */}
                <div className="absolute left-3 top-3 flex flex-wrap gap-1">
                  <span className="rounded-full bg-black/60 px-2 py-0.5 text-[9px] font-semibold text-white backdrop-blur-sm">
                    {roomTypeLabel[listing.roomType] || listing.roomType}
                  </span>
                  <span className={`rounded-full px-2 py-0.5 text-[9px] font-semibold text-white backdrop-blur-sm ${listing.furnished ? 'bg-indigo-600/80' : 'bg-slate-600/80'}`}>
                    {listing.furnished ? 'Furnished' : 'Unfurnished'}
                  </span>
                </div>

                {/* Compatibility Badge */}
                {listing.compatibility && (
                  <div className="absolute right-3 top-3">
                    <span className={`rounded-xl px-2.5 py-1 text-[9px] font-bold text-white shadow-sm flex items-center gap-1 backdrop-blur-md ${
                      listing.compatibility.score >= 80 ? 'bg-emerald-600/95' :
                      listing.compatibility.score >= 50 ? 'bg-amber-500/95' :
                      'bg-rose-500/95'
                    }`}>
                      <Sparkles className="h-3 w-3 fill-white/10 shrink-0" />
                      {listing.compatibility.score}% Match
                    </span>
                  </div>
                )}
              </div>

              {/* Card Details */}
              <div className="p-4 flex-1 flex flex-col justify-between space-y-3">
                <div>
                  <h3 className="font-bold text-slate-900 line-clamp-1 group-hover:text-indigo-600 transition" style={{ fontFamily: 'Outfit, sans-serif' }}>
                    {listing.title}
                  </h3>
                  <p className="mt-0.5 flex items-center gap-1 text-[11px] text-slate-500">
                    <MapPin className="h-3 w-3 text-slate-400" />
                    {listing.location}
                  </p>
                </div>

                <p className="text-xs leading-relaxed text-slate-500 line-clamp-2">
                  {listing.description}
                </p>

                {/* Compatibility Explanation on Card */}
                {listing.compatibility && (
                  <div className="rounded-xl bg-indigo-50/50 border border-indigo-100/50 p-2.5 text-[10px] text-indigo-700 flex items-start gap-1.5 mt-1">
                    <Sparkles className="h-3.5 w-3.5 text-indigo-500 shrink-0 mt-0.5" />
                    <p className="line-clamp-2 leading-relaxed">
                      {listing.compatibility.explanation}
                    </p>
                  </div>
                )}

                {/* Rent & Details button */}
                <div className="flex items-center justify-between pt-1 border-t border-slate-100">
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Rent</span>
                    <p className="text-base font-extrabold text-indigo-600">
                      ₹{listing.rent?.toLocaleString()}
                      <span className="text-[10px] font-normal text-slate-400">/mo</span>
                    </p>
                  </div>
                  <button
                    onClick={() => openDetails(listing)}
                    className="inline-flex items-center gap-1 rounded-xl bg-slate-900 hover:bg-indigo-600 px-3.5 py-2 text-xs font-bold text-white transition cursor-pointer shadow-sm hover:shadow"
                  >
                    <Eye className="h-3.5 w-3.5" />
                    View Room
                  </button>
                </div>
              </div>
            </article>
          ))}
        </div>
      )}

      {/* Details Lightbox Modal */}
      {selectedListing && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm overflow-y-auto">
          <div className="relative bg-white rounded-3xl max-w-3xl w-full max-h-[90vh] overflow-y-auto flex flex-col shadow-2xl">
            {/* Close Button */}
            <button
              onClick={() => setSelectedListing(null)}
              className="absolute top-4 right-4 z-10 rounded-full bg-slate-900/60 p-2 text-white hover:bg-slate-900 transition cursor-pointer"
            >
              <X className="h-5 w-5" />
            </button>

            {/* Gallery Image Display */}
            {selectedListing.images && selectedListing.images.length > 0 ? (
              <div className="relative h-64 sm:h-80 w-full bg-slate-950 shrink-0">
                <img
                  src={selectedListing.images[activePhotoIndex].url}
                  alt={selectedListing.title}
                  className="h-full w-full object-contain"
                />

                {/* Next / Prev Controls */}
                {selectedListing.images.length > 1 && (
                  <>
                    <button
                      onClick={() => setActivePhotoIndex((i) => (i - 1 + selectedListing.images.length) % selectedListing.images.length)}
                      className="absolute left-4 top-1/2 -translate-y-1/2 rounded-full bg-black/50 p-2 text-white hover:bg-black/75 transition cursor-pointer"
                    >
                      <ChevronLeft className="h-5 w-5" />
                    </button>
                    <button
                      onClick={() => setActivePhotoIndex((i) => (i + 1) % selectedListing.images.length)}
                      className="absolute right-4 top-1/2 -translate-y-1/2 rounded-full bg-black/50 p-2 text-white hover:bg-black/75 transition cursor-pointer"
                    >
                      <ChevronRight className="h-5 w-5" />
                    </button>
                  </>
                )}

                {/* Photo indicator */}
                <span className="absolute bottom-4 right-4 rounded-full bg-black/60 px-3 py-1 text-xs font-semibold text-white">
                  {activePhotoIndex + 1} of {selectedListing.images.length}
                </span>
              </div>
            ) : (
              <div className="h-64 w-full bg-slate-100 flex items-center justify-center text-slate-300 shrink-0">
                <Building2 className="h-16 w-16" />
              </div>
            )}

            {/* Content Details */}
            <div className="p-6 space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                <div>
                  <h2 className="text-xl sm:text-2xl font-bold text-slate-900" style={{ fontFamily: 'Outfit, sans-serif' }}>
                    {selectedListing.title}
                  </h2>
                  <p className="mt-1 flex items-center gap-1 text-xs text-slate-500">
                    <MapPin className="h-4.5 w-4.5 text-indigo-500" />
                    {selectedListing.location}
                  </p>
                </div>
                <div className="bg-indigo-50 border border-indigo-100 rounded-2xl p-4 text-center shrink-0">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-0.5">Rent per Month</span>
                  <span className="text-xl font-extrabold text-indigo-700" style={{ fontFamily: 'Outfit, sans-serif' }}>
                    ₹{selectedListing.rent?.toLocaleString()}
                  </span>
                </div>
              </div>

              {/* Specs & Features Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 rounded-2xl bg-slate-50 p-4 text-center text-xs font-semibold text-slate-700">
                <div className="space-y-1">
                  <span className="text-[10px] font-bold uppercase text-slate-400 block">Room Type</span>
                  <span>{roomTypeLabel[selectedListing.roomType] || selectedListing.roomType}</span>
                </div>
                <div className="space-y-1">
                  <span className="text-[10px] font-bold uppercase text-slate-400 block">Furnishing</span>
                  <span>{selectedListing.furnished ? 'Furnished' : 'Unfurnished'}</span>
                </div>
                <div className="space-y-1">
                  <span className="text-[10px] font-bold uppercase text-slate-400 block">Pref. Gender</span>
                  <span className="capitalize">{selectedListing.genderPreference || 'Any'}</span>
                </div>
                <div className="space-y-1">
                  <span className="text-[10px] font-bold uppercase text-slate-400 block">Available From</span>
                  <span>
                    {new Date(selectedListing.availableFrom).toLocaleDateString('en-IN', {
                      day: 'numeric',
                      month: 'short',
                      year: 'numeric',
                    })}
                  </span>
                </div>
              </div>

              {/* Compatibility Match Detail Panel */}
              {selectedListing.compatibility && (
                <CompatibilityDetailCard compatibility={selectedListing.compatibility} />
              )}

              {/* Description */}
              <div className="space-y-2">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">Description</h4>
                <p className="text-sm leading-relaxed text-slate-600 whitespace-pre-wrap">
                  {selectedListing.description}
                </p>
              </div>

              {/* Amenities */}
              {selectedListing.amenities && selectedListing.amenities.length > 0 && (
                <div className="space-y-2">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">Amenities</h4>
                  <div className="flex flex-wrap gap-2">
                    {selectedListing.amenities.map((item) => (
                      <span key={item} className="rounded-xl border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-600">
                        {item}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Express Interest Panel */}
              {user && selectedListing.owner !== user.id && selectedListing.owner?._id !== user.id && (
                <div className="pt-4 border-t border-slate-100 space-y-4">
                  {(() => {
                    const existingInterest = myInterests.find(
                      (i) => (i.listing?._id || i.listing) === selectedListing._id
                    )

                    if (existingInterest) {
                      return (
                        <div className="rounded-2xl border border-indigo-100 bg-indigo-50/50 p-4 flex flex-col gap-2.5">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <Heart className="h-4 w-4 text-indigo-500 fill-indigo-500" />
                              <span className="text-xs font-bold text-indigo-900">Interest Expressed</span>
                            </div>
                            <span className={`rounded-full px-2.5 py-0.5 text-[9px] font-bold uppercase tracking-wider border ${
                              existingInterest.status === 'accepted' ? 'bg-emerald-100 border-emerald-200 text-emerald-800' :
                              existingInterest.status === 'declined' ? 'bg-rose-100 border-rose-200 text-rose-800' :
                              'bg-amber-100 border-amber-200 text-amber-800'
                            }`}>
                              {existingInterest.status}
                            </span>
                          </div>
                          <p className="text-xs text-indigo-700 italic">
                            "Your message: {existingInterest.tenantMessage || 'No message.'}"
                          </p>
                          {existingInterest.status === 'accepted' && (
                            <div className="pt-2 border-t border-indigo-200/60 flex items-center justify-between">
                              <p className="text-[10px] text-emerald-700 font-medium">Owner accepted! You can now chat.</p>
                              <Link to="/dashboard/tenant/interests" className="inline-flex items-center gap-1 text-[10px] font-bold text-indigo-600 hover:text-indigo-800">
                                View Request Details →
                              </Link>
                            </div>
                          )}
                        </div>
                      )
                    }

                    if (user.role === 'tenant') {
                      return (
                        <div className="rounded-2xl border border-slate-200 bg-white p-4 space-y-3">
                          <div className="flex items-center gap-2">
                            <Heart className="h-4.5 w-4.5 text-rose-500 shrink-0" />
                            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700">Express Interest in this Room</h4>
                          </div>
                          {interestSuccess ? (
                            <div className="flex items-center gap-2.5 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-xs text-emerald-800">
                              <Check className="h-4 w-4 text-emerald-500 shrink-0" />
                              <span>{interestSuccess}</span>
                            </div>
                          ) : (
                            <form onSubmit={handleSendInterest} className="space-y-3">
                              <textarea
                                placeholder="Introduce yourself briefly to the owner, mention your occupation, move-in details, or why this place caught your eye..."
                                value={interestMessage}
                                onChange={(e) => setInterestMessage(e.target.value)}
                                maxLength={1500}
                                rows={3}
                                className="w-full rounded-xl border border-slate-200 bg-white p-3 text-xs text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100"
                              />
                              <button
                                type="submit"
                                disabled={sendingInterest}
                                className="flex w-full items-center justify-center gap-2 rounded-xl bg-slate-900 hover:bg-indigo-600 py-2.5 text-xs font-bold text-white shadow transition disabled:opacity-50 cursor-pointer"
                              >
                                {sendingInterest ? (
                                  <>
                                    <Loader2 className="h-4 w-4 animate-spin" />
                                    Sending Interest...
                                  </>
                                ) : (
                                  <>
                                    <Heart className="h-4 w-4" />
                                    Express Interest
                                  </>
                                )}
                              </button>
                            </form>
                          )}
                        </div>
                      )
                    }

                    return null
                  })()}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default BrowseListings
