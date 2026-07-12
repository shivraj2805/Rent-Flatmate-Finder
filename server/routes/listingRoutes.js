const express = require('express')
const {
  getAllListings,
  getMyListings,
  getListingById,
  createNewListing,
  updateExistingListing,
  updateListingStatus,
  deleteListing,
} = require('../controllers/listingController')
const { protect, authorizeRoles } = require('../middleware/authMiddleware')
const upload = require('../middleware/uploadMiddleware')
const validateRequest = require('../middleware/validationMiddleware')
const { createListingSchema, updateListingSchema } = require('../validators/listingValidators')

const router = express.Router()

router.get('/', protect, getAllListings)
router.get('/my', protect, authorizeRoles('owner', 'admin'), getMyListings)
router.get('/:id', protect, getListingById)

router.post(
  '/',
  protect,
  authorizeRoles('owner', 'admin'),
  upload.array('images', 10),
  validateRequest({ body: createListingSchema }),
  createNewListing
)

router.put(
  '/:id',
  protect,
  authorizeRoles('owner', 'admin'),
  upload.array('images', 10),
  validateRequest({ body: updateListingSchema }),
  updateExistingListing
)

router.patch('/:id/status', protect, authorizeRoles('owner', 'admin'), updateListingStatus)
router.delete('/:id', protect, authorizeRoles('owner', 'admin'), deleteListing)

module.exports = router