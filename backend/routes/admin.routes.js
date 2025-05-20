const express = require('express');
const {
  getAdmins,
  getAdmin,
  createAdmin,
  updateAdmin,
  deleteAdmin
} = require('../controllers/admin.controller');
const { protect, authorize } = require('../middlewares/auth');

const router = express.Router();

// Apply protection to all routes
router.use(protect);
// Apply authorization to all routes (only superadmin can access)
router.use(authorize('superadmin'));

router.route('/')
  .get(getAdmins)
  .post(createAdmin);

router.route('/:id')
  .get(getAdmin)
  .put(updateAdmin)
  .delete(deleteAdmin);

module.exports = router;
