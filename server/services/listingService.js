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

const deleteImageFromCloudinary = async (publicId) => {
  if (publicId) {
    try {
      const { CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, CLOUDINARY_API_SECRET } = process.env
      if (!CLOUDINARY_CLOUD_NAME || !CLOUDINARY_API_KEY || !CLOUDINARY_API_SECRET) {
        console.warn('Cloudinary not configured. Cannot delete image.')
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
    throw new Error('Cloudinary environment variables (CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, CLOUDINARY_API_SECRET) are missing on the server.')
  }

  const uploads = files.map((file) => uploadBufferToCloudinary(file.buffer, 'rent-flatmate-finder/listings'))
  const results = await Promise.all(uploads)

  return results.map((result) => ({
    url: result.secure_url,
    publicId: result.public_id,
  }))
}

const createListing = async ({ ownerId, payload, files }) => {
  const fileCount = files ? files.length : 0
  if (fileCount === 0) {
    throw new Error('At least one image is required')
  }

  const imageObjects = await uploadListingImages(files)
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
    images: imageObjects,
    isActive: payload.isActive === undefined ? true : payload.isActive === 'true' || payload.isActive === true,
    status: 'active',
  })
}

const updateListing = async ({ listing, payload, files }) => {
  const existingImages = parseListField(payload.existingImages)
  const removeImages = parseListField(payload.removeImages)
  const currentImages = Array.isArray(listing.images) ? listing.images : []

  const preservedImages = currentImages.filter((img) => {
    if (removeImages.includes(img.publicId) || removeImages.includes(img.url)) {
      return false
    }

    if (existingImages.length > 0) {
      return existingImages.includes(img.publicId) || existingImages.includes(img.url)
    }

    return true
  })

  const newFilesCount = files ? files.length : 0
  if (preservedImages.length + newFilesCount < 1) {
    throw new Error('At least one image is required')
  }

  // Delete removed images from Cloudinary
  const imagesToDestroy = currentImages.filter((img) => !preservedImages.some((p) => p.publicId === img.publicId))
  for (const img of imagesToDestroy) {
    await deleteImageFromCloudinary(img.publicId)
  }

  const newImageObjects = await uploadListingImages(files)

  listing.title = payload.title?.trim() ?? listing.title
  listing.description = payload.description?.trim() ?? listing.description
  listing.location = payload.location?.trim() ?? listing.location
  listing.rent = payload.rent !== undefined ? Number(payload.rent) : listing.rent
  listing.availableFrom = payload.availableFrom ?? listing.availableFrom
  listing.roomType = payload.roomType ?? listing.roomType
  listing.genderPreference = payload.genderPreference ?? listing.genderPreference
  listing.furnished = payload.furnished !== undefined ? payload.furnished === 'true' || payload.furnished === true : listing.furnished
  listing.amenities = payload.amenities !== undefined ? parseListField(payload.amenities) : listing.amenities
  listing.images = [...preservedImages, ...newImageObjects]
  listing.isActive = payload.isActive !== undefined ? payload.isActive === 'true' || payload.isActive === true : listing.isActive

  return listing.save()
}

/**
 * Delete a listing and cascade clean up associated Compatibility, Interest, Chat, and Message records
 */
const deleteListingById = async (listingId) => {
  const Compatibility = require('../models/Compatibility')
  const Interest = require('../models/Interest')
  const Chat = require('../models/Chat')
  const Message = require('../models/Message')

  const listing = await Listing.findById(listingId)
  if (!listing) {
    const error = new Error('Listing not found')
    error.statusCode = 404
    throw error
  }

  // 1. Delete associated images from Cloudinary
  if (Array.isArray(listing.images)) {
    for (const image of listing.images) {
      if (image.publicId) {
        await deleteImageFromCloudinary(image.publicId)
      }
    }
  }

  // 2. Cascade delete Compatibility records
  await Compatibility.deleteMany({
    $or: [{ listing: listingId }, { listingId }]
  })

  // 3. Cascade delete Interest requests
  await Interest.deleteMany({ listing: listingId })

  // 4. Cascade delete Chats and Message records
  const chats = await Chat.find({ listing: listingId })
  for (const chat of chats) {
    await Message.deleteMany({
      $or: [{ chat: chat._id }, { chatId: chat._id }]
    })
    await chat.deleteOne()
  }

  // 5. Delete listing
  await listing.deleteOne()

  return { success: true }
}

module.exports = {
  createListing,
  updateListing,
  parseListField,
  deleteImageFromCloudinary,
  deleteListingById,
}