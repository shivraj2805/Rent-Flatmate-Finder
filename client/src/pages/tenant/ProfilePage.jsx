import { useEffect, useState } from 'react'
import {
  MapPin, Calendar, User, Edit3, Save, X, Plus,
  Sparkles, CheckCircle2, AlertCircle, Loader2, PlusCircle, Info
} from 'lucide-react'
import tenantService from '../../services/tenantService'
import useAuth from '../../hooks/useAuth.jsx'

const ROOM_TYPES = [
  { value: 'private-room', label: 'Private Room' },
  { value: 'shared-room', label: 'Shared Room' },
  { value: 'studio', label: 'Studio' },
  { value: 'apartment', label: 'Apartment' },
  { value: 'other', label: 'Other' },
]

const COMMON_LIFESTYLE_TAGS = [
  'Non-smoker',
  'No pets',
  'Vegetarian',
  'Quiet / Studious',
  'Early Bird',
  'Night Owl',
  'Social',
  'Working Professional',
  'Gym Enthusiast',
  'Pet Friendly',
]

const ProfilePage = () => {
  const { user } = useAuth()
  const [profile, setProfile] = useState(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [isEditing, setIsEditing] = useState(false)
  const [error, setError] = useState('')
  const [successMsg, setSuccessMsg] = useState('')

  // Form State
  const [preferredLocations, setPreferredLocations] = useState([])
  const [newLocation, setNewLocation] = useState('')
  const [minBudget, setMinBudget] = useState('')
  const [maxBudget, setMaxBudget] = useState('')
  const [moveInDate, setMoveInDate] = useState('')
  const [bio, setBio] = useState('')
  const [roomPreferences, setRoomPreferences] = useState([])
  const [lifestylePreferences, setLifestylePreferences] = useState([])
  const [newLifestyleTag, setNewLifestyleTag] = useState('')
  const [isSearching, setIsSearching] = useState(true)

  const fetchProfile = async () => {
    setLoading(true)
    setError('')
    try {
      const response = await tenantService.getProfile()
      if (response.success && response.profile) {
        const prof = response.profile
        setProfile(prof)
        setPreferredLocations(prof.preferredLocations || [])
        setMinBudget(prof.budgetRange?.min || '')
        setMaxBudget(prof.budgetRange?.max || '')
        
        // Format ISO Date to YYYY-MM-DD for date input
        if (prof.moveInDate) {
          const dateObj = new Date(prof.moveInDate)
          if (!isNaN(dateObj.getTime())) {
            setMoveInDate(dateObj.toISOString().split('T')[0])
          }
        } else {
          setMoveInDate('')
        }
        
        setBio(prof.bio || '')
        setRoomPreferences(prof.roomPreferences || [])
        setLifestylePreferences(prof.lifestylePreferences || [])
        setIsSearching(prof.isSearching !== undefined ? prof.isSearching : true)
      } else {
        setProfile(null)
        setIsEditing(true) // Automatically open editor if no profile exists
      }
    } catch (err) {
      setError(err?.response?.data?.message || 'Failed to fetch profile details')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchProfile()
  }, [])

  // Location Handlers
  const handleAddLocation = (e) => {
    e.preventDefault()
    const trimmed = newLocation.trim()
    if (trimmed && !preferredLocations.includes(trimmed)) {
      setPreferredLocations([...preferredLocations, trimmed])
      setNewLocation('')
    }
  }

  const handleRemoveLocation = (indexToRemove) => {
    setPreferredLocations(preferredLocations.filter((_, i) => i !== indexToRemove))
  }

  // Room Preference Handlers
  const handleToggleRoomPref = (val) => {
    if (roomPreferences.includes(val)) {
      setRoomPreferences(roomPreferences.filter((r) => r !== val))
    } else {
      setRoomPreferences([...roomPreferences, val])
    }
  }

  // Lifestyle Handlers
  const handleToggleCommonTag = (tag) => {
    if (lifestylePreferences.includes(tag)) {
      setLifestylePreferences(lifestylePreferences.filter((t) => t !== tag))
    } else {
      setLifestylePreferences([...lifestylePreferences, tag])
    }
  }

  const handleAddCustomLifestyleTag = (e) => {
    e.preventDefault()
    const trimmed = newLifestyleTag.trim()
    if (trimmed && !lifestylePreferences.includes(trimmed)) {
      setLifestylePreferences([...lifestylePreferences, trimmed])
      setNewLifestyleTag('')
    }
  }

  const handleRemoveLifestyleTag = (indexToRemove) => {
    setLifestylePreferences(lifestylePreferences.filter((_, i) => i !== indexToRemove))
  }

  const handleFormSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setSuccessMsg('')

    if (preferredLocations.length === 0) {
      setError('Please add at least one preferred location')
      return
    }

    const minB = Number(minBudget)
    const maxB = Number(maxBudget)

    if (isNaN(minB) || minB < 0) {
      setError('Minimum budget must be a positive number')
      return
    }

    if (isNaN(maxB) || maxB < minB) {
      setError('Maximum budget must be greater than or equal to minimum budget')
      return
    }

    if (!moveInDate) {
      setError('Please select a preferred move-in date')
      return
    }

    setSaving(true)
    try {
      const payload = {
        preferredLocations,
        budgetRange: {
          min: minB,
          max: maxB,
          currency: 'INR',
        },
        moveInDate: new Date(moveInDate).toISOString(),
        roomPreferences,
        lifestylePreferences,
        bio,
        isSearching,
      }

      const response = await tenantService.updateProfile(payload)
      if (response.success) {
        setSuccessMsg(response.message || 'Profile saved successfully!')
        setProfile(response.profile)
        setIsEditing(false)
        // Scroll to top to see success message
        window.scrollTo({ top: 0, behavior: 'smooth' })
      }
    } catch (err) {
      setError(err?.response?.data?.message || 'Failed to update profile. Please try again.')
    } finally {
      setSaving(false)
    }
  }

  const handleCancelEdit = () => {
    setError('')
    if (profile) {
      // Re-populate from original profile
      setPreferredLocations(profile.preferredLocations || [])
      setMinBudget(profile.budgetRange?.min || '')
      setMaxBudget(profile.budgetRange?.max || '')
      if (profile.moveInDate) {
        setMoveInDate(new Date(profile.moveInDate).toISOString().split('T')[0])
      }
      setBio(profile.bio || '')
      setRoomPreferences(profile.roomPreferences || [])
      setLifestylePreferences(profile.lifestylePreferences || [])
      setIsSearching(profile.isSearching !== undefined ? profile.isSearching : true)
      setIsEditing(false)
    } else {
      // No profile exists, can't cancel edit mode
      setError('You need to setup your tenant profile first.')
    }
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="h-32 animate-pulse rounded-3xl bg-slate-200" />
        <div className="grid gap-6 md:grid-cols-3">
          <div className="md:col-span-2 h-96 animate-pulse rounded-2xl bg-slate-200" />
          <div className="h-64 animate-pulse rounded-2xl bg-slate-200" />
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Header Banner */}
      <div className="rounded-3xl bg-gradient-to-r from-violet-600 via-indigo-600 to-blue-600 p-6 text-white shadow-xl shadow-indigo-100 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="flex h-5 w-5 items-center justify-center rounded-full bg-white/20 text-[10px] backdrop-blur-sm">
              ✨
            </span>
            <span className="text-xs font-bold uppercase tracking-widest text-indigo-100">
              Tenant Dashboard
            </span>
          </div>
          <h1 className="mt-2 text-2xl font-bold" style={{ fontFamily: 'Outfit, sans-serif' }}>
            Tenant Profile Setup
          </h1>
          <p className="mt-1 text-sm text-indigo-100 max-w-lg">
            Manage your preferences, budget, and locations. Your profile details are evaluated by our AI model to score your compatibility with active listings.
          </p>
        </div>
        {!isEditing && profile && (
          <button
            onClick={() => setIsEditing(true)}
            className="flex items-center gap-2 rounded-xl bg-white px-4 py-2.5 text-xs font-bold text-violet-700 shadow-md transition hover:bg-violet-50 hover:scale-[1.02] cursor-pointer self-start md:self-center"
          >
            <Edit3 className="h-4 w-4" />
            Edit Profile
          </button>
        )}
      </div>

      {/* Success / Error Messages */}
      {successMsg && (
        <div className="flex items-center gap-3 rounded-2xl border border-emerald-200 bg-emerald-50 px-5 py-4 text-sm text-emerald-800 shadow-sm">
          <CheckCircle2 className="h-5 w-5 text-emerald-500 shrink-0" />
          <div>{successMsg}</div>
        </div>
      )}

      {error && (
        <div className="flex items-center gap-3 rounded-2xl border border-rose-200 bg-rose-50 px-5 py-4 text-sm text-rose-800 shadow-sm">
          <AlertCircle className="h-5 w-5 text-rose-500 shrink-0" />
          <div>{error}</div>
        </div>
      )}

      {/* Main Layout Grid */}
      <div className="grid gap-6 md:grid-cols-3">
        {/* Profile Form (Left Column, spans 2 cols in desktop) */}
        <div className="md:col-span-2 space-y-6">
          {isEditing ? (
            <form onSubmit={handleFormSubmit} className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm space-y-6">
              <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                <h2 className="text-md font-bold text-slate-800 flex items-center gap-2" style={{ fontFamily: 'Outfit, sans-serif' }}>
                  <User className="h-5 w-5 text-indigo-600" />
                  Personal Preferences
                </h2>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-slate-400 font-semibold">Status:</span>
                  <button
                    type="button"
                    onClick={() => setIsSearching(!isSearching)}
                    className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${isSearching ? 'bg-indigo-600' : 'bg-slate-200'}`}
                  >
                    <span className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${isSearching ? 'translate-x-5' : 'translate-x-0'}`} />
                  </button>
                  <span className="text-xs font-bold text-slate-700">{isSearching ? 'Searching' : 'Paused'}</span>
                </div>
              </div>

              {/* Bio Description */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block">Bio / About Me</label>
                <textarea
                  placeholder="Describe yourself, your work/study hours, and what kind of flatmate environment you enjoy..."
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  maxLength={1000}
                  rows={4}
                  className="w-full rounded-xl border border-slate-200 bg-white p-3 text-sm text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100"
                />
                <div className="text-[10px] text-slate-400 text-right font-medium">
                  {bio.length}/1000 characters
                </div>
              </div>

              {/* Preferred Locations */}
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block">Preferred Locations</label>
                <div className="flex gap-2">
                  <div className="relative flex-1">
                    <MapPin className="absolute left-3.5 top-3 h-4 w-4 text-slate-400" />
                    <input
                      type="text"
                      placeholder="e.g. Koregaon Park, Pune"
                      value={newLocation}
                      onChange={(e) => setNewLocation(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          handleAddLocation(e)
                        }
                      }}
                      className="w-full rounded-xl border border-slate-200 bg-white py-2.5 pl-10 pr-4 text-sm text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100"
                    />
                  </div>
                  <button
                    type="button"
                    onClick={handleAddLocation}
                    className="flex items-center justify-center rounded-xl bg-slate-900 hover:bg-indigo-600 px-4 text-white text-sm font-bold transition cursor-pointer"
                  >
                    <Plus className="h-4.5 w-4.5" />
                  </button>
                </div>
                {preferredLocations.length === 0 ? (
                  <p className="text-xs text-amber-600 font-medium">Please add at least one location.</p>
                ) : (
                  <div className="flex flex-wrap gap-1.5 pt-1">
                    {preferredLocations.map((loc, idx) => (
                      <span key={loc} className="inline-flex items-center gap-1 rounded-xl bg-indigo-50 border border-indigo-100 px-3 py-1.5 text-xs font-semibold text-indigo-700">
                        {loc}
                        <button
                          type="button"
                          onClick={() => handleRemoveLocation(idx)}
                          className="text-indigo-400 hover:text-indigo-600 transition"
                        >
                          <X className="h-3 w-3" />
                        </button>
                      </span>
                    ))}
                  </div>
                )}
              </div>

              {/* Budget & Date Grid */}
              <div className="grid gap-4 sm:grid-cols-2">
                {/* Budget Min */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block">Min Budget (₹ / month)</label>
                  <div className="relative">
                    <span className="absolute left-3.5 top-2.5 text-sm font-semibold text-slate-400">₹</span>
                    <input
                      type="number"
                      placeholder="e.g. 5000"
                      value={minBudget}
                      onChange={(e) => setMinBudget(e.target.value)}
                      className="w-full rounded-xl border border-slate-200 bg-white py-2.5 pl-8 pr-4 text-sm text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100"
                    />
                  </div>
                </div>

                {/* Budget Max */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block">Max Budget (₹ / month)</label>
                  <div className="relative">
                    <span className="absolute left-3.5 top-2.5 text-sm font-semibold text-slate-400">₹</span>
                    <input
                      type="number"
                      placeholder="e.g. 15000"
                      value={maxBudget}
                      onChange={(e) => setMaxBudget(e.target.value)}
                      className="w-full rounded-xl border border-slate-200 bg-white py-2.5 pl-8 pr-4 text-sm text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100"
                    />
                  </div>
                </div>

                {/* Move-in Date */}
                <div className="sm:col-span-2 space-y-1.5">
                  <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block">Target Move-in Date</label>
                  <div className="relative">
                    <Calendar className="absolute left-3.5 top-3 h-4 w-4 text-slate-400" />
                    <input
                      type="date"
                      value={moveInDate}
                      onChange={(e) => setMoveInDate(e.target.value)}
                      className="w-full rounded-xl border border-slate-200 bg-white py-2.5 pl-10 pr-4 text-sm text-slate-800 outline-none transition focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100"
                    />
                  </div>
                </div>
              </div>

              {/* Room Preferences */}
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block">Preferred Room Types</label>
                <div className="flex flex-wrap gap-2">
                  {ROOM_TYPES.map((type) => {
                    const active = roomPreferences.includes(type.value)
                    return (
                      <button
                        type="button"
                        key={type.value}
                        onClick={() => handleToggleRoomPref(type.value)}
                        className={`rounded-xl border px-4 py-2.5 text-xs font-semibold transition cursor-pointer ${active ? 'bg-indigo-600 border-indigo-600 text-white shadow-sm' : 'bg-white border-slate-200 text-slate-600 hover:border-slate-300'}`}
                      >
                        {type.label}
                      </button>
                    )
                  })}
                </div>
              </div>

              {/* Lifestyle Preferences */}
              <div className="space-y-3">
                <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block">Lifestyle & Habits</label>
                
                {/* Common Clickable Tags */}
                <div className="flex flex-wrap gap-1.5">
                  {COMMON_LIFESTYLE_TAGS.map((tag) => {
                    const active = lifestylePreferences.includes(tag)
                    return (
                      <button
                        type="button"
                        key={tag}
                        onClick={() => handleToggleCommonTag(tag)}
                        className={`rounded-full px-3 py-1.5 text-xs font-semibold transition cursor-pointer border ${active ? 'bg-violet-50 text-violet-700 border-violet-200' : 'bg-white border-slate-200 text-slate-500 hover:border-slate-300'}`}
                      >
                        {active ? '✓ ' : ''}{tag}
                      </button>
                    )
                  })}
                </div>

                {/* Custom Tags */}
                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder="Add other lifestyle tag (e.g. Vegetarian)"
                    value={newLifestyleTag}
                    onChange={(e) => setNewLifestyleTag(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        handleAddCustomLifestyleTag(e)
                      }
                    }}
                    className="flex-1 rounded-xl border border-slate-200 bg-white py-2.5 px-4 text-sm text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100"
                  />
                  <button
                    type="button"
                    onClick={handleAddCustomLifestyleTag}
                    className="flex items-center justify-center rounded-xl bg-slate-900 hover:bg-indigo-600 px-4 text-white text-sm font-bold transition cursor-pointer"
                  >
                    Add
                  </button>
                </div>

                {/* Display Current Lifestyle Preferences */}
                {lifestylePreferences.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 pt-1">
                    {lifestylePreferences.map((tag, idx) => (
                      <span key={tag} className="inline-flex items-center gap-1 rounded-xl bg-slate-50 border border-slate-200 px-3 py-1 text-xs font-semibold text-slate-600">
                        {tag}
                        <button
                          type="button"
                          onClick={() => handleRemoveLifestyleTag(idx)}
                          className="text-slate-400 hover:text-slate-600 transition"
                        >
                          <X className="h-3 w-3" />
                        </button>
                      </span>
                    ))}
                  </div>
                )}
              </div>

              {/* Form Actions */}
              <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
                {profile && (
                  <button
                    type="button"
                    onClick={handleCancelEdit}
                    disabled={saving}
                    className="rounded-xl border border-slate-200 px-5 py-2.5 text-xs font-semibold text-slate-600 hover:bg-slate-50 transition disabled:opacity-50 cursor-pointer"
                  >
                    Cancel
                  </button>
                )}
                <button
                  type="submit"
                  disabled={saving}
                  className="flex items-center justify-center gap-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 px-5 py-2.5 text-xs font-bold text-white shadow-md shadow-indigo-100 transition disabled:opacity-50 cursor-pointer"
                >
                  {saving ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    <>
                      <Save className="h-4 w-4" />
                      Save Profile
                    </>
                  )}
                </button>
              </div>
            </form>
          ) : (
            /* View Mode Card */
            <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm space-y-6">
              {/* Header Info */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-slate-100 gap-2">
                <div>
                  <h2 className="text-lg font-bold text-slate-900" style={{ fontFamily: 'Outfit, sans-serif' }}>
                    {user?.name}'s Tenant Profile
                  </h2>
                  <p className="text-xs text-slate-400">Created: {new Date(profile.createdAt).toLocaleDateString('en-IN')}</p>
                </div>
                <div className="flex items-center gap-2">
                  <span className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-bold ${profile.isSearching ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-100 text-slate-500'}`}>
                    <span className={`h-2 w-2 rounded-full ${profile.isSearching ? 'bg-emerald-500' : 'bg-slate-400'}`} />
                    {profile.isSearching ? 'Actively Searching' : 'Search Paused'}
                  </span>
                </div>
              </div>

              {/* Bio */}
              {profile.bio ? (
                <div className="space-y-1.5">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">About Me</h4>
                  <p className="text-sm text-slate-700 leading-relaxed whitespace-pre-wrap">{profile.bio}</p>
                </div>
              ) : (
                <div className="rounded-xl bg-slate-50 p-4 border border-dashed border-slate-200 text-center text-xs text-slate-400">
                  You haven't written a bio yet. Describe yourself in edit mode to help listings match your lifestyle.
                </div>
              )}

              {/* Profile Details Grid */}
              <div className="grid gap-6 sm:grid-cols-2 pt-2 border-t border-slate-100">
                {/* Preferred Locations */}
                <div className="space-y-2">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                    <MapPin className="h-3.5 w-3.5 text-indigo-500" />
                    Preferred Locations
                  </h4>
                  <div className="flex flex-wrap gap-1">
                    {profile.preferredLocations?.map((loc) => (
                      <span key={loc} className="rounded-lg bg-indigo-50/50 border border-indigo-100/50 px-2.5 py-1 text-xs font-semibold text-indigo-700">
                        {loc}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Budget Range */}
                <div className="space-y-1.5">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">Monthly Budget Range</h4>
                  <div className="bg-slate-50 border border-slate-100 rounded-xl p-3.5">
                    <span className="text-lg font-extrabold text-indigo-600 block" style={{ fontFamily: 'Outfit, sans-serif' }}>
                      ₹{profile.budgetRange?.min?.toLocaleString()} - ₹{profile.budgetRange?.max?.toLocaleString()}
                    </span>
                    <span className="text-[10px] font-semibold text-slate-400 uppercase">INR / month</span>
                  </div>
                </div>

                {/* Move-in Date */}
                <div className="space-y-1.5">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                    <Calendar className="h-3.5 w-3.5 text-indigo-500" />
                    Move-in Date
                  </h4>
                  <p className="text-sm font-bold text-slate-800">
                    {new Date(profile.moveInDate).toLocaleDateString('en-IN', {
                      day: 'numeric',
                      month: 'long',
                      year: 'numeric',
                    })}
                  </p>
                </div>
              </div>

              {/* Room Preferences */}
              {profile.roomPreferences && profile.roomPreferences.length > 0 && (
                <div className="space-y-2 pt-4 border-t border-slate-100">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">Room Preferences</h4>
                  <div className="flex flex-wrap gap-1.5">
                    {profile.roomPreferences.map((r) => {
                      const found = ROOM_TYPES.find((t) => t.value === r)
                      return (
                        <span key={r} className="rounded-xl bg-violet-50 text-violet-700 border border-violet-100 px-3 py-1.5 text-xs font-semibold">
                          {found ? found.label : r}
                        </span>
                      )
                    })}
                  </div>
                </div>
              )}

              {/* Lifestyle Preferences */}
              {profile.lifestylePreferences && profile.lifestylePreferences.length > 0 && (
                <div className="space-y-2 pt-4 border-t border-slate-100">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">Lifestyle & Habits</h4>
                  <div className="flex flex-wrap gap-1.5">
                    {profile.lifestylePreferences.map((tag) => (
                      <span key={tag} className="rounded-full bg-slate-50 border border-slate-200 px-3 py-1 text-xs font-semibold text-slate-600">
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Dashboard Status / Meta Card (Right Column) */}
        <div className="space-y-6">
          {/* User Card */}
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm text-center">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-indigo-500 to-violet-500 text-xl font-bold text-white shadow-md shadow-indigo-100">
              {user?.name ? user.name.split(' ').map((n) => n[0]).join('').toUpperCase().slice(0, 2) : 'U'}
            </div>
            <h3 className="mt-4 text-md font-bold text-slate-800" style={{ fontFamily: 'Outfit, sans-serif' }}>
              {user?.name}
            </h3>
            <span className="mt-0.5 inline-block rounded bg-indigo-50 border border-indigo-100 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-indigo-700">
              {user?.role}
            </span>
            <p className="mt-2 text-xs text-slate-400">{user?.email}</p>
          </div>

          {/* AI Matching Info Card */}
          <div className="rounded-2xl border border-slate-100 bg-gradient-to-br from-indigo-50/50 via-slate-50 to-violet-50/30 p-5 shadow-sm space-y-4">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600 border border-indigo-100">
              <Sparkles className="h-5 w-5" strokeWidth={1.8} />
            </div>
            <div>
              <h4 className="text-xs font-bold uppercase tracking-widest text-slate-400">RoomSync Matching</h4>
              <p className="mt-1 text-sm font-bold text-slate-800" style={{ fontFamily: 'Outfit, sans-serif' }}>
                How it works
              </p>
              <p className="mt-1.5 text-xs text-slate-500 leading-relaxed">
                When you save your profile, our AI matching engine evaluates listings against your budget range, preferred locations, and target move-in dates.
              </p>
            </div>
            <div className="rounded-xl bg-white border border-slate-200/60 p-3 text-[11px] text-slate-500 flex items-start gap-2">
              <Info className="h-4 w-4 text-indigo-500 shrink-0 mt-0.5" />
              <div>
                Always keep your budget and locations up-to-date to get the best recommendations.
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default ProfilePage
