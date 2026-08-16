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
      `SELECT u.id, u.email, u.first_name, u.last_name, u.phone, u.user_type, u.host_id, u.is_active,
              COALESCE(u.platform_permissions, rdp.permissions) as platform_permissions,
              rdp.display_name as role_display_name
       FROM users u
       LEFT JOIN role_default_permissions rdp ON rdp.role = u.user_type
       WHERE u.id = ? AND u.is_active = 1`,
      [decoded.userId]
    );

    if (users.length === 0) {
      return res.status(401).json({
        success: false,
        message: 'Invalid token. User not found or inactive.'
      });
    }

    const user = users[0];
    if (user.platform_permissions) {
      if (typeof user.platform_permissions === 'string') {
        try {
          user.platform_permissions = JSON.parse(user.platform_permissions);
        } catch (e) {
          user.platform_permissions = null;
        }
      }
    }

    req.user = user;
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

// Check if user is property owner or admin
const requirePropertyOwner = async (req, res, next) => {
  if (req.user.user_type !== 'property_owner' && req.user.user_type !== 'staff' && req.user.user_type !== 'admin') {
    return res.status(403).json({
      success: false,
      message: 'Access denied. Property owner, staff, or admin privileges required.'
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
  if (req.user.user_type !== 'guest' && req.user.user_type !== 'admin') {
    return res.status(403).json({
      success: false,
      message: 'Access denied. Guest privileges required.'
    });
  }
  next();
};

// Check if user is guest OR property owner (owners can also book other properties as guests)
const requireGuestOrOwner = (req, res, next) => {
  if (req.user.user_type !== 'guest' && req.user.user_type !== 'property_owner' && req.user.user_type !== 'admin') {
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

    // Check if the host has HMS disabled on their platform profile
    const [hostUser] = await pool.execute('SELECT platform_permissions FROM users WHERE id = ?', [hostId]);
    if (hostUser.length > 0) {
      let hostPerms = hostUser[0].platform_permissions;
      if (typeof hostPerms === 'string') {
        try { hostPerms = JSON.parse(hostPerms); } catch (e) { hostPerms = null; }
      }
      if (hostPerms && hostPerms.can_use_hms === false) {
        return res.status(403).json({
          success: false,
          message: 'HMS access is disabled by Administrator for this host.'
        });
      }
    }

    // Bypass subscription check if the user is an admin
    if (req.user.user_type === 'admin') {
      req.hmsHostId = hostId;
      console.log(`HMS Access granted for admin host ${hostId}`);
      return next();
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

      const permissionsToCheck = Array.isArray(permission) ? permission : [permission];
      let hasAccess = false;

      for (const perm of permissionsToCheck) {
        const targetKey = LEGACY_KEY_MAP[perm] || perm;

        // 1. Check custom overrides from hms_employees first
        if (permissions[perm] !== undefined) {
          if (permissions['*'] || permissions[perm] === true) {
            hasAccess = true;
            break;
          }
        }
        if (permissions[targetKey] !== undefined) {
          if (permissions['*'] || permissions[targetKey] === true) {
            hasAccess = true;
            break;
          }
        }
        if (permissions['*']) {
          hasAccess = true;
          break;
        }

        // 2. Fallback to default role permissions in platform_permissions
        let platformPerms = req.user.platform_permissions;
        if (platformPerms) {
          if (typeof platformPerms === 'string') {
            try {
              platformPerms = JSON.parse(platformPerms);
            } catch (e) {
              platformPerms = null;
            }
          }
          if (platformPerms && typeof platformPerms === 'object') {
            if (platformPerms[targetKey] === true || platformPerms[perm] === true) {
              hasAccess = true;
              break;
            }
          }
        }
      }

      if (hasAccess) {
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
        'SELECT id, email, first_name, last_name, phone, user_type, host_id, is_active, platform_permissions FROM users WHERE id = ? AND is_active = 1',
        [decoded.userId]
      );

      if (users.length > 0) {
        const user = users[0];
        if (user.platform_permissions && typeof user.platform_permissions === 'string') {
          try {
            user.platform_permissions = JSON.parse(user.platform_permissions);
          } catch (e) {
            user.platform_permissions = null;
          }
        }
        req.user = user;
      }
    }

    next();
  } catch (error) {
    // Continue without authentication
    next();
  }
};

const LEGACY_KEY_MAP = {
  'can_list_properties': 'properties.read',
  'can_use_pms': 'bookings.read',
  'can_use_calendar': 'calendar.read',
  'can_use_hms': 'hms_rooms.read',
  'can_view_earnings': 'earnings.read',
  'can_view_analytics': 'analytics.read',
  'can_manage_reviews': 'reviews.read',
  'can_manage_staff': 'staff.read',
  'can_make_bookings': 'bookings.create_update',
  'can_view_booking_history': 'bookings.read',
  'can_request_refunds': 'refunds.create_update',
  'can_leave_reviews': 'reviews.create_update',
  'can_use_rewards': 'rewards.read',
  'can_view_favorites': 'properties.read',
  'can_access_messages': 'messages.read',

  'manage_properties': 'properties.create_update',
  'manage_reservations': 'bookings.create_update',
  'manage_inventory': 'hms_rooms.create_update',
  'manage_housekeeping': 'hms_housekeeping.create_update',
  'manage_food_beverage': 'hms_rooms.create_update',
  'manage_hr': 'hms_hr.create_update',
  'manage_accounts': 'hms_accounts.create_update',
  'manage_billing': 'hms_accounts.create_update',
  'view_analytics': 'analytics.read'
};

// Check for platform-level permissions
const requirePlatformPermission = (permission) => {
  return async (req, res, next) => {
    let targetUser = req.user;

    // For staff members, check their host's platform permissions
    if (req.user.user_type === 'staff') {
      const hostId = req.user.host_id;
      if (hostId) {
        const [hosts] = await pool.execute('SELECT platform_permissions FROM users WHERE id = ?', [hostId]);
        if (hosts.length > 0) {
          targetUser = hosts[0];
        }
      }
    }

    let perms = targetUser.platform_permissions;
    if (perms && typeof perms === 'string') {
      try {
        perms = JSON.parse(perms);
      } catch (e) {
        perms = null;
      }
    }

    // Check explicit overrides first
    if (perms && typeof perms === 'object') {
      const targetKey = LEGACY_KEY_MAP[permission] || permission;
      if (perms[targetKey] === false || perms[permission] === false) {
        return res.status(403).json({
          success: false,
          message: `Access denied. Missing platform-level permission: ${permission}`
        });
      }
      if (perms[targetKey] === true || perms[permission] === true) {
        return next();
      }
    }

    // Admin always bypasses all permission checks if not explicitly denied above
    if (req.user.user_type === 'admin') {
      return next();
    }

    // If perms is NULL/undefined, default to allow for backward compatibility
    if (!perms) {
      return next();
    }

    // If perms exists but doesn't have the permission, deny
    return res.status(403).json({
      success: false,
      message: `Access denied. Missing platform-level permission: ${permission}`
    });
  };
};

module.exports = {
  verifyToken,
  requireAdmin,
  requirePropertyOwner,
  requireGuest,
  requireGuestOrOwner,
  requireHMSAccess,
  requireHMSPermission,
  requirePlatformPermission,
  optionalAuth
};
