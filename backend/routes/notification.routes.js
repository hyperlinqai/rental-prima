const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middlewares/auth');

// Mock controller functions
const getNotifications = (req, res) => {
  res.status(200).json({
    success: true,
    data: [
      {
        _id: '1',
        title: 'New User Registration',
        message: 'A new user has registered on the platform',
        type: 'user',
        read: false,
        createdAt: '2023-05-10T10:30:00Z'
      },
      {
        _id: '2',
        title: 'New Listing Added',
        message: 'A new property listing has been added',
        type: 'listing',
        read: true,
        createdAt: '2023-05-09T14:45:00Z'
      },
      {
        _id: '3',
        title: 'Payment Received',
        message: 'A payment of $29.99 has been received from John Doe',
        type: 'payment',
        read: false,
        createdAt: '2023-05-08T09:15:00Z'
      }
    ]
  });
};

const getNotification = (req, res) => {
  res.status(200).json({
    success: true,
    data: {
      _id: req.params.id,
      title: 'New User Registration',
      message: 'A new user has registered on the platform',
      type: 'user',
      read: false,
      createdAt: '2023-05-10T10:30:00Z'
    }
  });
};

const markAsRead = (req, res) => {
  res.status(200).json({
    success: true,
    data: {
      _id: req.params.id,
      title: 'New User Registration',
      message: 'A new user has registered on the platform',
      type: 'user',
      read: true,
      createdAt: '2023-05-10T10:30:00Z'
    }
  });
};

const deleteNotification = (req, res) => {
  res.status(200).json({
    success: true,
    data: {}
  });
};

// Routes
router.route('/')
  .get(protect, authorize('admin', 'superadmin'), getNotifications);

router.route('/:id')
  .get(protect, authorize('admin', 'superadmin'), getNotification)
  .put(protect, authorize('admin', 'superadmin'), markAsRead)
  .delete(protect, authorize('admin', 'superadmin'), deleteNotification);

module.exports = router;
