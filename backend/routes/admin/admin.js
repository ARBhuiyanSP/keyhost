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

const router = express.Router();

// Import earnings routes
const earningsRoutes = require('./admin-earnings');
const ownerPayoutRoutes = require('./admin-owner-payouts');

// Apply authentication and admin middleware to all routes
router.use(verifyToken);
router.use(requireAdmin);

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
    const { page = 1, limit = 10, status, search, featured } = req.query;
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
    const [countResult] = await pool.execute(`
      SELECT COUNT(*) as total 
      FROM reviews r
      JOIN users u ON r.guest_id = u.id
      JOIN bookings b ON r.booking_id = b.id
      JOIN properties p ON r.property_id = p.id
      ${whereClause}
    `, queryParams);

    const total = countResult[0].total;

    // Get reviews
    const [reviews] = await pool.execute(`
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
    `, [...queryParams, parseInt(limit), offset]);

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
    const { first_name, last_name, email, phone, user_type } = req.body;

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
    const [result] = await pool.execute(
      `UPDATE users 
       SET first_name = ?, last_name = ?, email = ?, phone = ?, user_type = ?, updated_at = NOW() 
       WHERE id = ?`,
      [first_name, last_name, email, phone || null, user_type, id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json(
        formatResponse(false, 'User not found')
      );
    }

    // Get updated user data
    const [updatedUser] = await pool.execute(
      'SELECT id, first_name, last_name, email, phone, user_type, is_active, created_at FROM users WHERE id = ?',
      [id]
    );

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
    const [propertyTypes] = await pool.execute(`
      SELECT 
        pt.id, 
        pt.name, 
        pt.description, 
        pt.sort_order, 
        pt.is_active, 
        pt.created_at, 
        pt.updated_at,
        (
          SELECT COUNT(*) 
          FROM properties p 
          WHERE LOWER(p.property_type) COLLATE utf8mb4_unicode_ci = LOWER(pt.name) COLLATE utf8mb4_unicode_ci
        ) as property_count
      FROM property_types pt
      ORDER BY pt.sort_order, pt.name
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
    const { name, description, sort_order } = req.body;

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

    // Create property type
    const [result] = await pool.execute(
      'INSERT INTO property_types (name, description, sort_order, created_at) VALUES (?, ?, ?, NOW())',
      [name, description || null, sort_order || 0]
    );

    const propertyTypeId = result.insertId;

    // Get created property type
    const [newPropertyType] = await pool.execute(
      'SELECT * FROM property_types WHERE id = ?',
      [propertyTypeId]
    );

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
    const { name, description, sort_order, is_active } = req.body;

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

    // Update property type
    const isActiveValue = is_active !== undefined ? (is_active === true || is_active === 1 || is_active === '1' ? 1 : 0) : 1;

    const [result] = await pool.execute(
      'UPDATE property_types SET name = ?, description = ?, sort_order = ?, is_active = ? WHERE id = ?',
      [name, description || null, sort_order || 0, isActiveValue, id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json(
        formatResponse(false, 'Property type not found')
      );
    }

    // Get updated property type
    const [updatedPropertyType] = await pool.execute(
      'SELECT * FROM property_types WHERE id = ?',
      [id]
    );

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
    const { period = '30' } = req.query;
    const days = parseInt(period);

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
        SUM(CASE WHEN status = 'confirmed' THEN total_amount ELSE 0 END) as total_revenue
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
      LEFT JOIN bookings b ON p.id = b.property_id AND b.status = 'confirmed'
      GROUP BY p.id, p.title, p.city
      ORDER BY total_revenue DESC
      LIMIT 5
    `);

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

    res.json(
      formatResponse(true, 'Analytics retrieved successfully', {
        users: userStats[0],
        properties: propertyStats[0],
        bookings: bookingStats[0],
        reviews: reviewStats[0],
        period: days,
        topProperties: topProperties,
        recentActivity: formattedActivity
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
      whereConditions.push('po.user_id = ?');
      queryParams.push(entity_id);
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

    const [commissionSummary] = await pool.execute(`
      SELECT 
        COALESCE(SUM(ae.commission_amount), 0) as total_commission_earned,
        COALESCE(SUM(CASE WHEN ae.payment_status = 'paid' THEN ae.net_commission ELSE 0 END), 0) as commission_paid,
        COALESCE(SUM(CASE WHEN ae.payment_status = 'pending' THEN ae.net_commission ELSE 0 END), 0) as commission_pending
      FROM admin_earnings ae
      JOIN bookings b ON ae.booking_id = b.id
      WHERE ${commissionWhereClause.join(' AND ')}
        AND b.status != 'cancelled'
    `, commissionQueryParams);

    // Get owner earnings summary
    const ownerEarningsQueryParams = [];
    const ownerEarningsWhereClause = ['b.status IN (?, ?, ?)'];
    ownerEarningsQueryParams.push('confirmed', 'checked_in', 'checked_out');

    if (start_date) {
      ownerEarningsWhereClause.push('b.created_at >= ?');
      ownerEarningsQueryParams.push(start_date);
    }
    if (end_date) {
      ownerEarningsWhereClause.push('b.created_at <= ?');
      ownerEarningsQueryParams.push(end_date + ' 23:59:59');
    }

    const [ownerEarningsSummary] = await pool.execute(`
      SELECT 
        COALESCE(SUM(b.property_owner_earnings), 0) as total_owner_earnings,
        COUNT(DISTINCT b.id) as total_bookings
      FROM bookings b
      JOIN properties pr ON b.property_id = pr.id
      WHERE ${ownerEarningsWhereClause.join(' AND ')}
        AND b.status != 'cancelled'
    `, ownerEarningsQueryParams);

    // Get owner payouts summary
    const payoutQueryParams = [];
    const payoutWhereClause = [];

    if (start_date) {
      payoutWhereClause.push('created_at >= ?');
      payoutQueryParams.push(start_date);
    }
    if (end_date) {
      payoutWhereClause.push('created_at <= ?');
      payoutQueryParams.push(end_date + ' 23:59:59');
    }

    const payoutWhereClauseStr = payoutWhereClause.length > 0 ? `WHERE ${payoutWhereClause.join(' AND ')}` : '';

    const [ownerPayoutsSummary] = await pool.execute(`
      SELECT 
        COALESCE(SUM(net_payout), 0) as total_payouts,
        COALESCE(SUM(CASE WHEN payment_status = 'completed' THEN net_payout ELSE 0 END), 0) as completed_payouts,
        COALESCE(SUM(CASE WHEN payment_status IN ('pending', 'processing') THEN net_payout ELSE 0 END), 0) as pending_payouts
      FROM owner_payouts
      ${payoutWhereClauseStr}
    `, payoutQueryParams);

    // Get owner outstanding balances
    const [ownerOutstandingSummary] = await pool.execute(`
      SELECT 
        COALESCE(SUM(current_balance), 0) as total_outstanding,
        COALESCE(SUM(commission_pending), 0) as total_commission_pending,
        COUNT(*) as total_owners
      FROM owner_balances
      WHERE current_balance > 0
    `);

    res.json(
      formatResponse(true, 'Ledger retrieved successfully', {
        transactions: transactionsWithBalance,
        summary: {
          total_dr: totalDR,
          total_cr: totalCR,
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
      LEFT JOIN bookings b ON b.property_id = pr.id AND b.status IN ('confirmed', 'checked_in', 'checked_out') AND b.status != 'cancelled'
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

module.exports = router;
