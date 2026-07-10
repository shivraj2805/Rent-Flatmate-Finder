const Listing = require('../models/Listing')
const { createListing, updateListing } = require('../services/listingService')

const validateListingPayload = (payload) => {
  const requiredFields = ['title', 'description', 'location', 'rent', 'availableFrom', 'roomType']
  const missingField = requiredFields.find((field) => !payload[field] || String(payload[field]).trim() === '')

  if (missingField) {
    return `${missingField} is required`
  }

  const rent = Number(payload.rent)
  if (Number.isNaN(rent) || rent < 0) {
    return 'Rent must be a valid positive number'
  }

  const availableDate = new Date(payload.availableFrom)
  if (Number.isNaN(availableDate.getTime())) {
    return 'Available date must be valid'
  }

  return ''
}

const ensureOwnerAccess = (listing, userId) => {
  return listing.owner.toString() === userId.toString()
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

    if (!ensureOwnerAccess(listing, req.user._id) && req.user.role !== 'admin') {
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

    if (req.body.title !== undefined || req.body.description !== undefined || req.body.location !== undefined || req.body.rent !== undefined || req.body.availableFrom !== undefined || req.body.roomType !== undefined) {
      const validationError = validateListingPayload({
        title: req.body.title ?? listing.title,
        description: req.body.description ?? listing.description,
        location: req.body.location ?? listing.location,
        rent: req.body.rent ?? listing.rent,
        availableFrom: req.body.availableFrom ?? listing.availableFrom,
        roomType: req.body.roomType ?? listing.roomType,
      })

      if (validationError) {
        res.status(400)
        throw new Error(validationError)
      }
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
  getMyListings,
  getListingById,
  createNewListing,
  updateExistingListing,
  deleteListing,
}