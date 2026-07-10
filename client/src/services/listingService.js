import api from './api'

const appendValue = (formData, key, value) => {
  if (value === undefined || value === null) {
    return
  }

  if (Array.isArray(value)) {
    if (key === 'images') {
      value.forEach((file) => formData.append('images', file))
      return
    }

    formData.append(key, JSON.stringify(value))
    return
  }

  if (typeof value === 'object' && !(value instanceof File)) {
    formData.append(key, JSON.stringify(value))
    return
  }

  formData.append(key, value)
}

const toFormData = (payload) => {
  const formData = new FormData()

  Object.entries(payload).forEach(([key, value]) => appendValue(formData, key, value))

  return formData
}

const getMyListings = async () => {
  const { data } = await api.get('/listings/my')
  return data
}

const getListingById = async (listingId) => {
  const { data } = await api.get(`/listings/${listingId}`)
  return data
}

const createListing = async (payload) => {
  const formData = toFormData(payload)
  const { data } = await api.post('/listings', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  })

  return data
}

const updateListing = async (listingId, payload) => {
  const formData = toFormData(payload)
  const { data } = await api.put(`/listings/${listingId}`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  })

  return data
}

const deleteListing = async (listingId) => {
  const { data } = await api.delete(`/listings/${listingId}`)
  return data
}

export default {
  getMyListings,
  getListingById,
  createListing,
  updateListing,
  deleteListing,
}