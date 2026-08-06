const express = require('express');
const { pool } = require('../../config/database');
const {
  formatResponse,
  generatePagination
} = require('../../utils/helpers');
const {
  validateId,
  validatePagination
} = require('../../middleware/validation');
const { verifyToken, requireAdmin } = require('../../middleware/auth');
const { cache } = require('../../middleware/cache');
const { syncRefundToHMSAccounts } = require('../../utils/hms-sync');
const { syncHmsAccessForHost } = require('../../utils/hms-helper');
const { sendRefundSms } = require('../../utils/sms');
const whatsapp = require('../../utils/whatsapp');
const BkashPaymentGateway = require('../../utils/bkash-gateway');
const bkashGateway = new BkashPaymentGateway();
bkashGateway.initialize().catch(e => console.error('[Admin] bKash gateway init error:', e));

// Helper: instantly clear all property-types cache entries
const clearPropertyTypesCache = () => {
  try {
    const allKeys = cache.keys();
    allKeys.forEach(key => {
      if (key.includes('property-types') || key.includes('property_types')) {
        cache.del(key);
      }
    });
  } catch (e) { /* ignore */ }
};

// Helper: clear properties related cache
const clearPropertiesCache = () => {
  try {
    const allKeys = cache.keys();
    allKeys.forEach(key => {
      if (
        key.includes('properties') || 
        key.includes('recommended') || 
        key.includes('featured') ||
        key.includes('display-categories') ||
        key.includes('guest')
      ) {
        cache.del(key);
      }
    });
  } catch (e) { /* ignore */ }
};

const router = express.Router();

// Import earnings routes
const earningsRoutes = require('./admin-earnings');
const ownerPayoutRoutes = require('./admin-owner-payouts');

// Apply authentication and admin middleware to all routes
router.use(verifyToken);
router.use(requireAdmin);

// Clear all cache
router.post('/clear-cache', (req, res) => {
  try {
    cache.flushAll();
    res.json(formatResponse(true, 'All cache cleared successfully'));
  } catch (error) {
    res.status(500).json(formatResponse(false, 'Failed to clear cache', null, error.message));
  }
});

// Get WhatsApp connection status
router.get('/whatsapp/status', (req, res) => {
  try {
    const statusData = whatsapp.getStatus();
    res.json(formatResponse(true, 'WhatsApp status retrieved successfully', statusData));
  } catch (error) {
    res.status(500).json(formatResponse(false, 'Failed to get WhatsApp status', null, error.message));
  }
});

// Connect WhatsApp (generates QR code)
router.post('/whatsapp/connect', async (req, res) => {
  try {
    const result = await whatsapp.connectWhatsApp();
    res.json(formatResponse(true, 'WhatsApp connection initiated', result));
  } catch (error) {
    res.status(500).json(formatResponse(false, 'Failed to initiate WhatsApp connection', null, error.message));
  }
});

// Disconnect WhatsApp (logs out and clears files)
router.post('/whatsapp/disconnect', async (req, res) => {
  try {
    const result = await whatsapp.disconnectWhatsApp();
    res.json(formatResponse(true, 'WhatsApp disconnected successfully', result));
  } catch (error) {
    res.status(500).json(formatResponse(false, 'Failed to disconnect WhatsApp', null, error.message));
  }
});

// Get admin dashboard statistics
router.get('/dashboard', async (req, res) => {
  try {
    // Get total counts
    const [userCount] = await pool.execute('SELECT COUNT(*) as total FROM users WHERE is_active = 1');
    const [propertyCount] = await pool.execute('SELECT COUNT(*) as total FROM properties WHERE status = "active"');
    const [bookingCount] = await pool.execute('SELECT COUNT(*) as total FROM bookings WHERE status != "cancelled"');
    const [revenueResult] = await pool.execute('SELECT SUM(total_amount) as total FROM bookings WHERE payment_status = "paid" AND status != "cancelled"');

    // Get recent bookings
    const [recentBookings] = await pool.execute(`
      SELECT 
        b.id, b.booking_reference, b.total_amount, b.status, b.created_at,
        u.first_name, u.last_name,
        p.title as property_title
      FROM bookings b
      JOIN users u ON b.guest_id = u.id
      JOIN properties p ON b.property_id = p.id
      WHERE b.status != 'cancelled'
      ORDER BY b.created_at DESC
      LIMIT 10
    `);

    // Get pending reviews
    const [pendingReviews] = await pool.execute(`
      SELECT 
        r.id, r.rating, r.title, r.created_at,
        u.first_name, u.last_name,
        p.title as property_title
      FROM reviews r
      JOIN users u ON r.guest_id = u.id
      JOIN properties p ON r.property_id = p.id
      WHERE r.status = 'pending'
      ORDER BY r.created_at DESC
      LIMIT 5
    `);

    // Get daily bookings for the last 7 days for chart
    const [dailyStats] = await pool.execute(`
      SELECT 
        DATE(created_at) as date, 
        COUNT(*) as bookings,
        SUM(total_amount) as revenue
      FROM bookings 
      WHERE created_at >= DATE_SUB(CURDATE(), INTERVAL 6 DAY) 
      AND status != 'cancelled'
      GROUP BY DATE(created_at) 
      ORDER BY date ASC
    `);

    res.json(
      formatResponse(true, 'Admin dashboard data retrieved successfully', {
        statistics: {
          totalUsers: userCount[0].total,
          totalProperties: propertyCount[0].total,
          totalBookings: bookingCount[0].total,
          totalRevenue: revenueResult[0].total || 0
        },
        chartData: dailyStats,
        recentBookings,
        pendingReviews
      })
    );

  } catch (error) {
    console.error('Get admin dashboard error:', error);
    res.status(500).json(
      formatResponse(false, 'Failed to retrieve admin dashboard data', null, error.message)
    );
  }
});

// Get User Reports list with filters (type-wise, location-wise, search, date-range)
router.get('/reports/users', async (req, res) => {
  try {
    const { user_type, city, country, search, startDate, endDate } = req.query;

    let whereConditions = [];
    let queryParams = [];

    if (user_type) {
      whereConditions.push('u.user_type = ?');
      queryParams.push(user_type);
    }

    if (city) {
      whereConditions.push('u.city = ?');
      queryParams.push(city);
    }

    if (country) {
      whereConditions.push('u.country = ?');
      queryParams.push(country);
    }

    if (search) {
      whereConditions.push('(u.first_name LIKE ? OR u.last_name LIKE ? OR u.email LIKE ? OR u.phone LIKE ?)');
      const term = `%${search}%`;
      queryParams.push(term, term, term, term);
    }

    if (startDate) {
      whereConditions.push('u.created_at >= ?');
      queryParams.push(startDate + ' 00:00:00');
    }

    if (endDate) {
      whereConditions.push('u.created_at <= ?');
      queryParams.push(endDate + ' 23:59:59');
    }

    const whereClause = whereConditions.length > 0 ? `WHERE ${whereConditions.join(' AND ')}` : '';

    const query = `
      SELECT 
        u.id, 
        u.first_name, 
        u.last_name, 
        u.email, 
        u.phone, 
        u.user_type, 
        u.is_active, 
        u.city, 
        u.state, 
        u.country, 
        u.created_at
      FROM users u
      ${whereClause}
      ORDER BY u.created_at DESC
      LIMIT 1000
    `;

    const [users] = await pool.execute(query, queryParams);

    // Get lists of unique cities and countries for the dropdown filters
    const [cities] = await pool.execute(`
      SELECT DISTINCT city 
      FROM users 
      WHERE city IS NOT NULL AND TRIM(city) != '' 
      ORDER BY city ASC
    `);

    const [countries] = await pool.execute(`
      SELECT DISTINCT country 
      FROM users 
      WHERE country IS NOT NULL AND TRIM(country) != '' 
      ORDER BY country ASC
    `);

    res.json(formatResponse(true, 'User reports data retrieved successfully', {
      users,
      cities: cities.map(c => c.city),
      countries: countries.map(c => c.country)
    }));
  } catch (error) {
    console.error('[AdminReports] User reports list error:', error);
    res.status(500).json(formatResponse(false, 'Failed to fetch user reports data', null, error.message));
  }
});

// Get User Analytics (Demographics, Age groups, Gender, Repeated guests)
router.get('/reports/users/analytics', async (req, res) => {
  try {
    // 1. Total & Type-wise counts
    const [typeCounts] = await pool.execute(`
      SELECT user_type, COUNT(*) as count 
      FROM users 
      GROUP BY user_type
    `);

    // 2. Gender-wise distribution
    const [genderCounts] = await pool.execute(`
      SELECT COALESCE(gender, 'unspecified') as gender, COUNT(*) as count 
      FROM users 
      GROUP BY gender
    `);

    // 3. Age-wise distribution (using date_of_birth)
    const [ageCounts] = await pool.execute(`
      SELECT 
        CASE 
          WHEN date_of_birth IS NULL THEN 'Unspecified'
          WHEN TIMESTAMPDIFF(YEAR, date_of_birth, CURDATE()) < 18 THEN 'Under 18'
          WHEN TIMESTAMPDIFF(YEAR, date_of_birth, CURDATE()) BETWEEN 18 AND 25 THEN '18-25'
          WHEN TIMESTAMPDIFF(YEAR, date_of_birth, CURDATE()) BETWEEN 26 AND 35 THEN '26-35'
          WHEN TIMESTAMPDIFF(YEAR, date_of_birth, CURDATE()) BETWEEN 36 AND 50 THEN '36-50'
          ELSE '51+'
        END as age_group,
        COUNT(*) as count
      FROM users
      GROUP BY age_group
    `);

    // 4. Top Repeated Guests (guests with > 1 confirmed/completed bookings)
    const [repeatedGuests] = await pool.execute(`
      SELECT 
        u.id, u.first_name, u.last_name, u.email, u.phone, u.city, u.country,
        COUNT(b.id) as bookings_count, 
        SUM(b.total_amount) as total_spent,
        GROUP_CONCAT(DISTINCT CONCAT(p.title, ' (', pb.cnt, ' bookings)') SEPARATOR ', ') as repeated_properties
      FROM users u
      JOIN bookings b ON u.id = b.guest_id
      JOIN properties p ON b.property_id = p.id
      JOIN (
        SELECT guest_id, property_id, COUNT(*) as cnt
        FROM bookings
        WHERE status IN ('confirmed', 'checked_in', 'checked_out')
        GROUP BY guest_id, property_id
      ) pb ON u.id = pb.guest_id AND b.property_id = pb.property_id
      WHERE b.status IN ('confirmed', 'checked_in', 'checked_out')
      GROUP BY u.id
      HAVING bookings_count > 1
      ORDER BY bookings_count DESC
      LIMIT 500
    `);

    // 5. Detailed stays history of all repeated guests (Stay dates grouped by property in frontend)
    const [repeatedGuestsBookings] = await pool.execute(`
      SELECT 
        b.id as booking_id,
        b.guest_id,
        b.property_id,
        p.title as property_title,
        b.check_in_date,
        b.check_out_date,
        b.status,
        b.total_amount
      FROM bookings b
      JOIN properties p ON b.property_id = p.id
      WHERE b.guest_id IN (
        SELECT guest_id
        FROM bookings
        WHERE status IN ('confirmed', 'checked_in', 'checked_out')
        GROUP BY guest_id
        HAVING COUNT(*) > 1
      )
      AND b.status IN ('confirmed', 'checked_in', 'checked_out')
      ORDER BY b.guest_id, p.title, b.check_in_date DESC
    `);

    // 6. Complete list of users for detailed listing of genders/ages
    const [users] = await pool.execute(`
      SELECT 
        id, first_name, last_name, email, phone, user_type, gender, date_of_birth, city, country, created_at
      FROM users
      ORDER BY created_at DESC
    `);

    res.json(formatResponse(true, 'User analytics data retrieved successfully', {
      typeCounts,
      genderCounts,
      ageCounts,
      repeatedGuests,
      repeatedGuestsBookings,
      users
    }));
  } catch (error) {
    console.error('[AdminReports] User analytics error:', error);
    res.status(500).json(formatResponse(false, 'Failed to fetch user analytics', null, error.message));
  }
});

// Get Property Analytics (Top booked, top earning, top reviewed)
router.get('/reports/properties/analytics', async (req, res) => {
  try {
    // 1. Top properties by booking count
    const [topBooked] = await pool.execute(`
      SELECT p.id, p.title, p.city, p.property_type, COUNT(b.id) as bookings_count
      FROM properties p
      LEFT JOIN bookings b ON p.id = b.property_id AND b.status IN ('confirmed', 'checked_in', 'checked_out')
      GROUP BY p.id
      ORDER BY bookings_count DESC
      LIMIT 500
    `);

    // 2. Top earning properties by total revenue
    const [topEarning] = await pool.execute(`
      SELECT p.id, p.title, p.city, p.property_type, COALESCE(SUM(b.total_amount), 0) as total_earnings
      FROM properties p
      LEFT JOIN bookings b ON p.id = b.property_id AND b.payment_status = 'paid'
      GROUP BY p.id
      ORDER BY total_earnings DESC
      LIMIT 500
    `);

    // 3. Top reviewed properties by average rating
    const [topReviewed] = await pool.execute(`
      SELECT p.id, p.title, p.city, p.property_type, AVG(r.rating) as avg_rating, COUNT(r.id) as reviews_count
      FROM properties p
      LEFT JOIN reviews r ON p.id = r.property_id AND r.status = 'approved'
      GROUP BY p.id
      HAVING reviews_count > 0
      ORDER BY avg_rating DESC, reviews_count DESC
      LIMIT 500
    `);

    res.json(formatResponse(true, 'Property analytics data retrieved successfully', {
      topBooked,
      topEarning,
      topReviewed
    }));
  } catch (error) {
    console.error('[AdminReports] Property analytics error:', error);
    res.status(500).json(formatResponse(false, 'Failed to fetch property analytics', null, error.message));
  }
});

// Get all users
router.get('/users', validatePagination, async (req, res) => {
  try {
    const { page = 1, limit = 10, user_type, search } = req.query;
    const offset = (page - 1) * limit;

    let whereConditions = [];
    let queryParams = [];

    if (user_type) {
      whereConditions.push('u.user_type = ?');
      queryParams.push(user_type);
    }

    if (search) {
      whereConditions.push('(u.first_name LIKE ? OR u.last_name LIKE ? OR u.email LIKE ? OR u.phone LIKE ?)');
      queryParams.push(`%${search}%`, `%${search}%`, `%${search}%`, `%${search}%`);
    }

    const whereClause = whereConditions.length > 0 ? `WHERE ${whereConditions.join(' AND ')}` : '';

    // Get total count
    const [countResult] = await pool.execute(`
      SELECT COUNT(*) as total 
      FROM users u 
      ${whereClause}
    `, queryParams);

    const total = countResult[0].total;

    // Get users
    const [users] = await pool.execute(`
      SELECT 
        u.id, u.first_name, u.last_name, u.email, u.phone, u.user_type,
        u.is_active, u.auto_accept_bookings, u.email_verified_at, u.last_login_at, u.created_at,
        u.phone_verified_at, u.address, u.city, u.state, u.country, u.postal_code, u.bio,
        hs.status as hms_status, 
        hs.trial_ends_at as hms_trial_ends_at, 
        hs.subscription_ends_at as hms_subscription_ends_at,
        po.is_verified as owner_verified,
        po.business_name, po.business_license, po.tax_id,
        po.bank_account_number, po.bank_name, po.bank_routing_number, po.commission_rate
      FROM users u
      LEFT JOIN hms_subscriptions hs ON u.id = hs.host_id
      LEFT JOIN property_owners po ON u.id = po.user_id
      ${whereClause}
      ORDER BY u.created_at DESC
      LIMIT ? OFFSET ?
    `, [...queryParams, parseInt(limit), offset]);

    // Get stats
    const [statsRows] = await pool.execute(`
      SELECT 
        (SELECT COUNT(*) FROM users) as total_users,
        (SELECT COUNT(*) FROM users WHERE user_type = 'property_owner') as total_hosts,
        (SELECT COUNT(*) FROM property_owners WHERE is_verified = 1) as verified_hosts,
        (SELECT COUNT(*) FROM property_owners WHERE is_verified = 0) as pending_hosts,
        (SELECT COUNT(*) FROM users WHERE is_active = 1) as active_users,
        (SELECT COUNT(*) FROM users WHERE is_active = 0) as blocked_users
    `);
    const statsResult = statsRows[0] || {};

    const pagination = generatePagination(parseInt(page), parseInt(limit), total);

    res.json(
      formatResponse(true, 'Users retrieved successfully', {
        users,
        pagination,
        stats: statsResult
      })
    );

  } catch (error) {
    console.error('Get users error:', error);
    res.status(500).json(
      formatResponse(false, 'Failed to retrieve users', null, error.message)
    );
  }
});

// Get all properties for assignment (no pagination limit)
router.get('/properties/all', async (req, res) => {
  try {
    const { status } = req.query;

    let whereConditions = [];
    let queryParams = [];

    if (status) {
      whereConditions.push('p.status = ?');
      queryParams.push(status);
    }

    const whereClause = whereConditions.length > 0 ? `WHERE ${whereConditions.join(' AND ')}` : '';

    // Get all properties without pagination
    const [properties] = await pool.execute(`
      SELECT 
        p.id,
        p.title,
        p.city,
        p.state,
        p.base_price,
        p.status,
        p.property_type
      FROM properties p
      JOIN property_owners po ON p.owner_id = po.id
      JOIN users u ON po.user_id = u.id
      ${whereClause}
      ORDER BY p.created_at DESC
    `, queryParams);

    res.json(
      formatResponse(true, 'Properties retrieved successfully', {
        properties
      })
    );

  } catch (error) {
    console.error('Get all properties error:', error);
    res.status(500).json(
      formatResponse(false, 'Failed to retrieve properties', null, error.message)
    );
  }
});

// Get all properties
router.get('/properties', validatePagination, async (req, res) => {
  try {
    const { page = 1, limit = 10, status, search, featured, monthly_status } = req.query;
    const offset = (page - 1) * limit;

    let whereConditions = [];
    let queryParams = [];

    if (status) {
      whereConditions.push('p.status = ?');
      queryParams.push(status);
    }

    if (search) {
      whereConditions.push('(p.title LIKE ? OR p.city LIKE ?)');
      queryParams.push(`%${search}%`, `%${search}%`);
    }

    if (featured === 'true') {
      whereConditions.push('p.is_featured = 1');
    } else if (featured === 'false') {
      whereConditions.push('p.is_featured = 0');
    }

    if (monthly_status === 'pending') {
      whereConditions.push('p.monthly_rent_enabled = 1 AND p.monthly_approved = 0');
    } else if (monthly_status === 'approved') {
      whereConditions.push('p.monthly_rent_enabled = 1 AND p.monthly_approved = 1');
    }

    const whereClause = whereConditions.length > 0 ? `WHERE ${whereConditions.join(' AND ')}` : '';

    // Get total count
    const [countResult] = await pool.execute(`
      SELECT COUNT(*) as total 
      FROM properties p 
      ${whereClause}
    `, queryParams);

    const total = countResult[0].total;

    // Get properties
    const [properties] = await pool.execute(`
      SELECT 
        p.*,
        u.first_name as owner_first_name,
        u.last_name as owner_last_name,
        u.email as owner_email
      FROM properties p
      JOIN property_owners po ON p.owner_id = po.id
      JOIN users u ON po.user_id = u.id
      ${whereClause}
      ORDER BY p.created_at DESC
      LIMIT ? OFFSET ?
    `, [...queryParams, parseInt(limit), offset]);

    // Get display categories for each property
    for (let property of properties) {
      const [categories] = await pool.execute(`
        SELECT dc.id, dc.name, dc.description
        FROM display_categories dc
        INNER JOIN display_category_properties dcp ON dc.id = dcp.display_category_id
        WHERE dcp.property_id = ?
        ORDER BY dc.sort_order ASC, dc.name ASC
      `, [property.id]);
      property.display_categories = categories;
    }

    const pagination = generatePagination(parseInt(page), parseInt(limit), total);

    // Get global property statistics for dashboard count cards
    const [[statsResult]] = await pool.execute(`
      SELECT 
        COUNT(*) as \`all\`,
        COALESCE(SUM(CASE WHEN status = 'pending_approval' THEN 1 ELSE 0 END), 0) as pending_approval,
        COALESCE(SUM(CASE WHEN status = 'active' THEN 1 ELSE 0 END), 0) as active,
        COALESCE(SUM(CASE WHEN status = 'suspended' THEN 1 ELSE 0 END), 0) as suspended,
        COALESCE(SUM(CASE WHEN monthly_rent_enabled = 1 AND monthly_approved = 0 THEN 1 ELSE 0 END), 0) as monthly_pending,
        COALESCE(SUM(CASE WHEN is_featured = 1 THEN 1 ELSE 0 END), 0) as featured
      FROM properties
    `);

    res.json(
      formatResponse(true, 'Properties retrieved successfully', {
        properties,
        pagination,
        stats: statsResult
      })
    );

  } catch (error) {
    console.error('Get properties error:', error);
    res.status(500).json(
      formatResponse(false, 'Failed to retrieve properties', null, error.message)
    );
  }
});

// Get all bookings
router.get('/bookings', validatePagination, async (req, res) => {
  try {
    const { page = 1, limit = 10, status, search, startDate, endDate, property_id } = req.query;
    const offset = (page - 1) * limit;

    let whereConditions = [];
    let queryParams = [];

    if (status) {
      whereConditions.push('b.status = ?');
      queryParams.push(status);
    }

    if (property_id) {
      whereConditions.push('b.property_id = ?');
      queryParams.push(property_id);
    }

    if (search) {
      whereConditions.push('(b.booking_reference LIKE ? OR u.first_name LIKE ? OR p.title LIKE ?)');
      queryParams.push(`%${search}%`, `%${search}%`, `%${search}%`);
    }

    if (startDate) {
      whereConditions.push('b.check_in_date >= ?');
      queryParams.push(startDate);
    }

    if (endDate) {
      whereConditions.push('b.check_in_date <= ?');
      queryParams.push(endDate);
    }

    const whereClause = whereConditions.length > 0 ? `WHERE ${whereConditions.join(' AND ')}` : '';

    // Get total count
    const [countResult] = await pool.execute(`
      SELECT COUNT(*) as total 
      FROM bookings b
      JOIN users u ON b.guest_id = u.id
      JOIN properties p ON b.property_id = p.id
      ${whereClause}
    `, queryParams);

    const total = countResult[0].total;

    // Get bookings
    const [bookings] = await pool.execute(`
      SELECT 
        b.*,
        u.first_name as guest_first_name,
        u.last_name as guest_last_name,
        u.email as guest_email,
        p.title as property_title,
        p.city as property_city
      FROM bookings b
      JOIN users u ON b.guest_id = u.id
      JOIN properties p ON b.property_id = p.id
      ${whereClause}
      ORDER BY b.created_at DESC
      LIMIT ? OFFSET ?
    `, [...queryParams, parseInt(limit), offset]);

    const pagination = generatePagination(parseInt(page), parseInt(limit), total);

    res.json(
      formatResponse(true, 'Bookings retrieved successfully', {
        bookings,
        pagination
      })
    );

  } catch (error) {
    console.error('Get bookings error:', error);
    res.status(500).json(
      formatResponse(false, 'Failed to retrieve bookings', null, error.message)
    );
  }
});

// Get reviews (with filtering)
router.get('/reviews', validatePagination, async (req, res) => {
  try {
    const { page = 1, limit = 10, status, search } = req.query;
    const offset = (page - 1) * limit;

    let whereConditions = [];
    let queryParams = [];

    if (status) {
      whereConditions.push('r.status = ?');
      queryParams.push(status);
    }

    if (search) {
      whereConditions.push('(u.first_name LIKE ? OR u.last_name LIKE ? OR p.title LIKE ? OR b.booking_reference LIKE ?)');
      queryParams.push(`%${search}%`, `%${search}%`, `%${search}%`, `%${search}%`);
    }

    const whereClause = whereConditions.length > 0 ? `WHERE ${whereConditions.join(' AND ')}` : '';

    // Get total count
    const [countResult] = await pool.query(`
      SELECT COUNT(*) as total 
      FROM reviews r
      JOIN users u ON r.guest_id = u.id
      JOIN bookings b ON r.booking_id = b.id
      JOIN properties p ON r.property_id = p.id
      ${whereClause}
    `, queryParams);

    const total = countResult[0]?.total || 0;

    // Get reviews
    const [reviews] = await pool.query(`
      SELECT 
        r.*,
        u.first_name, u.last_name,
        b.booking_reference,
        p.title as property_title,
        p.city as property_city
      FROM reviews r
      JOIN users u ON r.guest_id = u.id
      JOIN bookings b ON r.booking_id = b.id
      JOIN properties p ON r.property_id = p.id
      ${whereClause}
      ORDER BY r.created_at DESC
      LIMIT ? OFFSET ?
    `, [...queryParams, parseInt(limit) || 10, parseInt(offset) || 0]);

    const pagination = generatePagination(parseInt(page), parseInt(limit), total);

    res.json(
      formatResponse(true, 'Reviews retrieved successfully', {
        reviews,
        pagination
      })
    );

  } catch (error) {
    console.error('Get reviews error:', error);
    res.status(500).json(
      formatResponse(false, 'Failed to retrieve reviews', null, error.message)
    );
  }
});

// Approve/Reject review
router.patch('/reviews/:id/status', validateId, async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!['approved', 'rejected'].includes(status)) {
      return res.status(400).json(
        formatResponse(false, 'Invalid status. Must be "approved" or "rejected"')
      );
    }

    // Update review status
    const [result] = await pool.execute(
      'UPDATE reviews SET status = ?, updated_at = NOW() WHERE id = ?',
      [status, id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json(
        formatResponse(false, 'Review not found')
      );
    }

    // If approved, update property rating
    if (status === 'approved') {
      const [reviews] = await pool.execute(
        'SELECT property_id, rating FROM reviews WHERE id = ?',
        [id]
      );

      if (reviews.length > 0) {
        const { property_id } = reviews[0];

        // Calculate new average rating
        const [ratingResult] = await pool.execute(`
          SELECT AVG(rating) as avg_rating, COUNT(*) as total_reviews
          FROM reviews 
          WHERE property_id = ? AND status = 'approved'
        `, [property_id]);

        const { avg_rating, total_reviews } = ratingResult[0];

        // Update property rating
        await pool.execute(
          'UPDATE properties SET average_rating = ?, total_reviews = ? WHERE id = ?',
          [avg_rating, total_reviews, property_id]
        );
      }
    }

    res.json(
      formatResponse(true, `Review ${status} successfully`)
    );

  } catch (error) {
    console.error('Update review status error:', error);
    res.status(500).json(
      formatResponse(false, 'Failed to update review status', null, error.message)
    );
  }
});

// Update user details
router.put('/users/:id', validateId, async (req, res) => {
  try {
    const { id } = req.params;
    const { first_name, last_name, email, phone, user_type, auto_accept_bookings, owner_verified } = req.body;

    // Validate required fields
    if (!first_name || !last_name || !email || !user_type) {
      return res.status(400).json(
        formatResponse(false, 'First name, last name, email, and user type are required')
      );
    }

    // Validate user_type
    if (!['admin', 'property_owner', 'guest'].includes(user_type)) {
      return res.status(400).json(
        formatResponse(false, 'Invalid user type')
      );
    }

    // Check if email is already taken by another user
    const [existingUsers] = await pool.execute(
      'SELECT id FROM users WHERE email = ? AND id != ?',
      [email, id]
    );

    if (existingUsers.length > 0) {
      return res.status(400).json(
        formatResponse(false, 'Email is already in use by another user')
      );
    }

    // Update user
    let queryArgs = [first_name, last_name, email, phone || null, user_type];
    let querySets = 'first_name = ?, last_name = ?, email = ?, phone = ?, user_type = ?';

    if (auto_accept_bookings !== undefined) {
      querySets += ', auto_accept_bookings = ?';
      queryArgs.push(auto_accept_bookings ? 1 : 0);
    }
    
    querySets += ', updated_at = NOW()';
    queryArgs.push(id);

    const [result] = await pool.execute(
      `UPDATE users SET ${querySets} WHERE id = ?`,
      queryArgs
    );

    if (result.affectedRows === 0) {
      return res.status(404).json(
        formatResponse(false, 'User not found')
      );
    }

    // Update owner verification status if user type is property_owner
    if (user_type === 'property_owner') {
      const [existingOwner] = await pool.execute(
        'SELECT id FROM property_owners WHERE user_id = ?',
        [id]
      );
      
      const isVerifiedVal = owner_verified !== undefined ? (owner_verified ? 1 : 0) : 0;
      
      if (existingOwner.length > 0) {
        await pool.execute(
          'UPDATE property_owners SET is_verified = ? WHERE user_id = ?',
          [isVerifiedVal, id]
        );
      } else {
        await pool.execute(
          'INSERT INTO property_owners (user_id, commission_rate, is_verified, created_at) VALUES (?, 0, ?, NOW())',
          [id, isVerifiedVal]
        );
      }
    }

    // Get updated user data
    const [updatedUser] = await pool.execute(`
      SELECT 
        u.id, u.first_name, u.last_name, u.email, u.phone, u.user_type, 
        u.is_active, u.auto_accept_bookings, u.created_at,
        u.phone_verified_at, u.address, u.city, u.state, u.country, u.postal_code, u.bio,
        po.is_verified as owner_verified,
        po.business_name, po.business_license, po.tax_id,
        po.bank_account_number, po.bank_name, po.bank_routing_number, po.commission_rate
      FROM users u
      LEFT JOIN property_owners po ON u.id = po.user_id
      WHERE u.id = ?
    `, [id]);

    res.json(
      formatResponse(true, 'User updated successfully', updatedUser[0])
    );

  } catch (error) {
    console.error('Update user error:', error);
    res.status(500).json(
      formatResponse(false, 'Failed to update user', null, error.message)
    );
  }
});

// Block/Unblock user
router.patch('/users/:id/block', validateId, async (req, res) => {
  try {
    const { id } = req.params;
    const { is_active, reason } = req.body;

    // Update user status
    const [result] = await pool.execute(
      'UPDATE users SET is_active = ?, updated_at = NOW() WHERE id = ?',
      [is_active ? 1 : 0, id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json(
        formatResponse(false, 'User not found')
      );
    }

    // Create block record if blocking
    if (!is_active && reason) {
      await pool.execute(`
        INSERT INTO user_blocks (blocked_user_id, blocked_by, block_type, reason, status, blocked_at)
        VALUES (?, ?, 'permanent', ?, 'active', NOW())
      `, [id, req.user.id, reason]);
    }

    res.json(
      formatResponse(true, `User ${is_active ? 'unblocked' : 'blocked'} successfully`)
    );

  } catch (error) {
    console.error('Block user error:', error);
    res.status(500).json(
      formatResponse(false, 'Failed to update user status', null, error.message)
    );
  }
});

// Get list of all properties (id, title) for dropdowns
router.get('/properties/list', async (req, res) => {
  try {
    const [properties] = await pool.execute(
      'SELECT id, title, city FROM properties ORDER BY title ASC'
    );
    res.json(formatResponse(true, 'Properties list retrieved successfully', { properties }));
  } catch (error) {
    console.error('Get properties list error:', error);
    res.status(500).json(formatResponse(false, 'Failed to retrieve properties list', null, error.message));
  }
});

// Update property details
router.put('/properties/:id', validateId, async (req, res) => {
  try {
    const { id } = req.params;
    const { title, base_price, status, display_category_id } = req.body;

    // Validate required fields
    if (!title || !base_price || !status) {
      return res.status(400).json(
        formatResponse(false, 'Title, base price, and status are required')
      );
    }

    // Validate status
    if (!['active', 'inactive', 'suspended', 'pending_approval'].includes(status)) {
      return res.status(400).json(
        formatResponse(false, 'Invalid status')
      );
    }

    // Validate display_category_id if provided
    if (display_category_id) {
      const [categoryExists] = await pool.execute(
        'SELECT id FROM display_categories WHERE id = ?',
        [display_category_id]
      );
      if (categoryExists.length === 0) {
        return res.status(400).json(
          formatResponse(false, 'Invalid display category')
        );
      }
    }

    // Update property
    const [result] = await pool.execute(
      `UPDATE properties 
       SET title = ?, base_price = ?, status = ?, display_category_id = ?, updated_at = NOW() 
       WHERE id = ?`,
      [title, base_price, status, display_category_id || null, id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json(
        formatResponse(false, 'Property not found')
      );
    }

    // Get updated property data
    const [updatedProperty] = await pool.execute(
      'SELECT id, title, base_price, status, created_at FROM properties WHERE id = ?',
      [id]
    );

    res.json(
      formatResponse(true, 'Property updated successfully', updatedProperty[0])
    );

  } catch (error) {
    console.error('Update property error:', error);
    res.status(500).json(
      formatResponse(false, 'Failed to update property', null, error.message)
    );
  }
});

// Toggle featured property
router.patch('/properties/:id/featured', validateId, async (req, res) => {
  try {
    const { id } = req.params;
    const { is_featured } = req.body;

    if (typeof is_featured !== 'boolean') {
      return res.status(400).json(
        formatResponse(false, 'is_featured must be a boolean value')
      );
    }

    // Update property featured status
    const [result] = await pool.execute(
      'UPDATE properties SET is_featured = ?, updated_at = NOW() WHERE id = ?',
      [is_featured ? 1 : 0, id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json(
        formatResponse(false, 'Property not found')
      );
    }

    res.json(
      formatResponse(true, `Property ${is_featured ? 'featured' : 'unfeatured'} successfully`)
    );

  } catch (error) {
    console.error('Toggle featured property error:', error);
    res.status(500).json(
      formatResponse(false, 'Failed to update featured status', null, error.message)
    );
  }
});

// Approve/Reject property
router.patch('/properties/:id/status', validateId, async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!['active', 'inactive', 'suspended', 'pending_approval'].includes(status)) {
      return res.status(400).json(
        formatResponse(false, 'Invalid status')
      );
    }

    // Update property status
    const [result] = await pool.execute(
      'UPDATE properties SET status = ?, updated_at = NOW() WHERE id = ?',
      [status, id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json(
        formatResponse(false, 'Property not found')
      );
    }

    // Clear cache
    clearPropertiesCache();

    res.json(
      formatResponse(true, 'Property status updated successfully')
    );

  } catch (error) {
    console.error('Update property status error:', error);
    res.status(500).json(
      formatResponse(false, 'Failed to update property status', null, error.message)
    );
  }
});

// Approve monthly stay option
router.put('/properties/:id/approve-monthly', validateId, async (req, res) => {
  try {
    const { id } = req.params;

    const [result] = await pool.execute(
      'UPDATE properties SET monthly_approved = 1, updated_at = NOW() WHERE id = ?',
      [id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json(
        formatResponse(false, 'Property not found')
      );
    }

    clearPropertiesCache();

    res.json(
      formatResponse(true, 'Monthly rent stay approved successfully')
    );
  } catch (error) {
    console.error('Approve monthly stay error:', error);
    res.status(500).json(
      formatResponse(false, 'Failed to approve monthly stay', null, error.message)
    );
  }
});

// Revoke monthly stay option
router.put('/properties/:id/revoke-monthly', validateId, async (req, res) => {
  try {
    const { id } = req.params;

    const [result] = await pool.execute(
      'UPDATE properties SET monthly_approved = 0, updated_at = NOW() WHERE id = ?',
      [id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json(
        formatResponse(false, 'Property not found')
      );
    }

    clearPropertiesCache();

    res.json(
      formatResponse(true, 'Monthly rent stay revoked successfully')
    );
  } catch (error) {
    console.error('Revoke monthly stay error:', error);
    res.status(500).json(
      formatResponse(false, 'Failed to revoke monthly stay', null, error.message)
    );
  }
});

// =============================================
// DISPLAY CATEGORIES MANAGEMENT
// =============================================

// Get all display categories
router.get('/display-categories', async (req, res) => {
  try {
    const [categories] = await pool.execute(`
      SELECT dc.*, COUNT(DISTINCT dcp.property_id) as property_count
      FROM display_categories dc
      LEFT JOIN display_category_properties dcp ON dc.id = dcp.display_category_id
      LEFT JOIN properties p ON dcp.property_id = p.id AND p.status = 'active'
      GROUP BY dc.id
      ORDER BY dc.sort_order ASC, dc.name ASC
    `);

    res.json(
      formatResponse(true, 'Display categories retrieved successfully', { categories })
    );

  } catch (error) {
    console.error('Get display categories error:', error);
    res.status(500).json(
      formatResponse(false, 'Failed to retrieve display categories', null, error.message)
    );
  }
});

// Create new display category
router.post('/display-categories', async (req, res) => {
  try {
    const { name, description, sort_order, is_active } = req.body;

    // Validate required fields
    if (!name) {
      return res.status(400).json(
        formatResponse(false, 'Name is required')
      );
    }

    // Check if category already exists
    const [existing] = await pool.execute(
      'SELECT id FROM display_categories WHERE name = ?',
      [name]
    );

    if (existing.length > 0) {
      return res.status(409).json(
        formatResponse(false, 'Display category with this name already exists')
      );
    }

    // Create category
    const [result] = await pool.execute(
      'INSERT INTO display_categories (name, description, sort_order, is_active, created_at) VALUES (?, ?, ?, ?, NOW())',
      [name, description || null, sort_order || 0, is_active !== undefined ? (is_active ? 1 : 0) : 1]
    );

    const categoryId = result.insertId;

    // Get created category
    const [newCategory] = await pool.execute(
      'SELECT * FROM display_categories WHERE id = ?',
      [categoryId]
    );

    res.status(201).json(
      formatResponse(true, 'Display category created successfully', { category: newCategory[0] })
    );

  } catch (error) {
    console.error('Create display category error:', error);
    res.status(500).json(
      formatResponse(false, 'Failed to create display category', null, error.message)
    );
  }
});

// Update display category
router.put('/display-categories/:id', validateId, async (req, res) => {
  try {
    const { id } = req.params;
    const { name, description, sort_order, is_active } = req.body;

    // Validate required fields
    if (!name) {
      return res.status(400).json(
        formatResponse(false, 'Name is required')
      );
    }

    // Check if category exists
    const [existing] = await pool.execute(
      'SELECT id FROM display_categories WHERE id = ?',
      [id]
    );

    if (existing.length === 0) {
      return res.status(404).json(
        formatResponse(false, 'Display category not found')
      );
    }

    // Check if name already exists (excluding current category)
    const [nameExists] = await pool.execute(
      'SELECT id FROM display_categories WHERE name = ? AND id != ?',
      [name, id]
    );

    if (nameExists.length > 0) {
      return res.status(409).json(
        formatResponse(false, 'Display category with this name already exists')
      );
    }

    // Convert is_active boolean to 1 or 0 for MySQL
    const isActiveValue = is_active !== undefined ? (is_active === true || is_active === 1 || is_active === '1' ? 1 : 0) : 1;

    // Update category
    const [result] = await pool.execute(
      'UPDATE display_categories SET name = ?, description = ?, sort_order = ?, is_active = ? WHERE id = ?',
      [name, description || null, sort_order || 0, isActiveValue, id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json(
        formatResponse(false, 'Display category not found')
      );
    }

    // Get updated category
    const [updatedCategory] = await pool.execute(
      'SELECT * FROM display_categories WHERE id = ?',
      [id]
    );

    res.json(
      formatResponse(true, 'Display category updated successfully', { category: updatedCategory[0] })
    );

  } catch (error) {
    console.error('Update display category error:', error);
    res.status(500).json(
      formatResponse(false, 'Failed to update display category', null, error.message)
    );
  }
});

// Delete display category
router.delete('/display-categories/:id', validateId, async (req, res) => {
  try {
    const { id } = req.params;

    // Check if category exists
    const [existing] = await pool.execute(
      'SELECT id FROM display_categories WHERE id = ?',
      [id]
    );

    if (existing.length === 0) {
      return res.status(404).json(
        formatResponse(false, 'Display category not found')
      );
    }

    // Check if category is being used by any properties
    const [properties] = await pool.execute(
      'SELECT COUNT(*) as count FROM properties WHERE display_category_id = ?',
      [id]
    );

    if (properties[0].count > 0) {
      return res.status(409).json(
        formatResponse(false, 'Cannot delete display category. It is being used by properties.')
      );
    }

    // Delete category
    const [result] = await pool.execute(
      'DELETE FROM display_categories WHERE id = ?',
      [id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json(
        formatResponse(false, 'Display category not found')
      );
    }

    res.json(
      formatResponse(true, 'Display category deleted successfully')
    );

  } catch (error) {
    console.error('Delete display category error:', error);
    res.status(500).json(
      formatResponse(false, 'Failed to delete display category', null, error.message)
    );
  }
});

// Get properties by display category (using junction table)
router.get('/display-categories/:id/properties', validateId, async (req, res) => {
  try {
    const { id } = req.params;
    const limit = parseInt(req.query.limit) || 10;

    // Check if category exists
    const [category] = await pool.execute(
      'SELECT * FROM display_categories WHERE id = ? AND is_active = 1',
      [id]
    );

    if (category.length === 0) {
      return res.status(404).json(
        formatResponse(false, 'Display category not found or inactive')
      );
    }

    // Get properties for this category using junction table
    const [properties] = await pool.execute(`
      SELECT p.*, 
        (SELECT image_url FROM property_images WHERE property_id = p.id AND image_type = 'main' LIMIT 1) as main_image_url,
        (SELECT AVG(rating) FROM reviews WHERE property_id = p.id AND status = 'approved') as average_rating
      FROM properties p
      INNER JOIN display_category_properties dcp ON p.id = dcp.property_id
      WHERE dcp.display_category_id = ? 
        AND p.status = 'active'
      ORDER BY dcp.created_at DESC
      LIMIT ?
    `, [id, limit]);

    // Get amenities and images for each property
    for (let property of properties) {
      const [amenities] = await pool.execute(`
        SELECT a.id, a.name, a.icon, a.category
        FROM amenities a
        JOIN property_amenities pa ON a.id = pa.amenity_id
        WHERE pa.property_id = ? AND a.is_active = 1
        ORDER BY a.category, a.name
      `, [property.id]);
      property.amenities = amenities;

      // Get all images for the property
      const [allImages] = await pool.execute(`
        SELECT image_url, alt_text, image_type, sort_order
        FROM property_images
        WHERE property_id = ? AND is_active = 1
        ORDER BY 
          CASE WHEN image_type = 'main' THEN 0 ELSE 1 END,
          sort_order
        LIMIT 10
      `, [property.id]);

      property.images = allImages;

      // Set main_image for backward compatibility
      const mainImage = allImages.find(img => img.image_type === 'main') || allImages[0];
      property.main_image = mainImage || null;
    }

    res.json(
      formatResponse(true, 'Properties retrieved successfully', {
        category: category[0],
        properties
      })
    );

  } catch (error) {
    console.error('Get category properties error:', error);
    res.status(500).json(
      formatResponse(false, 'Failed to retrieve properties', null, error.message)
    );
  }
});

// Assign properties to display category
router.post('/display-categories/:id/assign-properties', validateId, async (req, res) => {
  try {
    const { id } = req.params;
    const { property_ids } = req.body;

    // Validate input
    if (!Array.isArray(property_ids)) {
      return res.status(400).json(
        formatResponse(false, 'property_ids must be an array')
      );
    }

    // Check if category exists
    const [category] = await pool.execute(
      'SELECT id FROM display_categories WHERE id = ?',
      [id]
    );

    if (category.length === 0) {
      return res.status(404).json(
        formatResponse(false, 'Display category not found')
      );
    }

    // Validate all property IDs exist
    if (property_ids.length > 0) {
      const placeholders = property_ids.map(() => '?').join(',');
      const [properties] = await pool.execute(
        `SELECT id FROM properties WHERE id IN (${placeholders})`,
        property_ids
      );

      if (properties.length !== property_ids.length) {
        return res.status(400).json(
          formatResponse(false, 'One or more property IDs are invalid')
        );
      }
    }

    // Start transaction
    const connection = await pool.getConnection();
    await connection.beginTransaction();

    try {
      // Remove all existing assignments for this category
      await connection.execute(
        'DELETE FROM display_category_properties WHERE display_category_id = ?',
        [id]
      );

      // Insert new assignments
      if (property_ids.length > 0) {
        const values = property_ids.map(propertyId => [id, propertyId]);
        await connection.query(
          'INSERT INTO display_category_properties (display_category_id, property_id) VALUES ?',
          [values]
        );
      }

      await connection.commit();
      connection.release();

      res.json(
        formatResponse(true, 'Properties assigned successfully', {
          assigned_count: property_ids.length
        })
      );

    } catch (error) {
      await connection.rollback();
      connection.release();
      throw error;
    }

  } catch (error) {
    console.error('Assign properties error:', error);
    res.status(500).json(
      formatResponse(false, 'Failed to assign properties', null, error.message)
    );
  }
});

// Get property's display categories
router.get('/properties/:id/display-categories', validateId, async (req, res) => {
  try {
    const { id } = req.params;

    // Check if property exists
    const [property] = await pool.execute(
      'SELECT id FROM properties WHERE id = ?',
      [id]
    );

    if (property.length === 0) {
      return res.status(404).json(
        formatResponse(false, 'Property not found')
      );
    }

    // Get categories assigned to this property
    const [categories] = await pool.execute(`
      SELECT dc.id, dc.name, dc.description, dc.is_active, dc.sort_order
      FROM display_categories dc
      INNER JOIN display_category_properties dcp ON dc.id = dcp.display_category_id
      WHERE dcp.property_id = ?
      ORDER BY dc.sort_order ASC, dc.name ASC
    `, [id]);

    res.json(
      formatResponse(true, 'Property categories retrieved successfully', {
        categories
      })
    );

  } catch (error) {
    console.error('Get property categories error:', error);
    res.status(500).json(
      formatResponse(false, 'Failed to retrieve property categories', null, error.message)
    );
  }
});

// Assign property to display categories
router.post('/properties/:id/assign-categories', validateId, async (req, res) => {
  try {
    const { id } = req.params;
    const { category_ids } = req.body;

    // Validate input
    if (!Array.isArray(category_ids)) {
      return res.status(400).json(
        formatResponse(false, 'category_ids must be an array')
      );
    }

    // Check if property exists
    const [property] = await pool.execute(
      'SELECT id FROM properties WHERE id = ?',
      [id]
    );

    if (property.length === 0) {
      return res.status(404).json(
        formatResponse(false, 'Property not found')
      );
    }

    // Validate all category IDs exist
    if (category_ids.length > 0) {
      const placeholders = category_ids.map(() => '?').join(',');
      const [categories] = await pool.execute(
        `SELECT id FROM display_categories WHERE id IN (${placeholders})`,
        category_ids
      );

      if (categories.length !== category_ids.length) {
        return res.status(400).json(
          formatResponse(false, 'One or more category IDs are invalid')
        );
      }
    }

    // Start transaction
    const connection = await pool.getConnection();
    await connection.beginTransaction();

    try {
      // Remove all existing assignments for this property
      await connection.execute(
        'DELETE FROM display_category_properties WHERE property_id = ?',
        [id]
      );

      // Insert new assignments
      if (category_ids.length > 0) {
        const values = category_ids.map(categoryId => [categoryId, id]);
        await connection.query(
          'INSERT INTO display_category_properties (display_category_id, property_id) VALUES ?',
          [values]
        );
      }

      await connection.commit();
      connection.release();

      res.json(
        formatResponse(true, 'Property assigned to categories successfully', {
          assigned_count: category_ids.length
        })
      );

    } catch (error) {
      await connection.rollback();
      connection.release();
      throw error;
    }

  } catch (error) {
    console.error('Assign property categories error:', error);
    res.status(500).json(
      formatResponse(false, 'Failed to assign categories', null, error.message)
    );
  }
});

// =============================================
// AMENITIES MANAGEMENT
// =============================================

// Get all amenities
router.get('/amenities', async (req, res) => {
  try {
    const [amenities] = await pool.execute(`
      SELECT id, name, icon, category, is_active, created_at
      FROM amenities
      ORDER BY category, name
    `);

    res.json(
      formatResponse(true, 'Amenities retrieved successfully', { amenities })
    );

  } catch (error) {
    console.error('Get amenities error:', error);
    res.status(500).json(
      formatResponse(false, 'Failed to retrieve amenities', null, error.message)
    );
  }
});

// Create new amenity
router.post('/amenities', async (req, res) => {
  try {
    const { name, icon, category } = req.body;

    // Validate required fields
    if (!name || !category) {
      return res.status(400).json(
        formatResponse(false, 'Name and category are required')
      );
    }

    // Validate category
    const validCategories = ['basic', 'safety', 'entertainment', 'kitchen', 'bathroom', 'outdoor', 'accessibility'];
    if (!validCategories.includes(category)) {
      return res.status(400).json(
        formatResponse(false, 'Invalid category')
      );
    }

    // Check if amenity already exists
    const [existing] = await pool.execute(
      'SELECT id FROM amenities WHERE name = ?',
      [name]
    );

    if (existing.length > 0) {
      return res.status(409).json(
        formatResponse(false, 'Amenity with this name already exists')
      );
    }

    // Create amenity
    const [result] = await pool.execute(
      'INSERT INTO amenities (name, icon, category, created_at) VALUES (?, ?, ?, NOW())',
      [name, icon || null, category]
    );

    const amenityId = result.insertId;

    // Get created amenity
    const [newAmenity] = await pool.execute(
      'SELECT * FROM amenities WHERE id = ?',
      [amenityId]
    );

    res.status(201).json(
      formatResponse(true, 'Amenity created successfully', { amenity: newAmenity[0] })
    );

  } catch (error) {
    console.error('Create amenity error:', error);
    res.status(500).json(
      formatResponse(false, 'Failed to create amenity', null, error.message)
    );
  }
});

// Update amenity
router.put('/amenities/:id', validateId, async (req, res) => {
  try {
    const { id } = req.params;
    const { name, icon, category, is_active } = req.body;

    // Validate required fields
    if (!name || !category) {
      return res.status(400).json(
        formatResponse(false, 'Name and category are required')
      );
    }

    // Validate category
    const validCategories = ['basic', 'safety', 'entertainment', 'kitchen', 'bathroom', 'outdoor', 'accessibility'];
    if (!validCategories.includes(category)) {
      return res.status(400).json(
        formatResponse(false, 'Invalid category')
      );
    }

    // Check if amenity exists
    const [existing] = await pool.execute(
      'SELECT id FROM amenities WHERE id = ?',
      [id]
    );

    if (existing.length === 0) {
      return res.status(404).json(
        formatResponse(false, 'Amenity not found')
      );
    }

    // Check if name already exists (excluding current amenity)
    const [nameExists] = await pool.execute(
      'SELECT id FROM amenities WHERE name = ? AND id != ?',
      [name, id]
    );

    if (nameExists.length > 0) {
      return res.status(409).json(
        formatResponse(false, 'Amenity with this name already exists')
      );
    }

    // Update amenity
    // Convert is_active boolean to 1 or 0 for MySQL
    const isActiveValue = is_active !== undefined ? (is_active === true || is_active === 1 || is_active === '1' ? 1 : 0) : 1;

    const [result] = await pool.execute(
      'UPDATE amenities SET name = ?, icon = ?, category = ?, is_active = ? WHERE id = ?',
      [name, icon || null, category, isActiveValue, id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json(
        formatResponse(false, 'Amenity not found')
      );
    }

    // Get updated amenity
    const [updatedAmenity] = await pool.execute(
      'SELECT * FROM amenities WHERE id = ?',
      [id]
    );

    res.json(
      formatResponse(true, 'Amenity updated successfully', { amenity: updatedAmenity[0] })
    );

  } catch (error) {
    console.error('Update amenity error:', error);
    console.error('Error details:', {
      message: error.message,
      sql: error.sql,
      code: error.code,
      errno: error.errno
    });
    res.status(500).json(
      formatResponse(false, 'Failed to update amenity', null, error.message || 'Unknown error occurred')
    );
  }
});

// Delete amenity
router.delete('/amenities/:id', validateId, async (req, res) => {
  try {
    const { id } = req.params;

    // Check if amenity exists
    const [existing] = await pool.execute(
      'SELECT id FROM amenities WHERE id = ?',
      [id]
    );

    if (existing.length === 0) {
      return res.status(404).json(
        formatResponse(false, 'Amenity not found')
      );
    }

    // Check if amenity is being used by any properties
    const [usage] = await pool.execute(
      'SELECT COUNT(*) as count FROM property_amenities WHERE amenity_id = ?',
      [id]
    );

    if (usage[0].count > 0) {
      return res.status(400).json(
        formatResponse(false, 'Cannot delete amenity. It is being used by properties.')
      );
    }

    // Delete amenity
    const [result] = await pool.execute(
      'DELETE FROM amenities WHERE id = ?',
      [id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json(
        formatResponse(false, 'Amenity not found')
      );
    }

    res.json(
      formatResponse(true, 'Amenity deleted successfully')
    );

  } catch (error) {
    console.error('Delete amenity error:', error);
    res.status(500).json(
      formatResponse(false, 'Failed to delete amenity', null, error.message)
    );
  }
});

// Toggle amenity status
router.patch('/amenities/:id/toggle', validateId, async (req, res) => {
  try {
    const { id } = req.params;
    const { is_active } = req.body;

    if (typeof is_active !== 'boolean') {
      return res.status(400).json(
        formatResponse(false, 'is_active must be a boolean value')
      );
    }

    // Update amenity status
    const [result] = await pool.execute(
      'UPDATE amenities SET is_active = ? WHERE id = ?',
      [is_active ? 1 : 0, id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json(
        formatResponse(false, 'Amenity not found')
      );
    }

    res.json(
      formatResponse(true, `Amenity ${is_active ? 'activated' : 'deactivated'} successfully`)
    );

  } catch (error) {
    console.error('Toggle amenity status error:', error);
    res.status(500).json(
      formatResponse(false, 'Failed to update amenity status', null, error.message)
    );
  }
});

// =============================================
// PROPERTY TYPES MANAGEMENT
// =============================================

// Get all property types
router.get('/property-types', async (req, res) => {
  try {
    // Ensure icon_url column exists
    try {
      await pool.execute(`ALTER TABLE property_types ADD COLUMN IF NOT EXISTS icon_url VARCHAR(500) NULL`);
    } catch (e) { /* ignore */ }

    // Auto-seed is only done in the public list endpoint when the table is completely empty.
    // Do NOT re-seed here — admin may have renamed or deleted types intentionally.
    const [propertyTypes] = await pool.execute(`
      SELECT 
        pt.id, 
        pt.name, 
        pt.description, 
        pt.sort_order, 
        pt.is_active,
        pt.icon_url,
        pt.created_at, 
        pt.updated_at,
        (
          SELECT COUNT(*) 
          FROM properties p 
          WHERE LOWER(p.property_type) COLLATE utf8mb4_unicode_ci = LOWER(pt.name) COLLATE utf8mb4_unicode_ci
        ) as property_count
      FROM property_types pt
      ORDER BY pt.sort_order ASC, pt.name ASC
    `);

    res.json(
      formatResponse(true, 'Property types retrieved successfully', { propertyTypes })
    );

  } catch (error) {
    console.error('Get property types error:', error);
    res.status(500).json(
      formatResponse(false, 'Failed to retrieve property types', null, error.message)
    );
  }
});

// Create new property type
router.post('/property-types', async (req, res) => {
  try {
    const { name, description, sort_order, icon_url } = req.body;

    // Validate required fields
    if (!name) {
      return res.status(400).json(
        formatResponse(false, 'Name is required')
      );
    }

    // Check if property type already exists
    const [existing] = await pool.execute(
      'SELECT id FROM property_types WHERE name = ?',
      [name]
    );

    if (existing.length > 0) {
      return res.status(409).json(
        formatResponse(false, 'Property type with this name already exists')
      );
    }

    // Try to ensure icon_url column exists
    try {
      await pool.execute(`ALTER TABLE property_types ADD COLUMN IF NOT EXISTS icon_url VARCHAR(500) NULL`);
    } catch (e) {
      // Column may already exist or DB doesn't support IF NOT EXISTS - ignore
    }

    // Create property type
    let result;
    try {
      [result] = await pool.execute(
        'INSERT INTO property_types (name, description, sort_order, icon_url, created_at) VALUES (?, ?, ?, ?, NOW())',
        [name, description || null, sort_order || 0, icon_url || null]
      );
    } catch (e) {
      // Fallback if icon_url column doesn't exist
      [result] = await pool.execute(
        'INSERT INTO property_types (name, description, sort_order, created_at) VALUES (?, ?, ?, NOW())',
        [name, description || null, sort_order || 0]
      );
    }

    const propertyTypeId = result.insertId;

    // Get created property type
    const [newPropertyType] = await pool.execute(
      'SELECT * FROM property_types WHERE id = ?',
      [propertyTypeId]
    );

    // ✅ Clear cache so frontend sees new tab immediately
    clearPropertyTypesCache();

    res.status(201).json(
      formatResponse(true, 'Property type created successfully', { propertyType: newPropertyType[0] })
    );

  } catch (error) {
    console.error('Create property type error:', error);
    res.status(500).json(
      formatResponse(false, 'Failed to create property type', null, error.message)
    );
  }
});

// Update property type
router.put('/property-types/:id', validateId, async (req, res) => {
  try {
    const { id } = req.params;
    const { name, description, sort_order, is_active, icon_url } = req.body;

    // Validate required fields
    if (!name) {
      return res.status(400).json(
        formatResponse(false, 'Name is required')
      );
    }

    // Check if property type exists
    const [existing] = await pool.execute(
      'SELECT id FROM property_types WHERE id = ?',
      [id]
    );

    if (existing.length === 0) {
      return res.status(404).json(
        formatResponse(false, 'Property type not found')
      );
    }

    // Check if name already exists (excluding current property type)
    const [nameExists] = await pool.execute(
      'SELECT id FROM property_types WHERE name = ? AND id != ?',
      [name, id]
    );

    if (nameExists.length > 0) {
      return res.status(409).json(
        formatResponse(false, 'Property type with this name already exists')
      );
    }

    // Ensure icon_url column exists
    try {
      await pool.execute(`ALTER TABLE property_types ADD COLUMN IF NOT EXISTS icon_url VARCHAR(500) NULL`);
    } catch (e) {
      // Ignore - column may already exist
    }

    // Update property type
    const isActiveValue = is_active !== undefined ? (is_active === true || is_active === 1 || is_active === '1' ? 1 : 0) : 1;

    try {
      await pool.execute(
        'UPDATE property_types SET name = ?, description = ?, sort_order = ?, is_active = ?, icon_url = ? WHERE id = ?',
        [name, description || null, sort_order || 0, isActiveValue, icon_url || null, id]
      );
    } catch (e) {
      // Fallback without icon_url
      await pool.execute(
        'UPDATE property_types SET name = ?, description = ?, sort_order = ?, is_active = ? WHERE id = ?',
        [name, description || null, sort_order || 0, isActiveValue, id]
      );
    }

    // Get updated property type
    const [updatedPropertyType] = await pool.execute(
      'SELECT * FROM property_types WHERE id = ?',
      [id]
    );

    // ✅ Clear cache so frontend sees changes immediately
    clearPropertyTypesCache();

    res.json(
      formatResponse(true, 'Property type updated successfully', { propertyType: updatedPropertyType[0] })
    );

  } catch (error) {
    console.error('Update property type error:', error);
    res.status(500).json(
      formatResponse(false, 'Failed to update property type', null, error.message)
    );
  }
});

// Delete property type
router.delete('/property-types/:id', validateId, async (req, res) => {
  try {
    const { id } = req.params;

    // Check if property type exists
    const [existing] = await pool.execute(
      'SELECT id FROM property_types WHERE id = ?',
      [id]
    );

    if (existing.length === 0) {
      return res.status(404).json(
        formatResponse(false, 'Property type not found')
      );
    }

    // Check if property type is being used by any properties (collation-safe)
    const [usage] = await pool.execute(
      `
        SELECT COUNT(*) as count 
        FROM properties p 
        WHERE LOWER(p.property_type) COLLATE utf8mb4_unicode_ci = (
          SELECT LOWER(name) COLLATE utf8mb4_unicode_ci FROM property_types WHERE id = ?
        )
      `,
      [id]
    );

    if (usage[0].count > 0) {
      return res.status(400).json(
        formatResponse(false, 'Cannot delete property type. It is being used by properties.')
      );
    }

    // Delete property type
    const [result] = await pool.execute(
      'DELETE FROM property_types WHERE id = ?',
      [id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json(
        formatResponse(false, 'Property type not found')
      );
    }

    // ✅ Clear cache so frontend sees deletion immediately
    clearPropertyTypesCache();

    res.json(
      formatResponse(true, 'Property type deleted successfully')
    );

  } catch (error) {
    console.error('Delete property type error:', error);
    res.status(500).json(
      formatResponse(false, 'Failed to delete property type', null, error.message)
    );
  }
});

// Toggle property type status
router.patch('/property-types/:id/toggle', validateId, async (req, res) => {
  try {
    const { id } = req.params;
    const { is_active } = req.body;

    if (typeof is_active !== 'boolean') {
      return res.status(400).json(
        formatResponse(false, 'is_active must be a boolean value')
      );
    }

    // Update property type status
    const [result] = await pool.execute(
      'UPDATE property_types SET is_active = ? WHERE id = ?',
      [is_active ? 1 : 0, id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json(
        formatResponse(false, 'Property type not found')
      );
    }

    // ✅ Instantly clear cached property types so frontend sees changes immediately
    clearPropertyTypesCache();

    res.json(
      formatResponse(true, `Property type ${is_active ? 'activated' : 'deactivated'} successfully`)
    );

  } catch (error) {
    console.error('Toggle property type status error:', error);
    res.status(500).json(
      formatResponse(false, 'Failed to update property type status', null, error.message)
    );
  }
});

// Get all system settings
router.get('/settings', async (req, res) => {
  try {
    const [settings] = await pool.execute(`
      SELECT setting_key, setting_value, setting_type, description, is_public
      FROM system_settings
      ORDER BY setting_key
    `);

    // Convert array to object for easier frontend usage
    const settingsObj = {};
    settings.forEach(setting => {
      let value = setting.setting_value;

      // Convert value based on type
      if (setting.setting_type === 'number') {
        value = parseFloat(value);
      } else if (setting.setting_type === 'boolean') {
        value = value === 'true';
      } else if (setting.setting_type === 'json') {
        try {
          value = JSON.parse(value);
        } catch (e) {
          value = value;
        }
      }

      settingsObj[setting.setting_key] = {
        value,
        type: setting.setting_type,
        description: setting.description,
        is_public: setting.is_public
      };
    });

    res.json(
      formatResponse(true, 'Settings retrieved successfully', settingsObj)
    );

  } catch (error) {
    console.error('Get settings error:', error);
    res.status(500).json(
      formatResponse(false, 'Failed to retrieve settings', null, error.message)
    );
  }
});

// Update system settings
router.put('/settings', async (req, res) => {
  try {
    const { settings } = req.body;

    if (!settings || typeof settings !== 'object') {
      return res.status(400).json(
        formatResponse(false, 'Settings object is required')
      );
    }

    const updatePromises = [];

    for (const [key, settingData] of Object.entries(settings)) {
      let value = settingData.value;

      // Convert value to string for database storage
      if (typeof value === 'object') {
        value = JSON.stringify(value);
      } else if (typeof value === 'boolean') {
        value = value.toString();
      } else if (typeof value === 'number') {
        value = value.toString();
      }

      updatePromises.push(
        pool.execute(`
          INSERT INTO system_settings (setting_key, setting_value, setting_type, description, is_public)
          VALUES (?, ?, ?, ?, ?)
          ON DUPLICATE KEY UPDATE
          setting_value = VALUES(setting_value),
          updated_at = NOW()
        `, [
          key,
          value,
          settingData.type || 'string',
          settingData.description || '',
          settingData.is_public || false
        ])
      );
    }

    await Promise.all(updatePromises);

    res.json(
      formatResponse(true, 'Settings updated successfully')
    );

  } catch (error) {
    console.error('Update settings error:', error);
    res.status(500).json(
      formatResponse(false, 'Failed to update settings', null, error.message)
    );
  }
});

// Get public settings (for non-admin users) - No authentication required
router.get('/settings/public', async (req, res) => {
  try {
    const [settings] = await pool.execute(`
      SELECT setting_key, setting_value, setting_type
      FROM system_settings
      WHERE is_public = TRUE
      ORDER BY setting_key
    `);

    // Convert array to object for easier frontend usage
    const settingsObj = {};
    settings.forEach(setting => {
      let value = setting.setting_value;

      // Convert value based on type
      if (setting.setting_type === 'number') {
        value = parseFloat(value);
      } else if (setting.setting_type === 'boolean') {
        value = value === 'true';
      } else if (setting.setting_type === 'json') {
        try {
          value = JSON.parse(value);
        } catch (e) {
          value = value;
        }
      }

      settingsObj[setting.setting_key] = value;
    });

    res.json(
      formatResponse(true, 'Public settings retrieved successfully', settingsObj)
    );

  } catch (error) {
    console.error('Get public settings error:', error);
    res.status(500).json(
      formatResponse(false, 'Failed to retrieve public settings', null, error.message)
    );
  }
});

// Get admin analytics
router.get('/analytics', async (req, res) => {
  try {
    const { period = '30', startDate, endDate } = req.query;
    const days = parseInt(period) || 30;

    let dateWhere = '';
    const topPropsParams = [];

    if (startDate && endDate) {
      dateWhere = 'AND DATE(b.created_at) BETWEEN ? AND ?';
      topPropsParams.push(startDate, endDate);
    } else {
      dateWhere = 'AND b.created_at >= DATE_SUB(NOW(), INTERVAL ? DAY)';
      topPropsParams.push(days);
    }

    // Get basic statistics
    const [userStats] = await pool.execute(`
      SELECT 
        COUNT(*) as total_users,
        COUNT(CASE WHEN created_at >= DATE_SUB(NOW(), INTERVAL ? DAY) THEN 1 END) as new_users,
        COUNT(CASE WHEN user_type = 'guest' THEN 1 END) as guests,
        COUNT(CASE WHEN user_type = 'property_owner' THEN 1 END) as property_owners
      FROM users
      WHERE is_active = 1
    `, [days]);

    const [propertyStats] = await pool.execute(`
      SELECT 
        COUNT(*) as total_properties,
        COUNT(CASE WHEN created_at >= DATE_SUB(NOW(), INTERVAL ? DAY) THEN 1 END) as new_properties,
        COUNT(CASE WHEN status = 'active' THEN 1 END) as active_properties,
        COUNT(CASE WHEN status = 'pending_approval' THEN 1 END) as pending_properties
      FROM properties
    `, [days]);

    const [bookingStats] = await pool.execute(`
      SELECT 
        COUNT(*) as total_bookings,
        COUNT(CASE WHEN created_at >= DATE_SUB(NOW(), INTERVAL ? DAY) AND status != 'cancelled' THEN 1 END) as new_bookings,
        COUNT(CASE WHEN status = 'confirmed' THEN 1 END) as confirmed_bookings,
        SUM(CASE WHEN payment_status = 'paid' AND status != 'cancelled' THEN total_amount ELSE 0 END) as total_revenue
      FROM bookings
      WHERE status != 'cancelled'
    `, [days]);

    const [reviewStats] = await pool.execute(`
      SELECT 
        COUNT(*) as total_reviews,
        COUNT(CASE WHEN created_at >= DATE_SUB(NOW(), INTERVAL ? DAY) THEN 1 END) as new_reviews,
        COUNT(CASE WHEN status = 'pending' THEN 1 END) as pending_reviews,
        AVG(rating) as average_rating
      FROM reviews
    `, [days]);

    // Get Top Properties
    const [topProperties] = await pool.execute(`
      SELECT 
        p.id, p.title, p.city, 
        COUNT(b.id) as total_bookings, 
        COALESCE(SUM(b.total_amount), 0) as total_revenue
      FROM properties p
      LEFT JOIN bookings b ON p.id = b.property_id AND b.status != 'cancelled'
        ${dateWhere}
      GROUP BY p.id, p.title, p.city
      ORDER BY total_revenue DESC
      LIMIT 5
    `, topPropsParams);

    // Get Recent Activity
    const [recentActivity] = await pool.execute(`
      SELECT description, timestamp, type FROM (
        (SELECT 
          CONCAT('New booking #', b.booking_reference) as description,
          b.created_at as timestamp,
          'booking' as type
        FROM bookings b
        WHERE b.status != 'cancelled'
        ORDER BY b.created_at DESC LIMIT 5)
        UNION ALL
        (SELECT 
          CONCAT('New review for ', p.title) as description,
          r.created_at as timestamp,
          'review' as type
        FROM reviews r
        JOIN properties p ON r.property_id = p.id
        ORDER BY r.created_at DESC LIMIT 5)
      ) as combined
      ORDER BY timestamp DESC
      LIMIT 10
    `);

    // Format timestamps for activity
    const formattedActivity = recentActivity.map(item => ({
      ...item,
      timestamp: new Date(item.timestamp).toLocaleString()
    }));

    // Calculate Charts
    const [dailyData] = await pool.execute(`
      SELECT 
        DATE_FORMAT(created_at, '%b %d') as date_formatted,
        DATE(created_at) as raw_date,
        COUNT(id) as count,
        COALESCE(SUM(total_amount), 0) as amount
      FROM bookings
      WHERE created_at >= DATE_SUB(CURDATE(), INTERVAL ? DAY)
        AND status != 'cancelled' AND payment_status = 'paid'
      GROUP BY DATE(created_at), DATE_FORMAT(created_at, '%b %d')
      ORDER BY raw_date ASC
    `, [days]);

    const revenueChart = dailyData.map(d => ({ date: d.date_formatted, amount: parseFloat(d.amount) }));

    // Calculate User Growth Chart
    const [userData] = await pool.execute(`
      SELECT 
        DATE_FORMAT(created_at, '%b %d') as date_formatted,
        DATE(created_at) as raw_date,
        COUNT(id) as count
      FROM users
      WHERE created_at >= DATE_SUB(CURDATE(), INTERVAL ? DAY)
      GROUP BY DATE(created_at), DATE_FORMAT(created_at, '%b %d')
      ORDER BY raw_date ASC
    `, [days]);

    const userChart = userData.map(d => ({ date: d.date_formatted, count: parseInt(d.count) }));

    res.json(
      formatResponse(true, 'Analytics retrieved successfully', {
        users: userStats[0],
        properties: propertyStats[0],
        bookings: bookingStats[0],
        reviews: reviewStats[0],
        period: days,
        topProperties: topProperties,
        recentActivity: formattedActivity,
        revenueChart,
        userChart
      })
    );



  } catch (error) {
    console.error('Get admin analytics error:', error);
    res.status(500).json(
      formatResponse(false, 'Failed to retrieve analytics', null, error.message)
    );
  }
});

// Get booking payment history
router.get('/bookings/:id/payments', validateId, async (req, res) => {
  try {
    const { id } = req.params;

    // Check if booking exists
    const [bookings] = await pool.execute(`
      SELECT id FROM bookings WHERE id = ?
    `, [id]);

    if (bookings.length === 0) {
      return res.status(404).json(
        formatResponse(false, 'Booking not found')
      );
    }

    // Get payment history with DR/CR
    const [payments] = await pool.execute(`
      SELECT 
        id, payment_reference, payment_method, payment_type,
        amount, dr_amount, cr_amount, transaction_type, notes,
        status, payment_date, created_at
      FROM payments
      WHERE booking_id = ?
      ORDER BY created_at ASC
    `, [id]);

    // Calculate running balance for each transaction
    let runningBalance = 0;
    const paymentsWithBalance = payments.map(payment => {
      runningBalance += (parseFloat(payment.dr_amount || 0) - parseFloat(payment.cr_amount || 0));
      return {
        ...payment,
        running_balance: runningBalance
      };
    });

    res.json(
      formatResponse(true, 'Payment history retrieved successfully', {
        payments: paymentsWithBalance
      })
    );

  } catch (error) {
    console.error('Get payment history error:', error);
    res.status(500).json(
      formatResponse(false, 'Failed to retrieve payment history', null, error.message)
    );
  }
});

// Get accounting ledger with DR/CR
router.get('/accounting/ledger', async (req, res) => {
  try {
    const { view = 'all', entity_id, start_date, end_date } = req.query;

    let whereConditions = ['1=1'];
    let queryParams = [];

    // Date range filter
    if (start_date) {
      whereConditions.push('p.created_at >= ?');
      queryParams.push(start_date);
    }
    if (end_date) {
      whereConditions.push('p.created_at <= ?');
      queryParams.push(end_date + ' 23:59:59');
    }

    // Entity filter
    if (view === 'owner' && entity_id) {
      whereConditions.push('(po.user_id = ? OR po.id = ?)');
      queryParams.push(entity_id, entity_id);
    } else if (view === 'guest' && entity_id) {
      whereConditions.push('b.guest_id = ?');
      queryParams.push(entity_id);
    }

    const whereClause = whereConditions.length > 0 ? `WHERE ${whereConditions.join(' AND ')}` : '';

    // Get all transactions
    const [transactions] = await pool.execute(`
      SELECT 
        p.id, p.payment_reference, p.amount,
        p.dr_amount, p.cr_amount, p.transaction_type, p.notes,
        p.payment_method, p.status, p.created_at,
        b.id as booking_id, b.booking_reference, b.total_amount,
        pr.title as property_title,
        COALESCE(
          NULLIF(NULLIF(b.guest_name, ''), 'undefined undefined'),
          CONCAT(u.first_name, ' ', u.last_name)
        ) as guest_name,
        CONCAT(owner.first_name, ' ', owner.last_name) as owner_name
      FROM payments p
      JOIN bookings b ON p.booking_id = b.id
      JOIN properties pr ON b.property_id = pr.id
      JOIN users u ON b.guest_id = u.id
      JOIN property_owners po ON pr.owner_id = po.id
      JOIN users owner ON po.user_id = owner.id
      ${whereClause}
        AND b.status != 'cancelled'
      ORDER BY p.created_at ASC
    `, queryParams);

    // Calculate running balance
    let runningBalance = 0;
    const transactionsWithBalance = transactions.map(txn => {
      runningBalance += (parseFloat(txn.dr_amount || 0) - parseFloat(txn.cr_amount || 0));
      return {
        ...txn,
        running_balance: runningBalance
      };
    });

    // Calculate summary
    const totalDR = transactions.reduce((sum, txn) => sum + parseFloat(txn.dr_amount || 0), 0);
    const totalCR = transactions.reduce((sum, txn) => sum + parseFloat(txn.cr_amount || 0), 0);
    const totalGuestPayments = transactions
      .filter(txn => ['guest_payment', 'payment', 'security_deposit_claim'].includes(txn.transaction_type))
      .reduce((sum, txn) => sum + parseFloat(txn.cr_amount || 0), 0);
    const pendingGuestPayments = totalDR - totalGuestPayments;
    const outstanding = totalDR - totalCR;

    const uniqueBookings = new Set(transactions.map(txn => txn.booking_id));

    // Get admin commission summary
    const commissionQueryParams = [];
    const commissionWhereClause = ['ae.status = ?'];
    commissionQueryParams.push('active');

    if (start_date) {
      commissionWhereClause.push('ae.created_at >= ?');
      commissionQueryParams.push(start_date);
    }
    if (end_date) {
      commissionWhereClause.push('ae.created_at <= ?');
      commissionQueryParams.push(end_date + ' 23:59:59');
    }

    let commissionJoin = '';
    if (view === 'owner' && entity_id) {
      commissionJoin = 'JOIN properties pr ON b.property_id = pr.id JOIN property_owners po ON pr.owner_id = po.id';
      commissionWhereClause.push('(po.user_id = ? OR po.id = ?)');
      commissionQueryParams.push(entity_id, entity_id);
    } else if (view === 'guest' && entity_id) {
      commissionWhereClause.push('b.guest_id = ?');
      commissionQueryParams.push(entity_id);
    }

    const [commissionSummary] = await pool.execute(`
      SELECT 
        COALESCE(SUM(ae.commission_amount), 0) as total_commission_earned,
        COALESCE(SUM(CASE WHEN ae.payment_status = 'paid' THEN ae.net_commission ELSE 0 END), 0) as commission_paid,
        COALESCE(SUM(CASE WHEN ae.payment_status = 'pending' THEN ae.net_commission ELSE 0 END), 0) as commission_pending
      FROM admin_earnings ae
      JOIN bookings b ON ae.booking_id = b.id
      ${commissionJoin}
      WHERE ${commissionWhereClause.join(' AND ')}
        AND b.status != 'cancelled' AND b.payment_status = 'paid'
    `, commissionQueryParams);

    // Get owner earnings summary from admin_earnings (consistent with earnings dashboard)
    const ownerEarningsQueryParams = ['active'];
    const ownerEarningsWhereClause = ['ae.status = ?'];

    if (start_date) {
      ownerEarningsWhereClause.push('ae.created_at >= ?');
      ownerEarningsQueryParams.push(start_date);
    }
    if (end_date) {
      ownerEarningsWhereClause.push('ae.created_at <= ?');
      ownerEarningsQueryParams.push(end_date + ' 23:59:59');
    }

    let ownerEarningsJoin = '';
    if (view === 'owner' && entity_id) {
      ownerEarningsJoin = 'JOIN properties pr ON b.property_id = pr.id JOIN property_owners po ON pr.owner_id = po.id';
      ownerEarningsWhereClause.push('(po.user_id = ? OR po.id = ?)');
      ownerEarningsQueryParams.push(entity_id, entity_id);
    } else if (view === 'guest' && entity_id) {
      ownerEarningsWhereClause.push('b.guest_id = ?');
      ownerEarningsQueryParams.push(entity_id);
    }

    const [ownerEarningsSummary] = await pool.execute(`
      SELECT 
        COALESCE(SUM(ae.booking_total - ae.commission_amount), 0) as total_owner_earnings,
        COUNT(DISTINCT ae.booking_id) as total_bookings
      FROM admin_earnings ae
      JOIN bookings b ON ae.booking_id = b.id
      ${ownerEarningsJoin}
      WHERE ${ownerEarningsWhereClause.join(' AND ')}
        AND b.status != 'cancelled' AND b.payment_status = 'paid'
    `, ownerEarningsQueryParams);

    // Get owner payouts summary
    const payoutQueryParams = [];
    const payoutWhereClause = [];

    if (start_date) {
      payoutWhereClause.push('op.created_at >= ?');
      payoutQueryParams.push(start_date);
    }
    if (end_date) {
      payoutWhereClause.push('op.created_at <= ?');
      payoutQueryParams.push(end_date + ' 23:59:59');
    }

    let payoutJoin = '';
    if (view === 'owner' && entity_id) {
      payoutJoin = 'JOIN property_owners po ON op.property_owner_id = po.id';
      payoutWhereClause.push('(po.user_id = ? OR po.id = ?)');
      payoutQueryParams.push(entity_id, entity_id);
    } else if (view === 'guest' && entity_id) {
      payoutWhereClause.push('1=0');
    }

    const payoutWhereClauseStr = payoutWhereClause.length > 0 ? `WHERE ${payoutWhereClause.join(' AND ')}` : '';

    const [ownerPayoutsSummary] = await pool.execute(`
      SELECT 
        COALESCE(SUM(op.net_payout), 0) as total_payouts,
        COALESCE(SUM(CASE WHEN op.payment_status = 'completed' THEN op.net_payout ELSE 0 END), 0) as completed_payouts,
        COALESCE(SUM(CASE WHEN op.payment_status IN ('pending', 'processing') THEN op.net_payout ELSE 0 END), 0) as pending_payouts
      FROM owner_payouts op
      ${payoutJoin}
      ${payoutWhereClauseStr}
    `, payoutQueryParams);

    // Calculate owner outstanding = total owner share - what's already paid/in-progress
    const totalOwnerEarnings = parseFloat(ownerEarningsSummary[0]?.total_owner_earnings || 0);
    const totalPaidToOwners = parseFloat(ownerPayoutsSummary[0]?.completed_payouts || 0);
    const totalPendingPayouts = parseFloat(ownerPayoutsSummary[0]?.pending_payouts || 0);
    const computedOwnerOutstanding = Math.max(totalOwnerEarnings - totalPaidToOwners - totalPendingPayouts, 0);

    // Dummy ownerOutstandingSummary for compatibility
    const ownerOutstandingSummary = [{ total_outstanding: computedOwnerOutstanding, total_commission_pending: 0, total_owners: 0 }];

    res.json(
      formatResponse(true, 'Ledger retrieved successfully', {
        transactions: transactionsWithBalance,
        summary: {
          total_dr: totalDR,
          total_cr: totalCR,
          total_guest_payments: totalGuestPayments,
          pending_guest_payments: pendingGuestPayments,
          outstanding: outstanding,
          total_bookings: uniqueBookings.size,
          // New summary fields
          total_commission_earned: parseFloat(commissionSummary[0]?.total_commission_earned || 0),
          commission_paid: parseFloat(commissionSummary[0]?.commission_paid || 0),
          commission_pending: parseFloat(commissionSummary[0]?.commission_pending || 0),
          total_owner_earnings: parseFloat(ownerEarningsSummary[0]?.total_owner_earnings || 0),
          total_payouts_to_owners: parseFloat(ownerPayoutsSummary[0]?.completed_payouts || 0),
          pending_payouts_to_owners: parseFloat(ownerPayoutsSummary[0]?.pending_payouts || 0),
          total_owner_outstanding: parseFloat(ownerOutstandingSummary[0]?.total_outstanding || 0)
        }
      })
    );

  } catch (error) {
    console.error('Get ledger error:', error);
    res.status(500).json(
      formatResponse(false, 'Failed to retrieve ledger', null, error.message)
    );
  }
});

// Get owner-wise accounting summary
router.get('/accounting/owners', async (req, res) => {
  try {
    const [ownerSummary] = await pool.execute(`
      SELECT 
        po.id, po.business_name,
        CONCAT(u.first_name, ' ', u.last_name) as owner_name,
        u.email,
        COUNT(DISTINCT b.id) as total_bookings,
        SUM(b.total_amount) as total_revenue,
        COALESCE((
          SELECT SUM(cr_amount)
          FROM payments p
          JOIN bookings bk ON p.booking_id = bk.id
          JOIN properties pr ON bk.property_id = pr.id
          WHERE pr.owner_id = po.id AND bk.status != 'cancelled'
        ), 0) as total_received,
        (SUM(b.total_amount) - COALESCE((
          SELECT SUM(cr_amount)
          FROM payments p
          JOIN bookings bk ON p.booking_id = bk.id
          JOIN properties pr ON bk.property_id = pr.id
          WHERE pr.owner_id = po.id AND bk.status != 'cancelled'
        ), 0)) as outstanding
      FROM property_owners po
      JOIN users u ON po.user_id = u.id
      LEFT JOIN properties pr ON pr.owner_id = po.id
      LEFT JOIN bookings b ON b.property_id = pr.id AND b.status IN ('confirmed', 'checked_in', 'checked_out') AND b.status != 'cancelled' AND b.payment_status = 'paid'
      GROUP BY po.id, po.business_name, u.first_name, u.last_name, u.email
      ORDER BY total_revenue DESC
    `);

    res.json(
      formatResponse(true, 'Owner accounting summary retrieved successfully', {
        owners: ownerSummary
      })
    );

  } catch (error) {
    console.error('Get owner accounting error:', error);
    res.status(500).json(
      formatResponse(false, 'Failed to retrieve owner accounting', null, error.message)
    );
  }
});

// Get guest-wise accounting summary
router.get('/accounting/guests', async (req, res) => {
  try {
    const [guestSummary] = await pool.execute(`
      SELECT 
        u.id, 
        CONCAT(u.first_name, ' ', u.last_name) as guest_name,
        u.email,
        COUNT(b.id) as total_bookings,
        SUM(b.total_amount) as total_spent,
        COALESCE((
          SELECT SUM(cr_amount)
          FROM payments p
          WHERE p.booking_id IN (SELECT id FROM bookings WHERE guest_id = u.id AND status != 'cancelled')
        ), 0) as total_paid,
        (SUM(b.total_amount) - COALESCE((
          SELECT SUM(cr_amount)
          FROM payments p
          WHERE p.booking_id IN (SELECT id FROM bookings WHERE guest_id = u.id AND status != 'cancelled')
        ), 0)) as outstanding
      FROM users u
      JOIN bookings b ON b.guest_id = u.id
      WHERE u.user_type = 'guest' AND b.status != 'cancelled'
      GROUP BY u.id, u.first_name, u.last_name, u.email
      ORDER BY total_spent DESC
    `);

    res.json(
      formatResponse(true, 'Guest accounting summary retrieved successfully', {
        guests: guestSummary
      })
    );

  } catch (error) {
    console.error('Get guest accounting error:', error);
    res.status(500).json(
      formatResponse(false, 'Failed to retrieve guest accounting', null, error.message)
    );
  }
});

// Use earnings routes
router.use('/earnings', earningsRoutes);

// Use owner payout routes
router.use('/owner-payouts', ownerPayoutRoutes);

// =============================================
// REFUND MANAGEMENT
// =============================================

// Get all refund requests
router.get('/refunds', validatePagination, async (req, res) => {
  try {
    const { page = 1, limit = 10, status, search } = req.query;
    const offset = (page - 1) * limit;

    let whereConditions = [];
    let queryParams = [];

    if (status) {
      whereConditions.push('r.status = ?');
      queryParams.push(status);
    }

    if (search) {
      whereConditions.push('(b.booking_reference LIKE ? OR u.first_name LIKE ? OR p.title LIKE ?)');
      queryParams.push(`%${search}%`, `%${search}%`, `%${search}%`);
    }

    const whereClause = whereConditions.length > 0 ? `WHERE ${whereConditions.join(' AND ')}` : '';

    // Get total count
    const [countResult] = await pool.execute(`
      SELECT COUNT(*) as total 
      FROM refunds r
      JOIN bookings b ON r.booking_id = b.id
      JOIN users u ON b.guest_id = u.id
      JOIN properties p ON b.property_id = p.id
      ${whereClause}
    `, queryParams);

    const total = countResult[0].total;

    // Get refunds
    const [refunds] = await pool.execute(`
      SELECT 
        r.*,
        b.booking_reference, b.total_amount as booking_total,
        u.first_name as guest_first_name, u.last_name as guest_last_name, u.email as guest_email,
        p.title as property_title
      FROM refunds r
      JOIN bookings b ON r.booking_id = b.id
      JOIN users u ON b.guest_id = u.id
      JOIN properties p ON b.property_id = p.id
      ${whereClause}
      ORDER BY r.requested_at DESC
      LIMIT ? OFFSET ?
    `, [...queryParams, parseInt(limit), offset]);

    res.json(
      formatResponse(true, 'Refund requests retrieved successfully', {
        refunds,
        pagination: generatePagination(parseInt(page), parseInt(limit), total)
      })
    );

  } catch (error) {
    console.error('Get refunds error:', error);
    res.status(500).json(formatResponse(false, 'Failed to retrieve refund requests', null, error.message));
  }
});

// Approve refund
router.patch('/refunds/:id/approve', validateId, async (req, res) => {
  try {
    const { id } = req.params;
    const { notes } = req.body;

    // Get refund details and payment info
    const [refunds] = await pool.execute(`
      SELECT r.*, p.gateway_transaction_id, p.bank_tran_id, p.payment_method 
      FROM refunds r
      LEFT JOIN payments p ON r.payment_id = p.id
      WHERE r.id = ?
    `, [id]);

    if (refunds.length === 0) return res.status(404).json(formatResponse(false, 'Refund record not found'));
    
    const refund = refunds[0];
    if (refund.status !== 'pending') return res.status(400).json(formatResponse(false, 'Only pending refunds can be approved'));
    
    const refundRemarks = notes || refund.refund_reason || 'Admin Approved Refund';
    let gatewayResponseStr = null;
    let newStatus = 'processing';

    // Trigger actual refund via SSLCommerz using official sslcommerz-lts library
    if (refund.payment_method === 'sslcommerz' && refund.gateway_transaction_id) {
      try {
        const [sslConfig] = await pool.execute("SELECT store_id, store_password, is_live FROM payment_settings WHERE provider_name = 'sslcommerz'");
        if (sslConfig.length > 0) {
          const SSLCommerzPayment = require('sslcommerz-lts');
          const config = sslConfig[0];
          const isLive = Boolean(config.is_live);
          const sslcz = new SSLCommerzPayment(config.store_id, config.store_password, isLive);

          const refundData = {
            refund_amount: Number(parseFloat(refund.refund_amount).toFixed(2)),
            refund_remarks: String(refundRemarks).substring(0, 255),
            bank_tran_id: refund.bank_tran_id || refund.gateway_transaction_id,
            refe_id: String(refund.refund_reference).substring(0, 50),
          };

          console.log('--- SSL REFUND CALL (sslcommerz-lts) ---');
          console.log('Store ID:', config.store_id, '| isLive:', isLive);
          console.log('Refund Data:', refundData);

          const refundApiRes = await sslcz.initiateRefund(refundData);
          gatewayResponseStr = JSON.stringify(refundApiRes);
          console.log('SSL Refund Raw Response:', refundApiRes);

          const apiConnect = refundApiRes?.APIConnect || '';

          // Check for IP not whitelisted error
          if (apiConnect.startsWith('REQUEST_FROM_INVALID_SOURCE')) {
            const ip = apiConnect.replace('REQUEST_FROM_INVALID_SOURCE_', '');
            console.error('SSL IP NOT WHITELISTED:', ip);
            return res.status(400).json(formatResponse(false, 
              `SSL Gateway rejected request: Your server IP (${ip}) is not whitelisted. Please whitelist this IP in SSLCommerz panel.`,
              { gatewayResponse: refundApiRes, serverIp: ip }
            ));
          }

          // Check for authentication failure
          if (apiConnect === 'FAILED' || apiConnect === 'INACTIVE') {
            return res.status(400).json(formatResponse(false,
              `SSL Gateway authentication failed (${apiConnect}). Please check Store ID and Password.`,
              { gatewayResponse: refundApiRes }
            ));
          }

          // Check for successful refund initiation (APIConnect === 'DONE')
          if (apiConnect === 'DONE') {
            const refundStatus = refundApiRes?.status || '';
            const errorReason = refundApiRes?.errorReason || '';

            // Handle duplicate request within same minute - refund already submitted
            if (errorReason === 'FAILED_SAME_REQ_IN_SAME_MIN') {
              // Refund was already submitted to SSLCommerz, mark as processing
              newStatus = 'processing';
              console.log('ℹ️ SSL: Duplicate request in same minute - refund already submitted, marking as processing');
            } else if (refundStatus === 'success' || refundStatus === 'refunded') {
              newStatus = 'completed';
            } else if (refundStatus === 'processing') {
              newStatus = 'processing';
            } else if (refundStatus === 'failed') {
              return res.status(400).json(formatResponse(false, `SSL Gateway Error: ${errorReason || 'Refund failed at gateway'}`, { gatewayResponse: refundApiRes }));
            } else {
              // Unknown status but DONE connection - treat as processing
              newStatus = 'processing';
            }
          } else if (apiConnect.startsWith('FAILED_SAME_REQ')) {
            // Some versions return this at APIConnect level
            newStatus = 'processing';
            console.log('ℹ️ SSL: Duplicate request - marking as processing');
          } else {
            // Unrecognized APIConnect response
            return res.status(400).json(formatResponse(false,
              `Unexpected SSL Gateway response: ${apiConnect}`,
              { gatewayResponse: refundApiRes }
            ));
          }
        }
      } catch (sslErr) {
        console.error('SSL Refund Exception:', sslErr);
        return res.status(500).json(formatResponse(false, 'SSLCommerz connection error', null, sslErr.message));
      }
    }

    // Trigger actual refund via bKash gateway
    if (refund.payment_method === 'bkash') {
      try {
        const bookingId = refund.booking_id;

        // 1. Get bKash paymentID from payment_initiated row
        const [initiatedRows] = await pool.execute(`
          SELECT gateway_transaction_id FROM payments
          WHERE booking_id = ? AND transaction_type = 'payment_initiated' AND payment_method = 'bkash'
          ORDER BY id DESC LIMIT 1
        `, [bookingId]);

        // 2. Get bKash trxID from guest_payment row (stored in notes or gateway_transaction_id)
        const [guestPayRows] = await pool.execute(`
          SELECT gateway_transaction_id, notes FROM payments
          WHERE booking_id = ? AND transaction_type = 'guest_payment' AND payment_method = 'bkash'
          ORDER BY id DESC LIMIT 1
        `, [bookingId]);

        const bkashPaymentID = initiatedRows[0]?.gateway_transaction_id || null;

        // trxID may be in gateway_transaction_id (new payments) or extracted from notes (old payments)
        let bkashTrxID = guestPayRows[0]?.gateway_transaction_id || null;
        if (!bkashTrxID && guestPayRows[0]?.notes) {
          const match = guestPayRows[0].notes.match(/TXN:([A-Z0-9]+)/i);
          if (match) bkashTrxID = match[1];
        }

        const refundAmount = parseFloat(refund.refund_amount);

        console.log(`[ADMIN-REFUND] bKash — paymentID: ${bkashPaymentID}, trxID: ${bkashTrxID}, amount: ${refundAmount}`);

        if (!bkashPaymentID || !bkashTrxID) {
          console.warn('[ADMIN-REFUND] Missing bKash paymentID or trxID — marking as processing for manual follow-up');
          newStatus = 'processing';
          gatewayResponseStr = JSON.stringify({ error: `Missing bKash IDs — paymentID: ${bkashPaymentID}, trxID: ${bkashTrxID} — manual refund required` });
        } else {
          const bkashRefundResult = await bkashGateway.refundPayment(
            bkashPaymentID,
            refundAmount,
            bkashTrxID,
            refundRemarks
          );

          gatewayResponseStr = JSON.stringify(bkashRefundResult);
          console.log('[ADMIN-REFUND] bKash refund result:', bkashRefundResult);

          if (bkashRefundResult.success) {
            newStatus = 'completed';
          } else {
            return res.status(400).json(formatResponse(
              false,
              `bKash Refund Failed: ${bkashRefundResult.error || 'Unknown error'}`,
              { gatewayResponse: bkashRefundResult }
            ));
          }
        }
      } catch (bkashErr) {
        console.error('[ADMIN-REFUND] bKash refund exception:', bkashErr);
        return res.status(500).json(formatResponse(false, 'bKash refund connection error', null, bkashErr.message));
      }
    }

    // Update refund status in DB (ignoring 'notes' since it does not exist)
    await pool.execute(
      'UPDATE refunds SET status = ?, approved_at = NOW(), refund_reason = ?, gateway_response = ? WHERE id = ?',
      [newStatus, refundRemarks, gatewayResponseStr, id]
    );

    // If completed (auto-refunded), sync to HMS accounts
    if (newStatus === 'completed') {
      try {
        await syncRefundToHMSAccounts(id);
      } catch (hmsErr) {
        console.error('[ADMIN-REFUND] HMS Sync failed on approval:', hmsErr);
      }
      try {
        await sendRefundSms(refund.booking_id, refund.refund_amount, refundRemarks);
      } catch (smsErr) {
        console.error('[ADMIN-REFUND] Failed to send refund SMS on approval:', smsErr.message);
      }
    }

    res.json(formatResponse(true, `Refund ${newStatus === 'completed' ? 'processed' : 'approved'} successfully`));

  } catch (error) {
    console.error('Approve refund error:', error);
    res.status(500).json(formatResponse(false, 'Failed to approve refund', null, error.message));
  }
});

// Mark refund as completed
router.patch('/refunds/:id/complete', validateId, async (req, res) => {
  try {
    const { id } = req.params;
    const { transaction_id, notes } = req.body;

    // Get refund details
    const [refunds] = await pool.execute('SELECT * FROM refunds WHERE id = ?', [id]);
    if (refunds.length === 0) return res.status(404).json(formatResponse(false, 'Refund record not found'));
    
    const refund = refunds[0];
    if (refund.status !== 'processing') return res.status(400).json(formatResponse(false, 'Only approved/processing refunds can be marked as completed'));

    // Update refund status
    await pool.execute(
      'UPDATE refunds SET status = "completed", completed_at = NOW(), transaction_id = ?, notes = ? WHERE id = ?',
      [transaction_id || null, notes || refund.notes, id]
    );

    // Sync to HMS accounts
    try {
      await syncRefundToHMSAccounts(id);
    } catch (hmsErr) {
      console.error('[ADMIN-REFUND] HMS Sync failed on manual completion:', hmsErr);
    }

    try {
      await sendRefundSms(refund.booking_id, refund.refund_amount, notes || refund.notes || refund.refund_reason);
    } catch (smsErr) {
      console.error('[ADMIN-REFUND] Failed to send refund SMS on manual completion:', smsErr.message);
    }

    res.json(formatResponse(true, 'Refund marked as completed successfully'));

  } catch (error) {
    console.error('Complete refund error:', error);
    res.status(500).json(formatResponse(false, 'Failed to complete refund', null, error.message));
  }
});

// Reject refund
router.patch('/refunds/:id/reject', validateId, async (req, res) => {
  try {
    const { id } = req.params;
    const { notes } = req.body;

    // Get refund details
    const [refunds] = await pool.execute('SELECT * FROM refunds WHERE id = ?', [id]);
    if (refunds.length === 0) return res.status(404).json(formatResponse(false, 'Refund record not found'));
    
    const refund = refunds[0];
    if (refund.status !== 'pending') return res.status(400).json(formatResponse(false, 'Only pending refunds can be rejected'));

    // Update refund status
    await pool.execute(
      'UPDATE refunds SET status = "rejected", notes = ? WHERE id = ?',
      [notes || refund.notes, id]
    );

    res.json(formatResponse(true, 'Refund request rejected'));

  } catch (error) {
    console.error('Reject refund error:', error);
    res.status(500).json(formatResponse(false, 'Failed to reject refund', null, error.message));
  }
});

// Deduct from security deposit and initiate refund
router.post('/bookings/:id/security-deposit-deduction', validateId, async (req, res) => {
  try {
    const { id } = req.params;
    const { deduction_amount, reason, notes } = req.body;

    // Get booking details
    const [bookings] = await pool.execute('SELECT * FROM bookings WHERE id = ?', [id]);
    if (bookings.length === 0) return res.status(404).json(formatResponse(false, 'Booking not found'));
    
    const booking = bookings[0];
    if (booking.status !== 'checked_out') {
      return res.status(400).json(formatResponse(false, 'Security deposit can only be processed after check-out'));
    }

    const securityDeposit = parseFloat(booking.security_deposit || 0);
    const deduction = parseFloat(deduction_amount || 0);
    
    if (deduction > securityDeposit) {
      return res.status(400).json(formatResponse(false, 'Deduction cannot exceed security deposit amount'));
    }

    const refundAmount = securityDeposit - deduction;

    // Find payment id for refund
    const [payments] = await pool.execute("SELECT id FROM payments WHERE booking_id = ? AND status = 'completed' ORDER BY id DESC LIMIT 1", [id]);
    const paymentId = payments.length > 0 ? payments[0].id : 0;
    const refundRef = `SEC-REF-${Date.now()}-${id}`;

    // Create refund record
    await pool.execute(`
      INSERT INTO refunds (
        booking_id, payment_id, refund_reference, original_amount, refund_amount, net_refund,
        refund_reason, refund_type, cancellation_policy_applied, status, requested_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 'pending', NOW())
    `, [
        id, 
        paymentId, 
        refundRef, 
        securityDeposit, 
        refundAmount, 
        refundAmount, 
        deduction === 0 ? 'Security Deposit Release' : 'Security Deposit Return', 
        deduction === 0 ? 'full' : 'partial',
        deduction === 0 ? `Released. ${notes || ''}` : `Deduction: ৳${deduction}. Reason: ${reason || 'N/A'}. ${notes || ''}`
    ]);

    // Update booking to indicate security deposit processed and increase owner earnings
    const [result] = await pool.execute(
      `UPDATE bookings b
       JOIN properties p ON b.property_id = p.id
       SET b.security_deposit_status = "processed", 
           b.security_deposit_deduction_amount = ?,
           b.property_owner_earnings = b.property_owner_earnings + ?,
           b.updated_at = NOW() 
       WHERE b.id = ?`,
      [deduction, deduction, id]
    );

    if (deduction > 0) {
      // Get owner_id for balance update
      const [bookingDetails] = await pool.execute(`
        SELECT p.owner_id 
        FROM bookings b 
        JOIN properties p ON b.property_id = p.id 
        WHERE b.id = ?
      `, [id]);

      if (bookingDetails.length > 0) {
        const ownerId = bookingDetails[0].owner_id;
        
        // Update owner balance summary
        await pool.execute(`
          UPDATE owner_balances 
          SET total_earnings = total_earnings + ?,
              current_balance = current_balance + ?,
              last_updated = NOW()
          WHERE property_owner_id = ?
        `, [deduction, deduction, ownerId]);

        // Record a payment transaction for transparency
        await pool.execute(`
          INSERT INTO payments (
            booking_id, payment_reference, payment_method, payment_type,
            amount, dr_amount, cr_amount, transaction_type, notes,
            status, payment_date, created_at
          ) VALUES (?, ?, 'adjustment', 'credit', ?, ?, ?, 'security_deposit_claim', ?, 'completed', NOW(), NOW())
        `, [
          id,
          `CLAIM-${id}-${Date.now()}`,
          deduction,
          deduction, // dr_amount: add to guest's debt for the damage
          deduction, // cr_amount: add to host's received amount from deposit
          `Security deposit deduction credit to host: ${reason || 'N/A'}`
        ]);
      }
    }

    res.json(formatResponse(true, 'Security deposit processed successfully', {
      refundableAmount: refundAmount,
      deductionAmount: deduction
    }));

  } catch (error) {
    console.error('Security deposit deduction error:', error);
    res.status(500).json(formatResponse(false, 'Failed to process security deposit deduction', null, error.message));
  }
});

// Get security deposits list
router.get('/security-deposits', async (req, res) => {
  try {
    const { page = 1, limit = 10, status, search } = req.query;
    const offset = (parseInt(page) - 1) * parseInt(limit);

    let whereClause = 'WHERE b.security_deposit > 0 AND b.status = "checked_out"';
    const queryParams = [];

    if (status) {
      whereClause += ' AND b.security_deposit_status = ?';
      queryParams.push(status);
    }

    if (search) {
      whereClause += ' AND (b.booking_reference LIKE ? OR u.first_name LIKE ? OR u.last_name LIKE ? OR p.title LIKE ?)';
      const searchWildcard = `%${search}%`;
      queryParams.push(searchWildcard, searchWildcard, searchWildcard, searchWildcard);
    }

    // Get stats
    const [statsResult] = await pool.execute(`
      SELECT 
        COALESCE(SUM(CASE WHEN b.security_deposit_status IN ('pending', 'claim_requested') THEN b.security_deposit ELSE 0 END), 0) as total_held,
        COALESCE(SUM(CASE WHEN b.security_deposit_status = 'claim_requested' THEN 1 ELSE 0 END), 0) as pending_claims,
        COALESCE(SUM(CASE WHEN b.security_deposit_status = 'processed' THEN b.security_deposit_deduction_amount ELSE 0 END), 0) as total_claimed,
        COALESCE(SUM(CASE WHEN b.security_deposit_status = 'processed' THEN b.security_deposit - b.security_deposit_deduction_amount ELSE 0 END), 0) as total_released
      FROM bookings b
      JOIN properties p ON b.property_id = p.id
      JOIN users u ON b.guest_id = u.id
    `);
    const stats = statsResult[0];

    // Get total count
    const [countResult] = await pool.execute(`
      SELECT COUNT(DISTINCT b.id) as total
      FROM bookings b
      JOIN properties p ON b.property_id = p.id
      JOIN users u ON b.guest_id = u.id
      ${whereClause}
    `, queryParams);

    const total = countResult[0].total;

    // Get security deposits
    const [deposits] = await pool.execute(`
      SELECT 
        b.id,
        b.booking_reference,
        b.status as booking_status,
        b.payment_status,
        DATE_FORMAT(b.check_in_date, '%Y-%m-%d') as check_in_date,
        DATE_FORMAT(b.check_out_date, '%Y-%m-%d') as check_out_date,
        b.total_amount,
        b.security_deposit,
        b.security_deposit_status,
        b.security_deposit_claim_amount,
        b.security_deposit_deduction_amount,
        b.security_deposit_claim_reason,
        b.security_deposit_claim_at,
        p.id as property_id,
        p.title as property_title,
        u.first_name as guest_first_name,
        u.last_name as guest_last_name,
        u.email as guest_email,
        u.phone as guest_phone,
        u2.first_name as owner_first_name,
        u2.last_name as owner_last_name,
        u2.email as owner_email
      FROM bookings b
      JOIN properties p ON b.property_id = p.id
      JOIN users u ON b.guest_id = u.id
      JOIN property_owners po ON p.owner_id = po.id
      JOIN users u2 ON po.user_id = u2.id
      ${whereClause}
      ORDER BY 
        CASE WHEN b.security_deposit_status = 'claim_requested' THEN 1 ELSE 2 END,
        b.security_deposit_claim_at DESC, 
        b.check_out_date DESC
      LIMIT ? OFFSET ?
    `, [...queryParams, parseInt(limit), offset]);

    res.json(
      formatResponse(true, 'Security deposits retrieved successfully', {
        deposits,
        stats,
        pagination: generatePagination(parseInt(page), parseInt(limit), total)
      })
    );
  } catch (error) {
    console.error('Get security deposits error:', error);
    res.status(500).json(formatResponse(false, 'Failed to retrieve security deposits', null, error.message));
  }
});

// =============================================
// HMS MANAGEMENT
// =============================================

// Get all HMS packages
router.get('/hms/packages', async (req, res) => {
  try {
    const [packages] = await pool.execute('SELECT * FROM hms_packages ORDER BY created_at ASC');
    // Ensure features is parsed JSON
    packages.forEach(pkg => {
      try {
         pkg.features = typeof pkg.features === 'string' ? JSON.parse(pkg.features) : pkg.features;
      } catch(e) {
         pkg.features = []; 
      }
    });
    res.json(formatResponse(true, 'Packages retrieved successfully', packages));
  } catch (error) {
    console.error('Get packages error', error);
    res.status(500).json(formatResponse(false, 'Failed to get packages', null, error.message));
  }
});

// Create HMS Package
router.post('/hms/packages', async (req, res) => {
  try {
    const { name, price, billing_cycle, is_trial, duration_days, trial_days, features, is_active } = req.body;
    await pool.execute(
      'INSERT INTO hms_packages (name, price, billing_cycle, is_trial, duration_days, trial_days, features, is_active) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
      [name, price, billing_cycle || 'monthly', is_trial ? true : false, duration_days || 30, is_trial ? (trial_days || 14) : 0, JSON.stringify(features || []), is_active !== false]
    );
    res.json(formatResponse(true, 'Package created successfully'));
  } catch (error) {
    res.status(500).json(formatResponse(false, 'Failed to create package', null, error.message));
  }
});

// Update HMS Package
router.put('/hms/packages/:id', async (req, res) => {
  try {
    const { name, price, billing_cycle, is_trial, duration_days, trial_days, features, is_active } = req.body;
    await pool.execute(
      'UPDATE hms_packages SET name=?, price=?, billing_cycle=?, is_trial=?, duration_days=?, trial_days=?, features=?, is_active=? WHERE id=?',
      [name, price, billing_cycle || 'monthly', is_trial ? true : false, duration_days || 30, is_trial ? (trial_days || 14) : 0, JSON.stringify(features || []), is_active !== false, req.params.id]
    );
    res.json(formatResponse(true, 'Package updated successfully'));
  } catch (error) {
    console.error('PUT /hms/packages/:id Error:', error);
    res.status(500).json(formatResponse(false, 'Failed to update package', null, error.message));
  }
});

// Delete HMS Package
router.delete('/hms/packages/:id', async (req, res) => {
  try {
    await pool.execute('DELETE FROM hms_packages WHERE id=?', [req.params.id]);
    res.json(formatResponse(true, 'Package deleted successfully'));
  } catch (error) {
    res.status(500).json(formatResponse(false, 'Failed to delete package', null, error.message));
  }
});

// Toggle HMS Status manually
router.patch('/hms/toggle', async (req, res) => {
  try {
    const { host_id, status } = req.body;

    if (!['active', 'inactive', 'trialing', 'expired'].includes(status)) {
      return res.status(400).json(formatResponse(false, 'Invalid status'));
    }

    let extraUpdates = '';
    let pkgId = null;

    if (status === 'trialing') {
      const [tp] = await pool.execute('SELECT duration_days, id FROM hms_packages WHERE is_trial = true AND is_active = true ORDER BY duration_days DESC LIMIT 1');
      const trialDays = tp.length > 0 ? tp[0].duration_days : 14;
      pkgId = tp.length > 0 ? tp[0].id : null;
      extraUpdates = `, trial_started_at = NOW(), trial_ends_at = DATE_ADD(NOW(), INTERVAL ${trialDays} DAY)`;
    } else if (status === 'active') {
      const [ap] = await pool.execute('SELECT duration_days, id FROM hms_packages WHERE is_trial = false AND is_active = true ORDER BY price ASC LIMIT 1');
      const activeDays = ap.length > 0 ? ap[0].duration_days || 30 : 30;
      pkgId = ap.length > 0 ? ap[0].id : null;
      extraUpdates = `, subscription_ends_at = DATE_ADD(NOW(), INTERVAL ${activeDays} DAY)`;
    }

    if (pkgId) {
       extraUpdates += `, package_id = ${pkgId}`;
    }

    // Insert or update HMS sub
    const [existing] = await pool.execute('SELECT id FROM hms_subscriptions WHERE host_id = ?', [host_id]);
    
    if (existing.length > 0) {
      await pool.execute(
        `UPDATE hms_subscriptions SET status = ? ${extraUpdates} WHERE host_id = ?`,
        [status, host_id]
      );
    } else {
      let q = `INSERT INTO hms_subscriptions (host_id, status) VALUES (?, ?)`;
      if (status === 'trialing') {
         const tDays = extraUpdates.match(/INTERVAL (\d+) DAY/)?.[1] || 14;
         q = `INSERT INTO hms_subscriptions (host_id, status, trial_started_at, trial_ends_at${pkgId ? ', package_id' : ''}) VALUES (?, ?, NOW(), DATE_ADD(NOW(), INTERVAL ${tDays} DAY)${pkgId ? ', ' + pkgId : ''})`;
      } else if (status === 'active') {
         const aDays = extraUpdates.match(/INTERVAL (\d+) DAY/)?.[1] || 30;
         q = `INSERT INTO hms_subscriptions (host_id, status, subscription_ends_at${pkgId ? ', package_id' : ''}) VALUES (?, ?, DATE_ADD(NOW(), INTERVAL ${aDays} DAY)${pkgId ? ', ' + pkgId : ''})`;
      }
      await pool.execute(q, [host_id, status]);
    }

    const hasAccess = status === 'active' || status === 'trialing';
    await syncHmsAccessForHost(host_id, hasAccess);

    res.json(formatResponse(true, `HMS status updated to ${status} for host ${host_id}`));
  } catch (error) {
    console.error('Toggle HMS status error:', error);
    res.status(500).json(formatResponse(false, 'Failed to toggle HMS status', null, error.message));
  }
});

// Set HMS Trial Duration
router.post('/hms/trial', async (req, res) => {
  try {
    const { host_id, days } = req.body;
    
    if (!host_id || !days || isNaN(days)) {
      return res.status(400).json(formatResponse(false, 'Valid host_id and days are required'));
    }

    const [existing] = await pool.execute('SELECT id FROM hms_subscriptions WHERE host_id = ?', [host_id]);
    
    // Add days to now
    if (existing.length > 0) {
      await pool.execute(
        'UPDATE hms_subscriptions SET status = "trialing", trial_started_at = NOW(), trial_ends_at = DATE_ADD(NOW(), INTERVAL ? DAY), is_trial_used = TRUE WHERE host_id = ?',
        [days, host_id]
      );
    } else {
      await pool.execute(
        'INSERT INTO hms_subscriptions (host_id, status, trial_started_at, trial_ends_at, is_trial_used) VALUES (?, "trialing", NOW(), DATE_ADD(NOW(), INTERVAL ? DAY), TRUE)',
        [host_id, days]
      );
    }

    await syncHmsAccessForHost(host_id, true);

    res.json(formatResponse(true, `HMS trial activated for ${days} days for host ${host_id}`));
  } catch (error) {
    console.error('Set HMS trial error:', error);
    res.status(500).json(formatResponse(false, 'Failed to set HMS trial', null, error.message));
  }
});

// =============================================
// COUPONS MANAGEMENT
// =============================================

// Get all coupons
router.get('/coupons', async (req, res) => {
  try {
    const [coupons] = await pool.execute(`
      SELECT * FROM coupons 
      ORDER BY created_at DESC
    `);
    res.json(formatResponse(true, 'Coupons retrieved successfully', { coupons }));
  } catch (error) {
    console.error('Get coupons error:', error);
    res.status(500).json(formatResponse(false, 'Failed to retrieve coupons', null, error.message));
  }
});

// Create a coupon
router.post('/coupons', async (req, res) => {
  try {
    const { 
      code, name, description, discount_type, discount_value, 
      minimum_amount, maximum_discount, usage_limit, user_limit, 
      valid_from, valid_until, is_active 
    } = req.body;
    
    if (!code || !discount_type || !discount_value) {
      return res.status(400).json(formatResponse(false, 'Code, discount type, and discount value are required'));
    }

    const [result] = await pool.execute(`
      INSERT INTO coupons (
        code, name, description, discount_type, discount_value, 
        minimum_amount, maximum_discount, usage_limit, user_limit, 
        valid_from, valid_until, is_active, created_at, updated_at
      )
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW(), NOW())
    `, [
      code, name || null, description || null, discount_type, discount_value, 
      minimum_amount || 0, maximum_discount || null, usage_limit || null, user_limit || null, 
      valid_from || null, valid_until || null, is_active !== undefined ? is_active : 1
    ]);

    res.json(formatResponse(true, 'Coupon created successfully', { id: result.insertId }));
  } catch (error) {
    console.error('Create coupon error:', error);
    res.status(500).json(formatResponse(false, 'Failed to create coupon', null, error.message));
  }
});

// Update a coupon
router.put('/coupons/:id', validateId, async (req, res) => {
  try {
    const { id } = req.params;
    const { 
      code, name, description, discount_type, discount_value, 
      minimum_amount, maximum_discount, usage_limit, user_limit, 
      valid_from, valid_until, is_active 
    } = req.body;

    const [result] = await pool.execute(`
      UPDATE coupons 
      SET code = ?, name = ?, description = ?, discount_type = ?, discount_value = ?, 
          minimum_amount = ?, maximum_discount = ?, usage_limit = ?, user_limit = ?, 
          valid_from = ?, valid_until = ?, is_active = ?, updated_at = NOW()
      WHERE id = ?
    `, [
      code, name, description, discount_type, discount_value, 
      minimum_amount, maximum_discount, usage_limit, user_limit, 
      valid_from, valid_until, is_active, id
    ]);

    if (result.affectedRows === 0) {
      return res.status(404).json(formatResponse(false, 'Coupon not found'));
    }

    res.json(formatResponse(true, 'Coupon updated successfully'));
  } catch (error) {
    console.error('Update coupon error:', error);
    res.status(500).json(formatResponse(false, 'Failed to update coupon', null, error.message));
  }
});

// Delete a coupon
router.delete('/coupons/:id', validateId, async (req, res) => {
  try {
    const { id } = req.params;

    const [result] = await pool.execute('DELETE FROM coupons WHERE id = ?', [id]);

    if (result.affectedRows === 0) {
      return res.status(404).json(formatResponse(false, 'Coupon not found'));
    }

    res.json(formatResponse(true, 'Coupon deleted successfully'));
  } catch (error) {
    console.error('Delete coupon error:', error);
    res.status(500).json(formatResponse(false, 'Failed to delete coupon', null, error.message));
  }
});

// ===============================================
// BUS ADMIN ENDPOINTS: SCHEDULES, BOOKINGS & REPORTS
// ===============================================
router.get('/bus/schedules', async (req, res) => {
  try {
    const { operator, search } = req.query;
    let whereConditions = [];
    let queryParams = [];

    if (operator && operator !== 'All') {
      whereConditions.push('o.operator_code = ?');
      queryParams.push(operator);
    }
    if (search) {
      whereConditions.push('(o.operator_name LIKE ? OR s.from_city LIKE ? OR s.to_city LIKE ? OR s.bus_number LIKE ?)');
      queryParams.push(`%${search}%`, `%${search}%`, `%${search}%`, `%${search}%`);
    }

    const whereClause = whereConditions.length > 0 ? `WHERE ${whereConditions.join(' AND ')}` : '';

    const sql = `
      SELECT 
        s.*,
        o.operator_name,
        o.operator_code
      FROM bus_schedules s
      JOIN bus_operators o ON s.operator_id = o.id
      ${whereClause}
      ORDER BY s.id DESC
    `;

    const [rows] = await pool.query(sql, queryParams);

    const formatted = rows.map((r) => ({
      ...r,
      is_ac: Boolean(r.is_ac),
      is_active: Boolean(r.is_active),
      price_per_seat: parseFloat(r.price_per_seat),
      boarding_points: typeof r.boarding_points === 'string' ? JSON.parse(r.boarding_points) : r.boarding_points || [],
      dropping_points: typeof r.dropping_points === 'string' ? JSON.parse(r.dropping_points) : r.dropping_points || [],
    }));

    res.json(formatResponse(true, 'Bus schedules fetched successfully', formatted));
  } catch (error) {
    console.error('Admin get bus schedules error:', error);
    res.status(500).json(formatResponse(false, 'Failed to fetch bus schedules', null, error.message));
  }
});

router.post('/bus/schedules', async (req, res) => {
  try {
    const {
      operator_id,
      bus_number,
      bus_type,
      is_ac,
      from_city,
      to_city,
      departure_time,
      arrival_time,
      duration,
      price_per_seat,
      total_seats,
      seat_plan,
      boarding_points,
      dropping_points,
    } = req.body;

    if (!bus_number || !from_city || !to_city || !departure_time || !price_per_seat) {
      return res.status(400).json(formatResponse(false, 'Missing required bus schedule fields'));
    }

    const boardingJson = Array.isArray(boarding_points) ? JSON.stringify(boarding_points) : JSON.stringify([`${from_city} Counter`]);
    const droppingJson = Array.isArray(dropping_points) ? JSON.stringify(dropping_points) : JSON.stringify([`${to_city} Counter`]);

    const [result] = await pool.query(
      `INSERT INTO bus_schedules 
       (operator_id, bus_number, bus_type, is_ac, from_city, to_city, departure_time, arrival_time, duration, price_per_seat, total_seats, seat_plan, boarding_points, dropping_points, is_active)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 1)`,
      [
        operator_id || 1,
        bus_number,
        bus_type || 'AC Volvo',
        is_ac ? 1 : 0,
        from_city,
        to_city,
        departure_time,
        arrival_time || '06:00 AM',
        duration || '8h 00m',
        price_per_seat,
        total_seats || 40,
        seat_plan || '2x2',
        boardingJson,
        droppingJson,
      ]
    );

    res.json(
      formatResponse(true, 'Bus schedule declared successfully in MySQL', {
        id: result.insertId,
        bus_number,
        from_city,
        to_city,
      })
    );
  } catch (error) {
    console.error('Admin declare bus schedule error:', error);
    res.status(500).json(formatResponse(false, 'Failed to declare bus schedule', null, error.message));
  }
});

router.delete('/bus/schedules/:id', async (req, res) => {
  try {
    const { id } = req.params;
    await pool.query('DELETE FROM bus_schedules WHERE id = ?', [id]);
    res.json(formatResponse(true, 'Bus schedule deleted successfully'));
  } catch (error) {
    res.status(500).json(formatResponse(false, 'Failed to delete bus schedule', null, error.message));
  }
});

router.get('/bus/bookings', async (req, res) => {
  try {
    const { search, status } = req.query;
    let whereConditions = [];
    let queryParams = [];

    if (status && status !== 'All') {
      whereConditions.push('b.payment_status = ?');
      queryParams.push(status);
    }
    if (search) {
      whereConditions.push('(b.booking_ref LIKE ? OR b.passenger_name LIKE ? OR b.passenger_phone LIKE ?)');
      queryParams.push(`%${search}%`, `%${search}%`, `%${search}%`);
    }

    const whereClause = whereConditions.length > 0 ? `WHERE ${whereConditions.join(' AND ')}` : '';

    const sql = `
      SELECT 
        b.*,
        s.bus_number,
        s.bus_type,
        s.from_city,
        s.to_city,
        o.operator_name
      FROM bus_bookings b
      LEFT JOIN bus_schedules s ON b.schedule_id = s.id
      LEFT JOIN bus_operators o ON s.operator_id = o.id
      ${whereClause}
      ORDER BY b.id DESC
    `;

    const [rows] = await pool.query(sql, queryParams);

    const formatted = rows.map((r) => {
      let seats = [];
      try {
        seats = typeof r.seat_numbers === 'string' ? JSON.parse(r.seat_numbers) : r.seat_numbers || [];
      } catch (e) {
        seats = [r.seat_numbers];
      }
      return {
        ...r,
        seats,
        total_price: parseFloat(r.total_price),
      };
    });

    res.json(formatResponse(true, 'Bus bookings fetched successfully', formatted));
  } catch (error) {
    console.error('Admin get bus bookings error:', error);
    res.status(500).json(formatResponse(false, 'Failed to fetch bus bookings', null, error.message));
  }
});

router.get('/bus/reports', async (req, res) => {
  try {
    const [revenueRes] = await pool.query(`SELECT SUM(total_price) as total_revenue, COUNT(*) as total_bookings FROM bus_bookings WHERE payment_status = 'Paid'`);
    const [schedulesRes] = await pool.query(`SELECT COUNT(*) as total_schedules FROM bus_schedules WHERE is_active = 1`);
    const [operatorsRes] = await pool.query(`SELECT COUNT(*) as total_operators FROM bus_operators WHERE is_active = 1`);

    res.json(
      formatResponse(true, 'Bus reports generated successfully', {
        totalRevenue: parseFloat(revenueRes[0]?.total_revenue || 0),
        totalBookings: parseInt(revenueRes[0]?.total_bookings || 0),
        totalActiveSchedules: parseInt(schedulesRes[0]?.total_schedules || 0),
        totalOperators: parseInt(operatorsRes[0]?.total_operators || 0),
      })
    );
  } catch (error) {
    res.status(500).json(formatResponse(false, 'Failed to generate bus reports', null, error.message));
  }
});

module.exports = router;
