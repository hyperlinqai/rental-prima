const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middlewares/auth');
const {
  getListings,
  getListing,
  createListing,
  updateListing,
  deleteListing,
  getFeaturedListings
} = require('../controllers/listing.controller');

// Routes
router.route('/')
  .get(getListings)
  .post(protect, authorize('admin', 'superadmin'), createListing);

router.route('/featured')
  .get(getFeaturedListings);

router.route('/:id')
  .get(getListing)
  .put(protect, authorize('admin', 'superadmin'), updateListing)
  .delete(protect, authorize('admin', 'superadmin'), deleteListing);

module.exports = router;
