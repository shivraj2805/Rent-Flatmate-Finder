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

const getPublicIdFromUrl = (url) => {
  try {
    if (!url || typeof url !== 'string') return null
    if (!url.includes('cloudinary.com')) return null

    const parts = url.split('/image/upload/')
    if (parts.length < 2) return null

    let path = parts[1]
    path = path.replace(/^v\d+\//, '')

    const dotIndex = path.lastIndexOf('.')
    if (dotIndex !== -1) {
      path = path.substring(0, dotIndex)
    }

    return path
  } catch (error) {
    console.error('Error parsing Cloudinary URL:', error)
    return null
  }
}

const deleteImageFromCloudinary = async (imageUrl) => {
  const publicId = getPublicIdFromUrl(imageUrl)
  if (publicId) {
    try {
      const { CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, CLOUDINARY_API_SECRET } = process.env
      if (!CLOUDINARY_CLOUD_NAME || !CLOUDINARY_API_KEY || !CLOUDINARY_API_SECRET) {
        console.log(`[Mock Cloudinary] Deleted image: ${publicId}`)
        return
      }
      await cloudinary.uploader.destroy(publicId)
      console.log(`[Cloudinary] Successfully deleted image: ${publicId}`)
    } catch (error) {
      console.error(`Failed to delete image ${publicId} from Cloudinary:`, error)
    }
  }
}

const uploadListingImages = async (files = []) => {
  if (!files.length) {
    return []
  }

  const { CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, CLOUDINARY_API_SECRET } = process.env
  if (!CLOUDINARY_CLOUD_NAME || !CLOUDINARY_API_KEY || !CLOUDINARY_API_SECRET) {
    console.warn('Warning: Cloudinary credentials missing. Falling back to mock URLs.')
    // Generate beautiful home placeholders
    const placeholders = [
      'https://images.unsplash.com/photo-1513694203232-719a280e022f?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1505691938895-1758d7feb511?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1502005229762-fc1b2b812ca5?auto=format&fit=crop&w=800&q=80',
    ]
    return files.map((file, i) => placeholders[i % placeholders.length])
  }

  const uploads = files.map((file) => uploadBufferToCloudinary(file.buffer, 'rent-flatmate-finder/listings'))
  const results = await Promise.all(uploads)

  return results.map((result) => result.secure_url)
}

const createListing = async ({ ownerId, payload, files }) => {
  const fileCount = files ? files.length : 0
  if (fileCount === 0) {
    throw new Error('At least one image is required')
  }

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
    status: 'active',
  })
}

const updateListing = async ({ listing, payload, files }) => {
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

  const newFilesCount = files ? files.length : 0
  if (preservedImages.length + newFilesCount < 1) {
    throw new Error('At least one image is required')
  }

  // Delete removed images from Cloudinary
  if (removeImages.length > 0) {
    for (const imgUrl of removeImages) {
      await deleteImageFromCloudinary(imgUrl)
    }
  }

  const newImageUrls = await uploadListingImages(files)

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
  deleteImageFromCloudinary,
}