const Listing = require('../models/Listing')
const { createListing, updateListing, deleteImageFromCloudinary } = require('../services/listingService')

const validateListingPayload = (payload, isUpdate = false) => {
  const requiredFields = ['title', 'description', 'location', 'rent', 'availableFrom', 'roomType']
  
  if (!isUpdate) {
    const missingField = requiredFields.find(
      (field) => payload[field] === undefined || payload[field] === null || String(payload[field]).trim() === ''
    )
    if (missingField) {
      return `${missingField.charAt(0).toUpperCase() + missingField.slice(1)} is required`
    }
  }

  if (payload.rent !== undefined) {
    const rent = Number(payload.rent)
    if (Number.isNaN(rent) || rent <= 0) {
      return 'Rent must be a valid positive number greater than 0'
    }
  }

  if (payload.availableFrom !== undefined) {
    const availableDate = new Date(payload.availableFrom)
    if (Number.isNaN(availableDate.getTime())) {
      return 'Available date must be valid'
    }
  }

  if (payload.roomType !== undefined) {
    const allowedTypes = ['private-room', 'shared-room', 'studio', 'apartment', 'other']
    if (!allowedTypes.includes(payload.roomType)) {
      return 'Invalid room type'
    }
  }

  return ''
}

const ensureOwnerAccess = (listing, userId) => {
  return listing.owner.toString() === userId.toString()
}

const getAllListings = async (req, res, next) => {
  try {
    const { location, maxRent, roomType } = req.query
    const query = { isActive: true, status: 'active' }

    if (location) {
      query.location = { $regex: location, $options: 'i' }
    }

    if (maxRent) {
      const rentLimit = Number(maxRent)
      if (!Number.isNaN(rentLimit)) {
        query.rent = { $lte: rentLimit }
      }
    }

    if (roomType) {
      query.roomType = roomType
    }

    const listings = await Listing.find(query).sort({ createdAt: -1 })

    res.json({
      success: true,
      count: listings.length,
      listings,
    })
  } catch (error) {
    next(error)
  }
}

const getMyListings = async (req, res, next) => {
  try {
    const listings = await Listing.find({ owner: req.user._id }).sort({ createdAt: -1 })

    res.json({
      success: true,
      count: listings.length,
      listings,
    })
  } catch (error) {
    next(error)
  }
}

const getListingById = async (req, res, next) => {
  try {
    const listing = await Listing.findById(req.params.id)

    if (!listing) {
      res.status(404)
      throw new Error('Listing not found')
    }

    // Active/filled listings are viewable by any authenticated user. Inactive listings are only viewable by owner/admin.
    if (!listing.isActive && !ensureOwnerAccess(listing, req.user._id) && req.user.role !== 'admin') {
      res.status(403)
      throw new Error('Not authorized to access this listing')
    }

    res.json({
      success: true,
      listing,
    })
  } catch (error) {
    next(error)
  }
}

const createNewListing = async (req, res, next) => {
  try {
    const validationError = validateListingPayload(req.body)

    if (validationError) {
      res.status(400)
      throw new Error(validationError)
    }

    if (!req.files || req.files.length === 0) {
      res.status(400)
      throw new Error('At least one image is required')
    }

    const listing = await createListing({
      ownerId: req.user._id,
      payload: req.body,
      files: req.files || [],
    })

    res.status(201).json({
      success: true,
      message: 'Listing created successfully',
      listing,
    })
  } catch (error) {
    next(error)
  }
}

const updateExistingListing = async (req, res, next) => {
  try {
    const listing = await Listing.findById(req.params.id)

    if (!listing) {
      res.status(404)
      throw new Error('Listing not found')
    }

    if (!ensureOwnerAccess(listing, req.user._id) && req.user.role !== 'admin') {
      res.status(403)
      throw new Error('Not authorized to update this listing')
    }

    const validationError = validateListingPayload(req.body, true)
    if (validationError) {
      res.status(400)
      throw new Error(validationError)
    }

    const updatedListing = await updateListing({
      listing,
      payload: req.body,
      files: req.files || [],
    })

    res.json({
      success: true,
      message: 'Listing updated successfully',
      listing: updatedListing,
    })
  } catch (error) {
    next(error)
  }
}

const updateListingStatus = async (req, res, next) => {
  try {
    const listing = await Listing.findById(req.params.id)

    if (!listing) {
      res.status(404)
      throw new Error('Listing not found')
    }

    if (!ensureOwnerAccess(listing, req.user._id) && req.user.role !== 'admin') {
      res.status(403)
      throw new Error('Not authorized to update this listing status')
    }

    const { status } = req.body
    if (!status || !['active', 'filled'].includes(status)) {
      res.status(400)
      throw new Error('Status must be either "active" or "filled"')
    }

    listing.status = status
    await listing.save()

    res.json({
      success: true,
      message: `Listing marked as ${status} successfully`,
      listing,
    })
  } catch (error) {
    next(error)
  }
}

const deleteListing = async (req, res, next) => {
  try {
    const listing = await Listing.findById(req.params.id)

    if (!listing) {
      res.status(404)
      throw new Error('Listing not found')
    }

    if (!ensureOwnerAccess(listing, req.user._id) && req.user.role !== 'admin') {
      res.status(403)
      throw new Error('Not authorized to delete this listing')
    }

    // Delete associated images from Cloudinary
    if (listing.images && listing.images.length > 0) {
      for (const imgUrl of listing.images) {
        await deleteImageFromCloudinary(imgUrl)
      }
    }

    await listing.deleteOne()

    res.json({
      success: true,
      message: 'Listing deleted successfully',
    })
  } catch (error) {
    next(error)
  }
}

module.exports = {
  getAllListings,
  getMyListings,
  getListingById,
  createNewListing,
  updateExistingListing,
  updateListingStatus,
  deleteListing,
}