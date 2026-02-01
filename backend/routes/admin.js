const express = require('express');
const { pool } = require('../config/database');
const { 
  formatResponse, 
  generatePagination 
} = require('../utils/helpers');
const { 
  validateId, 
  validatePagination 
} = require('../middleware/validation');
const { verifyToken, requireAdmin } = require('../middleware/auth');

const router = express.Router();

// Apply authentication and admin middleware to all routes
router.use(verifyToken);
router.use(requireAdmin);

// Get dashboard statistics
router.get('/dashboard', async (req, res) => {
  try {
    // Get total counts
    const [userCount] = await pool.execute('SELECT COUNT(*) as total FROM users WHERE is_active = 1');
    const [propertyCount] = await pool.execute('SELECT COUNT(*) as total FROM properties WHERE status = "active"');
    const [bookingCount] = await pool.execute('SELECT COUNT(*) as total FROM bookings');
    const [revenueResult] = await pool.execute('SELECT SUM(total_amount) as total FROM bookings WHERE payment_status = "paid"');

    // Get recent bookings
    const [recentBookings] = await pool.execute(`
      SELECT 
        b.id, b.booking_reference, b.total_amount, b.status, b.created_at,
        u.first_name, u.last_name,
        p.title as property_title
      FROM bookings b
      JOIN users u ON b.guest_id = u.id
      JOIN properties p ON b.property_id = p.id
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

    res.json(
      formatResponse(true, 'Dashboard data retrieved successfully', {
        statistics: {
          totalUsers: userCount[0].total,
          totalProperties: propertyCount[0].total,
          totalBookings: bookingCount[0].total,
          totalRevenue: revenueResult[0].total || 0
        },
        recentBookings,
        pendingReviews
      })
    );

  } catch (error) {
    console.error('Get dashboard error:', error);
    res.status(500).json(
      formatResponse(false, 'Failed to retrieve dashboard data', null, error.message)
    );
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
      whereConditions.push('(u.first_name LIKE ? OR u.last_name LIKE ? OR u.email LIKE ?)');
      queryParams.push(`%${search}%`, `%${search}%`, `%${search}%`);
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
        u.is_active, u.email_verified_at, u.last_login_at, u.created_at
      FROM users u
      ${whereClause}
      ORDER BY u.created_at DESC
      LIMIT ? OFFSET ?
    `, [...queryParams, parseInt(limit), offset]);

    const pagination = generatePagination(parseInt(page), parseInt(limit), total);

    res.json(
      formatResponse(true, 'Users retrieved successfully', {
        users,
        pagination
      })
    );

  } catch (error) {
    console.error('Get users error:', error);
    res.status(500).json(
      formatResponse(false, 'Failed to retrieve users', null, error.message)
    );
  }
});

// Get all properties
router.get('/properties', validatePagination, async (req, res) => {
  try {
    const { page = 1, limit = 10, status, search } = req.query;
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

    const pagination = generatePagination(parseInt(page), parseInt(limit), total);

    res.json(
      formatResponse(true, 'Properties retrieved successfully', {
        properties,
        pagination
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
    const { page = 1, limit = 10, status, search } = req.query;
    const offset = (page - 1) * limit;

    let whereConditions = [];
    let queryParams = [];

    if (status) {
      whereConditions.push('b.status = ?');
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

// Get pending reviews
router.get('/reviews/pending', validatePagination, async (req, res) => {
  try {
    const { page = 1, limit = 10 } = req.query;
    const offset = (page - 1) * limit;

    // Get total count
    const [countResult] = await pool.execute(
      'SELECT COUNT(*) as total FROM reviews WHERE status = "pending"'
    );

    const total = countResult[0].total;

    // Get pending reviews
    const [reviews] = await pool.execute(`
      SELECT 
        r.*,
        u.first_name, u.last_name,
        b.booking_reference,
        p.title as property_title
      FROM reviews r
      JOIN users u ON r.guest_id = u.id
      JOIN bookings b ON r.booking_id = b.id
      JOIN properties p ON r.property_id = p.id
      WHERE r.status = 'pending'
      ORDER BY r.created_at DESC
      LIMIT ? OFFSET ?
    `, [parseInt(limit), offset]);

    const pagination = generatePagination(parseInt(page), parseInt(limit), total);

    res.json(
      formatResponse(true, 'Pending reviews retrieved successfully', {
        reviews,
        pagination
      })
    );

  } catch (error) {
    console.error('Get pending reviews error:', error);
    res.status(500).json(
      formatResponse(false, 'Failed to retrieve pending reviews', null, error.message)
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

module.exports = router;
