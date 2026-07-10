const express = require('express')
const {
  getMyListings,
  getListingById,
  createNewListing,
  updateExistingListing,
  deleteListing,
} = require('../controllers/listingController')
const { protect, authorizeRoles } = require('../middleware/authMiddleware')
const upload = require('../middleware/uploadMiddleware')

const router = express.Router()

router.get('/my', protect, authorizeRoles('owner', 'admin'), getMyListings)
router.get('/:id', protect, authorizeRoles('owner', 'admin'), getListingById)
router.post('/', protect, authorizeRoles('owner', 'admin'), upload.array('images', 10), createNewListing)
router.put('/:id', protect, authorizeRoles('owner', 'admin'), upload.array('images', 10), updateExistingListing)
router.delete('/:id', protect, authorizeRoles('owner', 'admin'), deleteListing)

module.exports = router