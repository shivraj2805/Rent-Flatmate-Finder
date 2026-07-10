const stream = require('stream')
const Listing = require('../models/Listing')
const { cloudinary } = require('../config/cloudinary')

const parseListField = (value) => {
  if (!value) {
    return []
  }

  if (Array.isArray(value)) {
    return value.map((item) => String(item).trim()).filter(Boolean)
  }

  try {
    const parsed = JSON.parse(value)

    if (Array.isArray(parsed)) {
      return parsed.map((item) => String(item).trim()).filter(Boolean)
    }
  } catch (error) {
    void error
  }

  return String(value)
    .split(',')
    .map((item) => item.trim())
    .filter(Boolean)
}

const uploadBufferToCloudinary = (buffer, folder) => {
  return new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      {
        folder,
        resource_type: 'image',
      },
      (error, result) => {
        if (error) {
          reject(error)
          return
        }

        resolve(result)
      },
    )

    const bufferStream = new stream.PassThrough()
    bufferStream.end(buffer)
    bufferStream.pipe(uploadStream)
  })
}

const uploadListingImages = async (files = []) => {
  if (!files.length) {
    return []
  }

  const uploads = files.map((file) => uploadBufferToCloudinary(file.buffer, 'rent-flatmate-finder/listings'))
  const results = await Promise.all(uploads)

  return results.map((result) => result.secure_url)
}

const createListing = async ({ ownerId, payload, files }) => {
  const imageUrls = await uploadListingImages(files)
  const amenities = parseListField(payload.amenities)

  return Listing.create({
    owner: ownerId,
    title: payload.title?.trim(),
    description: payload.description?.trim(),
    location: payload.location?.trim(),
    rent: Number(payload.rent),
    availableFrom: payload.availableFrom,
    roomType: payload.roomType,
    genderPreference: payload.genderPreference || 'any',
    furnished: payload.furnished === 'true' || payload.furnished === true,
    amenities,
    images: imageUrls,
    isActive: payload.isActive === undefined ? true : payload.isActive === 'true' || payload.isActive === true,
  })
}

const updateListing = async ({ listing, payload, files }) => {
  const newImageUrls = await uploadListingImages(files)
  const existingImages = parseListField(payload.existingImages)
  const removeImages = parseListField(payload.removeImages)
  const currentImages = Array.isArray(listing.images) ? listing.images : []

  const preservedImages = currentImages.filter((imageUrl) => {
    if (removeImages.includes(imageUrl)) {
      return false
    }

    if (existingImages.length > 0) {
      return existingImages.includes(imageUrl)
    }

    return true
  })

  listing.title = payload.title?.trim() ?? listing.title
  listing.description = payload.description?.trim() ?? listing.description
  listing.location = payload.location?.trim() ?? listing.location
  listing.rent = payload.rent !== undefined ? Number(payload.rent) : listing.rent
  listing.availableFrom = payload.availableFrom ?? listing.availableFrom
  listing.roomType = payload.roomType ?? listing.roomType
  listing.genderPreference = payload.genderPreference ?? listing.genderPreference
  listing.furnished = payload.furnished !== undefined ? payload.furnished === 'true' || payload.furnished === true : listing.furnished
  listing.amenities = payload.amenities !== undefined ? parseListField(payload.amenities) : listing.amenities
  listing.images = [...preservedImages, ...newImageUrls]
  listing.isActive = payload.isActive !== undefined ? payload.isActive === 'true' || payload.isActive === true : listing.isActive

  return listing.save()
}

module.exports = {
  createListing,
  updateListing,
  parseListField,
}