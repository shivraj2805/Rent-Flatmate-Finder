import { useEffect, useMemo, useState } from 'react'

const defaultForm = {
  title: '',
  description: '',
  location: '',
  rent: '',
  availableFrom: '',
  roomType: 'private-room',
  genderPreference: 'any',
  furnished: false,
  amenities: '',
  isActive: true,
}

const ListingForm = ({ initialValues = defaultForm, submitting, onSubmit, submitLabel }) => {
  const [form, setForm] = useState(initialValues)
  const [selectedFiles, setSelectedFiles] = useState([])

  useEffect(() => {
    setForm(initialValues)
  }, [initialValues])

  const filePreviewUrls = useMemo(() => selectedFiles.map((file) => URL.createObjectURL(file)), [selectedFiles])

  useEffect(() => {
    return () => {
      filePreviewUrls.forEach((url) => URL.revokeObjectURL(url))
    }
  }, [filePreviewUrls])

  const handleChange = (event) => {
    const { name, value, type, checked } = event.target
    setForm((current) => ({
      ...current,
      [name]: type === 'checkbox' ? checked : value,
    }))
  }

  const handleFileChange = (event) => {
    setSelectedFiles(Array.from(event.target.files || []))
  }

  const handleSubmit = (event) => {
    event.preventDefault()
    onSubmit({
      ...form,
      images: selectedFiles,
    })
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5 rounded-[2rem] border border-white/10 bg-white/5 p-6">
      <div className="grid gap-5 md:grid-cols-2">
        <label className="block space-y-2 md:col-span-2">
          <span className="text-sm font-medium text-slate-300">Title</span>
          <input
            name="title"
            value={form.title}
            onChange={handleChange}
            required
            className="w-full rounded-2xl border border-white/10 bg-slate-900/70 px-4 py-3 text-slate-100 outline-none"
          />
        </label>

        <label className="block space-y-2 md:col-span-2">
          <span className="text-sm font-medium text-slate-300">Description</span>
          <textarea
            name="description"
            value={form.description}
            onChange={handleChange}
            required
            rows={5}
            className="w-full rounded-2xl border border-white/10 bg-slate-900/70 px-4 py-3 text-slate-100 outline-none"
          />
        </label>

        <label className="block space-y-2">
          <span className="text-sm font-medium text-slate-300">Location</span>
          <input
            name="location"
            value={form.location}
            onChange={handleChange}
            required
            className="w-full rounded-2xl border border-white/10 bg-slate-900/70 px-4 py-3 text-slate-100 outline-none"
          />
        </label>

        <label className="block space-y-2">
          <span className="text-sm font-medium text-slate-300">Rent</span>
          <input
            type="number"
            name="rent"
            value={form.rent}
            onChange={handleChange}
            required
            min="0"
            className="w-full rounded-2xl border border-white/10 bg-slate-900/70 px-4 py-3 text-slate-100 outline-none"
          />
        </label>

        <label className="block space-y-2">
          <span className="text-sm font-medium text-slate-300">Available From</span>
          <input
            type="date"
            name="availableFrom"
            value={form.availableFrom}
            onChange={handleChange}
            required
            className="w-full rounded-2xl border border-white/10 bg-slate-900/70 px-4 py-3 text-slate-100 outline-none"
          />
        </label>

        <label className="block space-y-2">
          <span className="text-sm font-medium text-slate-300">Room Type</span>
          <select
            name="roomType"
            value={form.roomType}
            onChange={handleChange}
            className="w-full rounded-2xl border border-white/10 bg-slate-900/70 px-4 py-3 text-slate-100 outline-none"
          >
            <option value="private-room">Private Room</option>
            <option value="shared-room">Shared Room</option>
            <option value="studio">Studio</option>
            <option value="apartment">Apartment</option>
            <option value="other">Other</option>
          </select>
        </label>

        <label className="block space-y-2">
          <span className="text-sm font-medium text-slate-300">Gender Preference</span>
          <select
            name="genderPreference"
            value={form.genderPreference}
            onChange={handleChange}
            className="w-full rounded-2xl border border-white/10 bg-slate-900/70 px-4 py-3 text-slate-100 outline-none"
          >
            <option value="any">Any</option>
            <option value="male">Male</option>
            <option value="female">Female</option>
            <option value="non-binary">Non-binary</option>
            <option value="couple">Couple</option>
          </select>
        </label>

        <label className="block space-y-2 md:col-span-2">
          <span className="text-sm font-medium text-slate-300">Amenities</span>
          <input
            name="amenities"
            value={form.amenities}
            onChange={handleChange}
            placeholder="WiFi, parking, AC"
            className="w-full rounded-2xl border border-white/10 bg-slate-900/70 px-4 py-3 text-slate-100 outline-none"
          />
        </label>

        <label className="block space-y-2">
          <span className="text-sm font-medium text-slate-300">Images</span>
          <input
            type="file"
            accept="image/*"
            multiple
            onChange={handleFileChange}
            className="w-full rounded-2xl border border-white/10 bg-slate-900/70 px-4 py-3 text-slate-100 outline-none"
          />
        </label>

        <label className="flex items-center gap-3 pt-8 text-sm font-medium text-slate-300">
          <input type="checkbox" name="furnished" checked={Boolean(form.furnished)} onChange={handleChange} />
          Furnished
        </label>

        <label className="flex items-center gap-3 text-sm font-medium text-slate-300">
          <input type="checkbox" name="isActive" checked={Boolean(form.isActive)} onChange={handleChange} />
          Active
        </label>
      </div>

      {filePreviewUrls.length > 0 && (
        <div className="grid gap-3 sm:grid-cols-3">
          {filePreviewUrls.map((url) => (
            <img key={url} src={url} alt="Preview" className="h-32 w-full rounded-2xl object-cover" />
          ))}
        </div>
      )}

      <button
        type="submit"
        disabled={submitting}
        className="rounded-2xl bg-emerald-400 px-5 py-3 font-semibold text-slate-950 transition hover:bg-emerald-300 disabled:opacity-70"
      >
        {submitting ? 'Saving...' : submitLabel}
      </button>
    </form>
  )
}

export default ListingForm