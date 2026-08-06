const jwt = require('jsonwebtoken');
const { pool } = require('../config/database');

// Verify JWT token
const verifyToken = async (req, res, next) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');

    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'Access denied. No token provided.'
      });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Check if user still exists and is active
    const [users] = await pool.execute(
      'SELECT id, email, first_name, last_name, phone, user_type, host_id, is_active FROM users WHERE id = ? AND is_active = 1',
      [decoded.userId]
    );

    if (users.length === 0) {
      return res.status(401).json({
        success: false,
        message: 'Invalid token. User not found or inactive.'
      });
    }

    req.user = users[0];
    next();
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({
        success: false,
        message: 'Token expired. Please login again.'
      });
    }

    return res.status(401).json({
      success: false,
      message: 'Invalid token.'
    });
  }
};

// Check if user is admin
const requireAdmin = (req, res, next) => {
  if (req.user.user_type !== 'admin') {
    return res.status(403).json({
      success: false,
      message: 'Access denied. Admin privileges required.'
    });
  }
  next();
};

// Check if user is property owner
const requirePropertyOwner = async (req, res, next) => {
  if (req.user.user_type !== 'property_owner' && req.user.user_type !== 'staff') {
    return res.status(403).json({
      success: false,
      message: 'Access denied. Property owner or staff privileges required.'
    });
  }

  // Map staff's user ID to host_id for HMS/PMS owner-scoped operations
  if (req.user.user_type === 'staff') {
    req.user.employee_user_id = req.user.id;
    req.user.id = req.user.host_id;
  } else {
    // Self-heal missing property owner records automatically
    try {
      await pool.execute(
        `INSERT INTO property_owners (user_id, created_at) 
         SELECT ?, NOW() 
         FROM DUAL 
         WHERE NOT EXISTS (
           SELECT 1 FROM property_owners WHERE user_id = ?
         )`,
        [req.user.id, req.user.id]
      );
    } catch (err) {
      console.error('Error ensuring property_owner profile exists:', err);
    }
  }

  next();
};

// Check if user is guest
const requireGuest = (req, res, next) => {
  if (req.user.user_type !== 'guest') {
    return res.status(403).json({
      success: false,
      message: 'Access denied. Guest privileges required.'
    });
  }
  next();
};

// Check if user is guest OR property owner (owners can also book other properties as guests)
const requireGuestOrOwner = (req, res, next) => {
  if (req.user.user_type !== 'guest' && req.user.user_type !== 'property_owner') {
    return res.status(403).json({
      success: false,
      message: 'Access denied. Guest or property owner privileges required.'
    });
  }
  next();
};

// Check if user has active HMS access
const requireHMSAccess = async (req, res, next) => {
  try {
    const hostId = req.user.user_type === 'staff' ? req.user.host_id : req.user.id;
    
    if (!hostId && req.user.user_type === 'staff') {
      return res.status(403).json({
        success: false,
        message: 'Staff account not linked to any host.',
      });
    }

    console.log('Checking HMS access for host:', hostId);
    const [hmsSub] = await pool.execute(
      'SELECT status, trial_ends_at, subscription_ends_at FROM hms_subscriptions WHERE host_id = ?',
      [hostId]
    );

    if (hmsSub.length === 0) {
      return res.status(403).json({
        success: false,
        message: 'HMS access required. Please subscribe to HMS.',
        hms_status: 'inactive'
      });
    }

    let status = hmsSub[0].status;
    const now = new Date();
    const expDate = hmsSub[0].subscription_ends_at;
    const trialDate = hmsSub[0].trial_ends_at;
    const endDate = status === 'trialing' ? (trialDate ? new Date(trialDate) : null) : (expDate ? new Date(expDate) : null);

    if (endDate && endDate < now) {
      console.log(`HMS Subscription expired for host ${hostId}. Status: ${status}, Exp: ${endDate}`);
      status = 'expired';
      await pool.execute('UPDATE hms_subscriptions SET status = "expired" WHERE host_id = ?', [hostId]);
    }

    if (status !== 'active' && status !== 'trialing') {
      console.log(`HMS Access denied for host ${hostId}. Status: ${status}`);
      return res.status(403).json({
        success: false,
        message: `HMS access ${status}. Please upgrade your plan.`,
        hms_status: status
      });
    }

    // Attach host_id to request for convenience in HMS routes
    req.hmsHostId = hostId;

    console.log(`HMS Access granted for host ${hostId}. Status: ${status}`);
    next();
  } catch (error) {
    console.error('HMS Access check error:', error);
    res.status(500).json({ success: false, message: 'Failed to verify HMS access' });
  }
};

// Check for specific HMS permissions (for staff)
const requireHMSPermission = (permission) => {
  return async (req, res, next) => {
    if (req.user.user_type === 'property_owner' || req.user.user_type === 'admin') {
      return next();
    }

    if (req.user.user_type !== 'staff') {
      return res.status(403).json({ success: false, message: 'Access denied.' });
    }

    try {
      const staffUserId = req.user.employee_user_id || req.user.id;
      const [staff] = await pool.execute(
        'SELECT permissions FROM hms_employees WHERE user_id = ? AND status = "active"',
        [staffUserId]
      );

      if (staff.length === 0) {
        return res.status(403).json({ success: false, message: 'Staff profile not found or inactive.' });
      }

      let permissions = staff[0].permissions || {};
      if (typeof permissions === 'string') {
        try {
          permissions = JSON.parse(permissions);
        } catch (e) {
          permissions = {};
        }
      }
      // If permission is '*', allow all. Otherwise check for specific key.
      if (permissions['*'] || permissions[permission]) {
        return next();
      }

      res.status(403).json({ success: false, message: `Access denied. Missing permission: ${permission}` });
    } catch (error) {
      console.error('Permission check error:', error);
      res.status(500).json({ success: false, message: 'Failed to verify permissions' });
    }
  };
};

// Optional authentication (doesn't fail if no token)
const optionalAuth = async (req, res, next) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');

    if (token) {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      const [users] = await pool.execute(
        'SELECT id, email, first_name, last_name, phone, user_type, host_id, is_active FROM users WHERE id = ? AND is_active = 1',
        [decoded.userId]
      );

      if (users.length > 0) {
        req.user = users[0];
      }
    }

    next();
  } catch (error) {
    // Continue without authentication
    next();
  }
};

module.exports = {
  verifyToken,
  requireAdmin,
  requirePropertyOwner,
  requireGuest,
  requireGuestOrOwner,
  requireHMSAccess,
  requireHMSPermission,
  optionalAuth
};
