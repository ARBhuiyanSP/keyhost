const express = require('express');
const router = express.Router();
const { pool } = require('../../config/database');
const { formatResponse } = require('../../utils/helpers');

// GET /api/guest/bus/search
// Search available bus schedules from MySQL database
router.get('/search', async (req, res) => {
  try {
    const { from, to, date, bus_type, operator } = req.query;

    let whereConditions = ['s.is_active = 1'];
    let queryParams = [];

    if (from) {
      whereConditions.push('LOWER(s.from_city) = LOWER(?)');
      queryParams.push(from);
    }
    if (to) {
      whereConditions.push('LOWER(s.to_city) = LOWER(?)');
      queryParams.push(to);
    }
    if (bus_type && bus_type !== 'All') {
      if (bus_type === 'AC') whereConditions.push('s.is_ac = 1');
      if (bus_type === 'Non-AC') whereConditions.push('s.is_ac = 0');
    }
    if (operator) {
      whereConditions.push('o.operator_code = ?');
      queryParams.push(operator);
    }

    const whereClause = whereConditions.length > 0 ? `WHERE ${whereConditions.join(' AND ')}` : '';

    const sql = `
      SELECT 
        s.id,
        s.bus_number,
        s.bus_type,
        s.is_ac,
        s.from_city,
        s.to_city,
        s.departure_time,
        s.arrival_time,
        s.duration,
        s.price_per_seat AS price,
        s.total_seats,
        s.boarding_points,
        s.dropping_points,
        o.operator_name,
        o.operator_code,
        o.logo_url
      FROM bus_schedules s
      JOIN bus_operators o ON s.operator_id = o.id
      ${whereClause}
      ORDER BY s.price_per_seat ASC
    `;

    const [schedules] = await pool.query(sql, queryParams);

    // Get booked seats for each schedule on the requested date
    const journeyDate = date || new Date().toISOString().split('T')[0];

    const mappedTrips = await Promise.all(
      schedules.map(async (item) => {
        let boardingPoints = [];
        let droppingPoints = [];

        try {
          boardingPoints = typeof item.boarding_points === 'string' ? JSON.parse(item.boarding_points) : item.boarding_points || [];
          droppingPoints = typeof item.dropping_points === 'string' ? JSON.parse(item.dropping_points) : item.dropping_points || [];
        } catch (e) {
          boardingPoints = [item.from_city + ' Counter'];
          droppingPoints = [item.to_city + ' Counter'];
        }

        // Fetch already booked seats for this date
        const [bookings] = await pool.query(
          `SELECT seat_numbers FROM bus_bookings WHERE schedule_id = ? AND journey_date = ? AND booking_status != 'Cancelled'`,
          [item.id, journeyDate]
        );

        let bookedSeats = [];
        bookings.forEach((b) => {
          try {
            const seats = typeof b.seat_numbers === 'string' ? JSON.parse(b.seat_numbers) : b.seat_numbers;
            if (Array.isArray(seats)) bookedSeats.push(...seats);
          } catch (e) {
            if (b.seat_numbers) bookedSeats.push(...b.seat_numbers.split(',').map((s) => s.trim()));
          }
        });

        return {
          id: `TRIP-${item.id}`,
          schedule_id: item.id,
          operator_name: item.operator_name,
          operator_code: item.operator_code,
          bus_type: item.bus_type,
          is_ac: Boolean(item.is_ac),
          from_city: item.from_city,
          to_city: item.to_city,
          departure_time: item.departure_time,
          arrival_time: item.arrival_time,
          duration: item.duration,
          price: parseFloat(item.price),
          total_seats: item.total_seats,
          booked_seats: bookedSeats,
          boarding_points: boardingPoints,
          dropping_points: droppingPoints,
          rating: 4.8,
        };
      })
    );

    res.json(formatResponse(true, 'Bus schedules retrieved successfully', mappedTrips));
  } catch (error) {
    console.error('Search bus error:', error);
    res.status(500).json(formatResponse(false, 'Failed to retrieve bus schedules', null, error.message));
  }
});

// POST /api/guest/bus/book
// Create new bus ticket booking in MySQL database
router.post('/book', async (req, res) => {
  try {
    const { schedule_id, passenger_name, passenger_phone, passenger_email, seat_numbers, total_price, boarding_point, dropping_point, journey_date } = req.body;

    if (!passenger_name || !passenger_phone || !seat_numbers || seat_numbers.length === 0) {
      return res.status(400).json(formatResponse(false, 'Missing required booking parameters'));
    }

    const bookingRef = `BUS-${Math.floor(100000 + Math.random() * 900000)}`;

    const [result] = await pool.query(
      `INSERT INTO bus_bookings 
       (booking_ref, schedule_id, passenger_name, passenger_phone, passenger_email, seat_numbers, total_price, boarding_point, dropping_point, journey_date, payment_status, booking_status)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'Paid', 'Confirmed')`,
      [
        bookingRef,
        schedule_id || 1,
        passenger_name,
        passenger_phone,
        passenger_email || null,
        JSON.stringify(seat_numbers),
        total_price,
        boarding_point,
        dropping_point,
        journey_date || new Date().toISOString().split('T')[0],
      ]
    );

    res.json(
      formatResponse(true, 'Bus ticket booked successfully in MySQL database', {
        id: result.insertId,
        bookingRef,
        passenger_name,
        total_price,
      })
    );
  } catch (error) {
    console.error('Bus booking error:', error);
    res.status(500).json(formatResponse(false, 'Failed to complete bus booking', null, error.message));
  }
});

module.exports = router;
