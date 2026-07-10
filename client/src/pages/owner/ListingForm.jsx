import { useEffect, useMemo, useState } from 'react'
import { X, Upload } from 'lucide-react'

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

const inputCls =
  'w-full rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100'

const labelCls = 'block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5'

const Field = ({ label, children, span2 = false }) => (
  <div className={span2 ? 'md:col-span-2' : ''}>
    <label className={labelCls}>{label}</label>
    {children}
  </div>
)

const ListingForm = ({ initialValues = defaultForm, submitting, onSubmit, submitLabel }) => {
  const [form, setForm] = useState(initialValues)
  const [selectedFiles, setSelectedFiles] = useState([])
  const [dragOver, setDragOver] = useState(false)
  const [existingImages, setExistingImages] = useState(initialValues.images || [])
  const [removeImages, setRemoveImages] = useState([])
  const [errorMsg, setErrorMsg] = useState('')

  useEffect(() => {
    setForm(initialValues)
    if (initialValues.images) {
      setExistingImages(initialValues.images)
    }
  }, [initialValues])

  const filePreviewUrls = useMemo(
    () => selectedFiles.map((file) => URL.createObjectURL(file)),
    [selectedFiles],
  )

  useEffect(() => {
    return () => {
      filePreviewUrls.forEach((url) => URL.revokeObjectURL(url))
    }
  }, [filePreviewUrls])

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target
    setForm((c) => ({ ...c, [name]: type === 'checkbox' ? checked : value }))
  }

  const addFiles = (fileList) => {
    const newFiles = Array.from(fileList)
    setSelectedFiles((prev) => [...prev, ...newFiles].slice(0, 10))
  }

  const removeExistingImage = (imgObj) => {
    setExistingImages((prev) => prev.filter((img) => img.publicId !== imgObj.publicId))
    setRemoveImages((prev) => [...prev, imgObj.publicId])
  }

  const handleDrop = (e) => {
    e.preventDefault()
    setDragOver(false)
    addFiles(e.dataTransfer.files)
  }

  const removeFile = (index) => {
    setSelectedFiles((prev) => prev.filter((_, i) => i !== index))
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    setErrorMsg('')

    if (Number(form.rent) <= 0) {
      setErrorMsg('Rent must be a positive number greater than 0')
      return
    }

    if (existingImages.length + selectedFiles.length === 0) {
      setErrorMsg('At least one image is required')
      return
    }

    onSubmit({
      ...form,
      images: selectedFiles,
      existingImages: existingImages.map((img) => img.url),
      removeImages,
    })
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Basic Info */}
      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <h2 className="mb-5 text-sm font-bold text-slate-700">Basic Information</h2>
        <div className="grid gap-5 md:grid-cols-2">
          <Field label="Listing Title" span2>
            <input
              name="title"
              value={form.title}
              onChange={handleChange}
              required
              placeholder="e.g. Spacious private room in Koregaon Park"
              className={inputCls}
            />
          </Field>

          <Field label="Description" span2>
            <textarea
              name="description"
              value={form.description}
              onChange={handleChange}
              required
              rows={4}
              placeholder="Describe the room, house rules, nearby amenities..."
              className={inputCls}
            />
          </Field>

          <Field label="Location / Area">
            <input
              name="location"
              value={form.location}
              onChange={handleChange}
              required
              placeholder="e.g. Koregaon Park, Pune"
              className={inputCls}
            />
          </Field>

          <Field label="Monthly Rent (₹)">
            <input
              type="number"
              name="rent"
              value={form.rent}
              onChange={handleChange}
              required
              min="0"
              placeholder="e.g. 12000"
              className={inputCls}
            />
          </Field>

          <Field label="Available From">
            <input
              type="date"
              name="availableFrom"
              value={form.availableFrom}
              onChange={handleChange}
              required
              className={inputCls}
            />
          </Field>

          <Field label="Room Type">
            <select name="roomType" value={form.roomType} onChange={handleChange} className={inputCls}>
              <option value="private-room">Private Room</option>
              <option value="shared-room">Shared Room</option>
              <option value="studio">Studio</option>
              <option value="apartment">Apartment</option>
              <option value="other">Other</option>
            </select>
          </Field>

          <Field label="Gender Preference">
            <select name="genderPreference" value={form.genderPreference} onChange={handleChange} className={inputCls}>
              <option value="any">Any</option>
              <option value="male">Male</option>
              <option value="female">Female</option>
              <option value="non-binary">Non-binary</option>
              <option value="couple">Couple</option>
            </select>
          </Field>

          <Field label="Amenities" span2>
            <input
              name="amenities"
              value={form.amenities}
              onChange={handleChange}
              placeholder="e.g. WiFi, Parking, AC, Geyser (comma-separated)"
              className={inputCls}
            />
          </Field>
        </div>

        {/* Toggles */}
        <div className="mt-5 flex flex-wrap gap-4">
          <label className="flex cursor-pointer items-center gap-3">
            <div className="relative">
              <input
                type="checkbox"
                name="furnished"
                checked={Boolean(form.furnished)}
                onChange={handleChange}
                className="sr-only"
              />
              <div
                className={`h-6 w-11 rounded-full transition-colors ${
                  form.furnished ? 'bg-indigo-600' : 'bg-slate-200'
                }`}
              />
              <div
                className={`absolute left-0.5 top-0.5 h-5 w-5 rounded-full bg-white shadow transition-transform ${
                  form.furnished ? 'translate-x-5' : ''
                }`}
              />
            </div>
            <span className="text-sm font-medium text-slate-700">Furnished</span>
          </label>

          <label className="flex cursor-pointer items-center gap-3">
            <div className="relative">
              <input
                type="checkbox"
                name="isActive"
                checked={Boolean(form.isActive)}
                onChange={handleChange}
                className="sr-only"
              />
              <div
                className={`h-6 w-11 rounded-full transition-colors ${
                  form.isActive ? 'bg-emerald-500' : 'bg-slate-200'
                }`}
              />
              <div
                className={`absolute left-0.5 top-0.5 h-5 w-5 rounded-full bg-white shadow transition-transform ${
                  form.isActive ? 'translate-x-5' : ''
                }`}
              />
            </div>
            <span className="text-sm font-medium text-slate-700">
              Active{' '}
              <span className="text-xs text-slate-400">(visible to tenants)</span>
            </span>
          </label>
        </div>
      </div>

      {/* Image Upload */}
      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <h2 className="mb-1 text-sm font-bold text-slate-700">Photos</h2>
        <p className="mb-4 text-xs text-slate-400">Upload up to 10 images. First image will be the cover photo.</p>

        {/* Drop zone */}
        <div
          onDragOver={(e) => { e.preventDefault(); setDragOver(true) }}
          onDragLeave={() => setDragOver(false)}
          onDrop={handleDrop}
          className={`flex flex-col items-center justify-center rounded-xl border-2 border-dashed py-10 text-center transition-colors ${
            dragOver ? 'border-indigo-400 bg-indigo-50' : 'border-slate-200 bg-slate-50 hover:border-indigo-300'
          }`}
        >
          <Upload className="mx-auto h-8 w-8 text-slate-400" strokeWidth={1.5} />
          <p className="mt-3 text-sm font-semibold text-slate-600">Drag & drop images here</p>
          <p className="mt-1 text-xs text-slate-400">or</p>
          <label className="mt-3 cursor-pointer rounded-xl border border-indigo-200 bg-white px-4 py-2 text-xs font-semibold text-indigo-600 shadow-sm transition hover:bg-indigo-50">
            Browse Files
            <input
              type="file"
              accept="image/*"
              multiple
              onChange={(e) => addFiles(e.target.files)}
              className="sr-only"
            />
          </label>
          <p className="mt-2 text-[10px] text-slate-400">PNG, JPG, WEBP up to 5 MB each</p>
        </div>        {/* Previews */}
        {(existingImages.length > 0 || filePreviewUrls.length > 0) && (
          <div className="mt-4 grid grid-cols-3 gap-3 sm:grid-cols-5">
            {existingImages.map((img, i) => (
              <div key={img.url || i} className="group relative">
                <img src={img.url} alt="Existing" className="h-20 w-full rounded-xl object-cover ring-2 ring-transparent group-hover:ring-indigo-200" />
                {i === 0 && (
                  <span className="absolute bottom-1 left-1 rounded bg-indigo-600 px-1.5 py-0.5 text-[8px] font-bold text-white">
                    COVER
                  </span>
                )}
                <button
                  type="button"
                  onClick={() => removeExistingImage(img)}
                  className="absolute right-1 top-1 flex h-5 w-5 items-center justify-center rounded-full bg-rose-500 text-white opacity-0 shadow transition group-hover:opacity-100"
                >
                  <X className="h-3 w-3" />
                </button>
              </div>
            ))}
            {filePreviewUrls.map((url, i) => {
              const globalIndex = existingImages.length + i
              return (
                <div key={url} className="group relative">
                  <img src={url} alt="Preview" className="h-20 w-full rounded-xl object-cover ring-2 ring-transparent group-hover:ring-indigo-200" />
                  {globalIndex === 0 && (
                    <span className="absolute bottom-1 left-1 rounded bg-indigo-600 px-1.5 py-0.5 text-[8px] font-bold text-white">
                      COVER
                    </span>
                  )}
                  <button
                    type="button"
                    onClick={() => removeFile(i)}
                    className="absolute right-1 top-1 flex h-5 w-5 items-center justify-center rounded-full bg-rose-500 text-white opacity-0 shadow transition group-hover:opacity-100"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </div>
              )
            })}
          </div>
        )}
      </div>

      {/* Error display */}
      {errorMsg && (
        <div className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
          ⚠️ {errorMsg}
        </div>
      )}

      {/* Submit */}
      <div className="flex items-center justify-end gap-3">
        <button
          type="submit"
          disabled={submitting}
          className="flex items-center gap-2 rounded-xl bg-indigo-600 px-6 py-3 text-sm font-bold text-white shadow-md shadow-indigo-200 transition-all hover:bg-indigo-50 hover:scale-[1.02] disabled:cursor-not-allowed disabled:opacity-60"
        >
          {submitting ? (
            <>
              <svg className="h-4 w-4 animate-spin" viewBox="0 0 24 24" fill="none">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
              </svg>
              Saving…
            </>
          ) : (
            submitLabel || 'Save Listing'
          )}
        </button>
      </div>
    </form>
  )
}

export default ListingForm