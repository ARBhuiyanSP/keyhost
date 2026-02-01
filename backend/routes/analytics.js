const express = require('express');
const { pool } = require('../config/database');
const { formatResponse } = require('../utils/helpers');
const { verifyToken, requirePropertyOwner } = require('../middleware/auth');

const router = express.Router();

// Get property owner analytics
router.get('/owner', verifyToken, requirePropertyOwner, async (req, res) => {
  try {
    const { days = 30 } = req.query;
    const userId = req.user.id;

    // Calculate date range
    const endDate = new Date();
    const startDate = new Date();
    startDate.setDate(endDate.getDate() - parseInt(days));

    // Get total revenue
    const [revenueResult] = await pool.execute(`
      SELECT 
        COALESCE(SUM(total_amount), 0) as total_revenue,
        COUNT(*) as total_bookings
      FROM bookings b
      JOIN properties p ON b.property_id = p.id
      WHERE p.owner_id = ? 
        AND b.status IN ('confirmed', 'checked_in', 'checked_out')
        AND b.created_at >= ?
    `, [userId, startDate]);

    // Get previous period for comparison
    const prevStartDate = new Date(startDate);
    prevStartDate.setDate(prevStartDate.getDate() - parseInt(days));
    
    const [prevRevenueResult] = await pool.execute(`
      SELECT 
        COALESCE(SUM(total_amount), 0) as total_revenue,
        COUNT(*) as total_bookings
      FROM bookings b
      JOIN properties p ON b.property_id = p.id
      WHERE p.owner_id = ? 
        AND b.status IN ('confirmed', 'checked_in', 'checked_out')
        AND b.created_at >= ? AND b.created_at < ?
    `, [userId, prevStartDate, startDate]);

    // Get average rating
    const [ratingResult] = await pool.execute(`
      SELECT 
        COALESCE(AVG(rating), 0) as average_rating,
        COUNT(*) as total_reviews
      FROM reviews r
      JOIN properties p ON r.property_id = p.id
      WHERE p.owner_id = ?
    `, [userId]);

    // Get occupancy rate
    const [occupancyResult] = await pool.execute(`
      SELECT 
        COUNT(DISTINCT DATE(check_in_date)) as occupied_nights,
        COUNT(DISTINCT p.id) * ? as total_available_nights
      FROM bookings b
      JOIN properties p ON b.property_id = p.id
      WHERE p.owner_id = ? 
        AND b.status IN ('confirmed', 'checked_in', 'checked_out')
        AND b.check_in_date >= ?
    `, [parseInt(days), userId, startDate]);

    // Get top performing properties
    const [topPropertiesResult] = await pool.execute(`
      SELECT 
        p.id,
        p.title,
        p.city,
        COUNT(b.id) as bookings,
        COALESCE(SUM(b.total_amount), 0) as revenue
      FROM properties p
      LEFT JOIN bookings b ON p.id = b.property_id 
        AND b.status IN ('confirmed', 'checked_in', 'checked_out')
        AND b.created_at >= ?
      WHERE p.owner_id = ?
      GROUP BY p.id, p.title, p.city
      ORDER BY revenue DESC
      LIMIT 5
    `, [startDate, userId]);

    // Get recent bookings
    const [recentBookingsResult] = await pool.execute(`
      SELECT 
        b.id,
        b.booking_reference,
        p.title as property_title,
        CONCAT(b.guest_first_name, ' ', b.guest_last_name) as guest_name,
        b.total_amount as amount,
        b.created_at
      FROM bookings b
      JOIN properties p ON b.property_id = p.id
      WHERE p.owner_id = ?
      ORDER BY b.created_at DESC
      LIMIT 10
    `, [userId]);

    // Get revenue chart data
    const [revenueChartResult] = await pool.execute(`
      SELECT 
        DATE(b.created_at) as date,
        COALESCE(SUM(b.total_amount), 0) as amount
      FROM bookings b
      JOIN properties p ON b.property_id = p.id
      WHERE p.owner_id = ? 
        AND b.status IN ('confirmed', 'checked_in', 'checked_out')
        AND b.created_at >= ?
      GROUP BY DATE(b.created_at)
      ORDER BY date
    `, [userId, startDate]);

    // Get booking chart data
    const [bookingChartResult] = await pool.execute(`
      SELECT 
        DATE(b.created_at) as date,
        COUNT(*) as count
      FROM bookings b
      JOIN properties p ON b.property_id = p.id
      WHERE p.owner_id = ? 
        AND b.created_at >= ?
      GROUP BY DATE(b.created_at)
      ORDER BY date
    `, [userId, startDate]);

    // Calculate changes
    const currentRevenue = revenueResult[0].total_revenue || 0;
    const prevRevenue = prevRevenueResult[0].total_revenue || 0;
    const revenueChange = prevRevenue > 0 ? ((currentRevenue - prevRevenue) / prevRevenue) * 100 : 0;

    const currentBookings = revenueResult[0].total_bookings || 0;
    const prevBookings = prevRevenueResult[0].total_bookings || 0;
    const bookingsChange = prevBookings > 0 ? ((currentBookings - prevBookings) / prevBookings) * 100 : 0;

    const occupancyRate = occupancyResult[0].total_available_nights > 0 
      ? (occupancyResult[0].occupied_nights / occupancyResult[0].total_available_nights) * 100 
      : 0;

    const analytics = {
      totalRevenue: currentRevenue,
      totalBookings: currentBookings,
      averageRating: parseFloat(ratingResult[0]?.average_rating || 0).toFixed(1),
      occupancyRate: occupancyRate.toFixed(1),
      revenueChange: revenueChange.toFixed(1),
      bookingsChange: bookingsChange.toFixed(1),
      ratingChange: 0, // Would need historical data
      occupancyChange: 0, // Would need historical data
      topProperties: topPropertiesResult,
      recentBookings: recentBookingsResult,
      revenueChart: revenueChartResult,
      bookingChart: bookingChartResult,
      localGuests: 70, // Mock data
      internationalGuests: 30,
      businessTravelers: 40,
      directBookings: 60,
      otaBookings: 30,
      referralBookings: 10,
      avgStayDuration: 3.2,
      repeatGuestRate: 25,
      cancellationRate: 8
    };

    res.json(formatResponse(true, 'Analytics retrieved successfully', analytics));
  } catch (error) {
    console.error('Analytics error:', error);
    res.status(500).json(formatResponse(false, 'Failed to retrieve analytics'));
  }
});

module.exports = router;
