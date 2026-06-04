const { pool } = require('../config/database');

const checkHMSAccess = async (req, res, next) => {
  try {
    const hostId = req.user.id; // Assuming verifyToken gets user info

    // Check subscription status
    const [rows] = await pool.query(
      'SELECT status FROM hms_subscriptions WHERE host_id = ? LIMIT 1',
      [hostId]
    );

    if (rows.length === 0) {
      return res.status(403).json({
        success: false,
        message: 'Access denied. Please subscribe to HMS.'
      });
    }

    const { status } = rows[0];

    // Allowed statuses are 'active' and 'trialing'
    if (status === 'active' || status === 'trialing') {
      return next();
    }

    return res.status(403).json({
      success: false,
      message: `Access denied. Your HMS subscription is ${status}. Please upgrade or renew.`
    });

  } catch (error) {
    console.error('HMS Access Middleware Error:', error);
    return res.status(500).json({
      success: false,
      message: 'Server error while checking HMS access'
    });
  }
};

module.exports = { checkHMSAccess };
