const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middlewares/auth');

// Mock controller functions since we haven't implemented them yet
const getCategories = (req, res) => {
  res.status(200).json({
    success: true,
    data: [
      {
        _id: '1',
        name: 'Apartments',
        description: 'Modern apartments for rent',
        icon: '🏢',
        status: 'active',
        listingsCount: 234,
        createdAt: '2023-01-10T10:30:00Z'
      },
      {
        _id: '2',
        name: 'Houses',
        description: 'Family houses for rent',
        icon: '🏠',
        status: 'active',
        listingsCount: 187,
        createdAt: '2023-01-15T14:45:00Z'
      },
      {
        _id: '3',
        name: 'Villas',
        description: 'Luxury villas for rent',
        icon: '🏘️',
        status: 'active',
        listingsCount: 56,
        createdAt: '2023-02-05T09:15:00Z'
      }
    ]
  });
};

const getCategory = (req, res) => {
  res.status(200).json({
    success: true,
    data: {
      _id: req.params.id,
      name: 'Apartments',
      description: 'Modern apartments for rent',
      icon: '🏢',
      status: 'active',
      listingsCount: 234,
      createdAt: '2023-01-10T10:30:00Z'
    }
  });
};

const createCategory = (req, res) => {
  res.status(201).json({
    success: true,
    data: {
      _id: Date.now().toString(),
      ...req.body,
      listingsCount: 0,
      createdAt: new Date().toISOString()
    }
  });
};

const updateCategory = (req, res) => {
  res.status(200).json({
    success: true,
    data: {
      _id: req.params.id,
      ...req.body,
      listingsCount: 0,
      createdAt: '2023-01-10T10:30:00Z'
    }
  });
};

const deleteCategory = (req, res) => {
  res.status(200).json({
    success: true,
    data: {}
  });
};

// Routes
router.route('/')
  .get(getCategories)
  .post(protect, authorize('admin', 'superadmin'), createCategory);

router.route('/:id')
  .get(getCategory)
  .put(protect, authorize('admin', 'superadmin'), updateCategory)
  .delete(protect, authorize('admin', 'superadmin'), deleteCategory);

module.exports = router;
