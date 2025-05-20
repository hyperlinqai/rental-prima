const jwt = require('jsonwebtoken');
const config = require('../config/config');
const supabase = require('../config/supabase');

/**
 * Authentication middleware
 */

// Middleware to authenticate JWT token
exports.authenticateToken = async (req, res, next) => {
  try {
    // Get token from header
    const authHeader = req.headers.authorization;
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'Access denied. No token provided.'
      });
    }

    // First try to verify with Supabase
    try {
      const { data: { user }, error } = await supabase.auth.getUser(token);
      
      if (error) {
        throw error;
      }
      
      if (user) {
        req.user = user;
        return next();
      }
    } catch (supabaseError) {
      console.warn('Supabase token verification failed, trying JWT:', supabaseError);
      
      // If Supabase fails, try JWT verification
      try {
        const decoded = jwt.verify(token, config.jwtSecret);
        req.user = decoded;
        return next();
      } catch (jwtError) {
        console.error('JWT verification failed:', jwtError);
        return res.status(401).json({
          success: false,
          message: 'Invalid token.'
        });
      }
    }
  } catch (error) {
    console.error('Auth middleware error:', error);
    return res.status(500).json({
      success: false,
      message: 'Server Error'
    });
  }
};

// Middleware to authorize admin access
exports.authorizeAdmin = (req, res, next) => {
  try {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'User not authenticated'
      });
    }

    // Check if user has admin role
    const userRole = req.user.role || req.user.user_metadata?.role;
    
    if (userRole === 'admin' || userRole === 'super_admin') {
      return next();
    }
    
    return res.status(403).json({
      success: false,
      message: 'Access denied. Admin privileges required.'
    });
  } catch (error) {
    console.error('Admin authorization error:', error);
    return res.status(500).json({
      success: false,
      message: 'Server Error'
    });
  }
};

// Middleware to authorize super admin access
exports.authorizeSuperAdmin = (req, res, next) => {
  try {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'User not authenticated'
      });
    }

    // Check if user has super admin role
    const userRole = req.user.role || req.user.user_metadata?.role;
    
    if (userRole === 'super_admin') {
      return next();
    }
    
    return res.status(403).json({
      success: false,
      message: 'Access denied. Super admin privileges required.'
    });
  } catch (error) {
    console.error('Super admin authorization error:', error);
    return res.status(500).json({
      success: false,
      message: 'Server Error'
    });
  }
};
