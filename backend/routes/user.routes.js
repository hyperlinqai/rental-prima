const express = require('express');
const {
  getUsers,
  getUser,
  createUser,
  updateUser,
  deleteUser
} = require('../controllers/user.controller');
const { protect, authorize } = require('../middlewares/auth');

const router = express.Router();

// Apply protection to all routes
router.use(protect);
// Apply authorization to all routes (only admin and superadmin can access)
router.use(authorize('admin', 'superadmin'));

router.route('/')
  .get(getUsers)
  .post(createUser);

router.route('/:id')
  .get(getUser)
  .put(updateUser)
  .delete(deleteUser);

module.exports = router;
