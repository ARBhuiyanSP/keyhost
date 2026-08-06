const express = require('express');
const router = express.Router();
const { pool } = require('../../config/database');
const { formatResponse } = require('../../utils/helpers');

// GET /api/admin/bus/schedules
// Fetch all declared bus schedules
router.get('/schedules', async (req, res) => {
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

// POST /api/admin/bus/schedules
// Declare / Create a new bus schedule
router.post('/schedules', async (req, res) => {
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

// DELETE /api/admin/bus/schedules/:id
router.delete('/schedules/:id', async (req, res) => {
  try {
    const { id } = req.params;
    await pool.query('DELETE FROM bus_schedules WHERE id = ?', [id]);
    res.json(formatResponse(true, 'Bus schedule deleted successfully'));
  } catch (error) {
    res.status(500).json(formatResponse(false, 'Failed to delete bus schedule', null, error.message));
  }
});

// GET /api/admin/bus/bookings
// Fetch all passenger bus reservations
router.get('/bookings', async (req, res) => {
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

// GET /api/admin/bus/reports
// Financial & analytics report for Bus Ticketing
router.get('/reports', async (req, res) => {
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
