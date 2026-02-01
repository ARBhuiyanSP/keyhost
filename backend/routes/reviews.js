const express = require('express');
const { pool } = require('../config/database');
const { 
  formatResponse, 
  generatePagination 
} = require('../utils/helpers');
const { 
  validateReview, 
  validateId, 
  validatePropertyId,
  validatePagination 
} = require('../middleware/validation');
const { verifyToken, optionalAuth } = require('../middleware/auth');

const router = express.Router();

// Create review
router.post('/', verifyToken, validateReview, async (req, res) => {
  try {
    const {
      booking_id,
      rating,
      title,
      comment,
      cleanliness_rating,
      communication_rating,
      check_in_rating,
      accuracy_rating,
      location_rating,
      value_rating
    } = req.body;

    // Check if booking exists and belongs to user
    const [bookings] = await pool.execute(`
      SELECT b.*, p.title as property_title
      FROM bookings b
      JOIN properties p ON b.property_id = p.id
      WHERE b.id = ? AND b.guest_id = ? AND b.status = 'checked_out'
    `, [booking_id, req.user.id]);

    if (bookings.length === 0) {
      return res.status(404).json(
        formatResponse(false, 'Booking not found or not eligible for review')
      );
    }

    const booking = bookings[0];

    // Check if review already exists
    const [existingReviews] = await pool.execute(
      'SELECT id FROM reviews WHERE booking_id = ?',
      [booking_id]
    );

    if (existingReviews.length > 0) {
      return res.status(409).json(
        formatResponse(false, 'Review already exists for this booking')
      );
    }

    // Create review
    const [result] = await pool.execute(`
      INSERT INTO reviews (
        booking_id, guest_id, property_id, rating, title, comment,
        cleanliness_rating, communication_rating, check_in_rating,
        accuracy_rating, location_rating, value_rating,
        status, created_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'pending', NOW())
    `, [
      booking_id, req.user.id, booking.property_id, rating, title, comment,
      cleanliness_rating, communication_rating, check_in_rating,
      accuracy_rating, location_rating, value_rating
    ]);

    const reviewId = result.insertId;

    // Get created review
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
      WHERE r.id = ?
    `, [reviewId]);

    res.status(201).json(
      formatResponse(true, 'Review submitted successfully', { review: reviews[0] })
    );

  } catch (error) {
    console.error('Create review error:', error);
    res.status(500).json(
      formatResponse(false, 'Failed to submit review', null, error.message)
    );
  }
});

// Get reviews for a property
router.get('/property/:propertyId', optionalAuth, validatePropertyId, validatePagination, async (req, res) => {
  try {
    const { propertyId } = req.params;
    const { page = 1, limit = 10 } = req.query;
    const offset = (page - 1) * limit;

    // Get total count
    const [countResult] = await pool.execute(
      'SELECT COUNT(*) as total FROM reviews WHERE property_id = ? AND status = "approved" AND is_public = 1',
      [propertyId]
    );

    const total = countResult[0].total;

    // Get reviews
    const [reviews] = await pool.execute(`
      SELECT 
        r.id, r.rating, r.title, r.comment, r.created_at,
        r.cleanliness_rating, r.communication_rating, r.check_in_rating,
        r.accuracy_rating, r.location_rating, r.value_rating,
        r.host_response, r.host_response_date,
        u.first_name, u.last_name, u.profile_image
      FROM reviews r
      JOIN users u ON r.guest_id = u.id
      WHERE r.property_id = ? AND r.status = 'approved' AND r.is_public = 1
      ORDER BY r.created_at DESC
      LIMIT ? OFFSET ?
    `, [propertyId, parseInt(limit), offset]);

    const pagination = generatePagination(parseInt(page), parseInt(limit), total);

    res.json(
      formatResponse(true, 'Reviews retrieved successfully', {
        reviews,
        pagination
      })
    );

  } catch (error) {
    console.error('Get property reviews error:', error);
    res.status(500).json(
      formatResponse(false, 'Failed to retrieve reviews', null, error.message)
    );
  }
});

// Get user's reviews
router.get('/my-reviews', verifyToken, validatePagination, async (req, res) => {
  try {
    const { page = 1, limit = 10 } = req.query;
    const offset = (page - 1) * limit;

    // Get total count
    const [countResult] = await pool.execute(
      'SELECT COUNT(*) as total FROM reviews WHERE guest_id = ?',
      [req.user.id]
    );

    const total = countResult[0].total;

    // Get reviews
    const [reviews] = await pool.execute(`
      SELECT 
        r.*,
        b.booking_reference,
        b.check_in_date,
        b.check_out_date,
        p.title as property_title,
        p.city as property_city
      FROM reviews r
      JOIN bookings b ON r.booking_id = b.id
      JOIN properties p ON r.property_id = p.id
      WHERE r.guest_id = ?
      ORDER BY r.created_at DESC
      LIMIT ? OFFSET ?
    `, [req.user.id, parseInt(limit), offset]);

    const pagination = generatePagination(parseInt(page), parseInt(limit), total);

    res.json(
      formatResponse(true, 'Reviews retrieved successfully', {
        reviews,
        pagination
      })
    );

  } catch (error) {
    console.error('Get user reviews error:', error);
    res.status(500).json(
      formatResponse(false, 'Failed to retrieve reviews', null, error.message)
    );
  }
});

// Get single review
router.get('/:id', optionalAuth, validateId, async (req, res) => {
  try {
    const { id } = req.params;

    const [reviews] = await pool.execute(`
      SELECT 
        r.*,
        u.first_name, u.last_name, u.profile_image,
        b.booking_reference,
        p.title as property_title,
        p.city as property_city
      FROM reviews r
      JOIN users u ON r.guest_id = u.id
      JOIN bookings b ON r.booking_id = b.id
      JOIN properties p ON r.property_id = p.id
      WHERE r.id = ? AND r.status = 'approved' AND r.is_public = 1
    `, [id]);

    if (reviews.length === 0) {
      return res.status(404).json(
        formatResponse(false, 'Review not found')
      );
    }

    res.json(
      formatResponse(true, 'Review retrieved successfully', { review: reviews[0] })
    );

  } catch (error) {
    console.error('Get review error:', error);
    res.status(500).json(
      formatResponse(false, 'Failed to retrieve review', null, error.message)
    );
  }
});

// Update review (only if pending)
router.put('/:id', verifyToken, validateId, async (req, res) => {
  try {
    const { id } = req.params;
    const { rating, title, comment, cleanliness_rating, communication_rating, check_in_rating, accuracy_rating, location_rating, value_rating } = req.body;

    // Check if review exists and belongs to user
    const [reviews] = await pool.execute(
      'SELECT id, status FROM reviews WHERE id = ? AND guest_id = ?',
      [id, req.user.id]
    );

    if (reviews.length === 0) {
      return res.status(404).json(
        formatResponse(false, 'Review not found or access denied')
      );
    }

    if (reviews[0].status !== 'pending') {
      return res.status(400).json(
        formatResponse(false, 'Cannot update approved or rejected review')
      );
    }

    // Update review
    await pool.execute(`
      UPDATE reviews SET 
        rating = ?, title = ?, comment = ?,
        cleanliness_rating = ?, communication_rating = ?, check_in_rating = ?,
        accuracy_rating = ?, location_rating = ?, value_rating = ?,
        updated_at = NOW()
      WHERE id = ?
    `, [
      rating, title, comment, cleanliness_rating, communication_rating,
      check_in_rating, accuracy_rating, location_rating, value_rating, id
    ]);

    res.json(
      formatResponse(true, 'Review updated successfully')
    );

  } catch (error) {
    console.error('Update review error:', error);
    res.status(500).json(
      formatResponse(false, 'Failed to update review', null, error.message)
    );
  }
});

// Delete review (only if pending)
router.delete('/:id', verifyToken, validateId, async (req, res) => {
  try {
    const { id } = req.params;

    // Check if review exists and belongs to user
    const [reviews] = await pool.execute(
      'SELECT id, status FROM reviews WHERE id = ? AND guest_id = ?',
      [id, req.user.id]
    );

    if (reviews.length === 0) {
      return res.status(404).json(
        formatResponse(false, 'Review not found or access denied')
      );
    }

    if (reviews[0].status !== 'pending') {
      return res.status(400).json(
        formatResponse(false, 'Cannot delete approved or rejected review')
      );
    }

    // Delete review
    await pool.execute(
      'DELETE FROM reviews WHERE id = ?',
      [id]
    );

    res.json(
      formatResponse(true, 'Review deleted successfully')
    );

  } catch (error) {
    console.error('Delete review error:', error);
    res.status(500).json(
      formatResponse(false, 'Failed to delete review', null, error.message)
    );
  }
});

module.exports = router;
