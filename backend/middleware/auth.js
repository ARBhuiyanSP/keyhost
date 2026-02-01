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
      'SELECT id, email, user_type, is_active FROM users WHERE id = ? AND is_active = 1',
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
const requirePropertyOwner = (req, res, next) => {
  if (req.user.user_type !== 'property_owner') {
    return res.status(403).json({
      success: false,
      message: 'Access denied. Property owner privileges required.'
    });
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

// Optional authentication (doesn't fail if no token)
const optionalAuth = async (req, res, next) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');
    
    if (token) {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      const [users] = await pool.execute(
        'SELECT id, email, user_type, is_active FROM users WHERE id = ? AND is_active = 1',
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
  optionalAuth
};
