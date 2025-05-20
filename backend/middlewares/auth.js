const supabase = require('../config/supabase');

// Protect routes
exports.protect = async (req, res, next) => {
  let token;

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    // Set token from Bearer token in header
    token = req.headers.authorization.split(' ')[1];
  } else if (req.cookies?.token) {
    // Set token from cookie
    token = req.cookies.token;
  }

  // Make sure token exists
  if (!token) {
    return res.status(401).json({
      success: false,
      message: 'Not authorized to access this route'
    });
  }

  try {
    // Verify token with Supabase
    const { data: { user }, error } = await supabase.auth.getUser(token);

    if (error || !user) {
      return res.status(401).json({
        success: false,
        message: 'Not authorized to access this route'
      });
    }

    // Get user data from the users table
    const { data: userData, error: userError } = await supabase
      .from('users')
      .select('*')
      .eq('id', user.id)
      .single();

    if (userError) {
      return res.status(500).json({
        success: false,
        message: 'Error retrieving user data',
        error: userError.message
      });
    }

    // Add user data to request object
    req.user = userData;
    req.token = token;

    next();
  } catch (err) {
    return res.status(401).json({
      success: false,
      message: 'Not authorized to access this route',
      error: err.message
    });
  }
};

// Authorize access to specific user types (vendor, customer, admin)
exports.authorize = (...userTypes) => {
  return (req, res, next) => {
    if (!req.user || !userTypes.includes(req.user.user_type)) {
      return res.status(403).json({
        success: false,
        message: `User type ${req.user?.user_type || 'unknown'} is not authorized to access this route`
      });
    }
    next();
  };
};
