const express = require('express')
const { getCompatibility, recalculateCompatibility } = require('../controllers/compatibilityController')
const { protect } = require('../middleware/authMiddleware')

const router = express.Router()

// All compatibility endpoints are protected
router.use(protect)

router.get('/:listingId', getCompatibility)
router.post('/recalculate', recalculateCompatibility)

module.exports = router
