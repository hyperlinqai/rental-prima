const User = require('../models/User');

// @desc    Get all admins
// @route   GET /api/admins
// @access  Private/SuperAdmin
exports.getAdmins = async (req, res) => {
  try {
    const admins = await User.find({ role: 'admin' });

    res.status(200).json({
      success: true,
      count: admins.length,
      data: admins
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server Error',
      error: error.message
    });
  }
};

// @desc    Get single admin
// @route   GET /api/admins/:id
// @access  Private/SuperAdmin
exports.getAdmin = async (req, res) => {
  try {
    const admin = await User.findById(req.params.id);

    if (!admin) {
      return res.status(404).json({
        success: false,
        message: `Admin not found with id of ${req.params.id}`
      });
    }

    // Check if user is actually an admin
    if (admin.role !== 'admin') {
      return res.status(400).json({
        success: false,
        message: 'This user is not an admin'
      });
    }

    res.status(200).json({
      success: true,
      data: admin
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server Error',
      error: error.message
    });
  }
};

// @desc    Create admin
// @route   POST /api/admins
// @access  Private/SuperAdmin
exports.createAdmin = async (req, res) => {
  try {
    const { name, email, password, status, user_type } = req.body;

    // Check if user already exists
    const userExists = await User.findOne({ email });

    if (userExists) {
      return res.status(400).json({
        success: false,
        message: 'User already exists'
      });
    }

    // Create admin user
    const admin = await User.create({
      first_name: name, // Store full name in first_name field
      last_name: ' ', // Use space as placeholder for last_name
      email,
      password,
      status,
      // Map user types to allowed database roles
      // 'admin' role in DB can represent both super admin and owner users
      role: 'admin', // Always admin for this controller
      // Store the specific user type in the username field as a prefix
      username: `${user_type || 'super_admin'}_${email.split('@')[0]}`
    });

    res.status(201).json({
      success: true,
      data: admin
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server Error',
      error: error.message
    });
  }
};

// @desc    Update admin
// @route   PUT /api/admins/:id
// @access  Private/SuperAdmin
exports.updateAdmin = async (req, res) => {
  try {
    // Remove password from update if it exists
    if (req.body.password) {
      delete req.body.password;
    }

    // Prevent role change through this endpoint
    if (req.body.role && req.body.role !== 'admin') {
      return res.status(400).json({
        success: false,
        message: 'Cannot change role through this endpoint'
      });
    }

    // Ensure role stays as admin
    req.body.role = 'admin';

    const admin = await User.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    });

    if (!admin) {
      return res.status(404).json({
        success: false,
        message: `Admin not found with id of ${req.params.id}`
      });
    }

    res.status(200).json({
      success: true,
      data: admin
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server Error',
      error: error.message
    });
  }
};

// @desc    Delete admin
// @route   DELETE /api/admins/:id
// @access  Private/SuperAdmin
exports.deleteAdmin = async (req, res) => {
  try {
    const admin = await User.findById(req.params.id);

    if (!admin) {
      return res.status(404).json({
        success: false,
        message: `Admin not found with id of ${req.params.id}`
      });
    }

    // Check if user is actually an admin
    if (admin.role !== 'admin') {
      return res.status(400).json({
        success: false,
        message: 'This user is not an admin'
      });
    }

    await admin.deleteOne();

    res.status(200).json({
      success: true,
      data: {}
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server Error',
      error: error.message
    });
  }
};
