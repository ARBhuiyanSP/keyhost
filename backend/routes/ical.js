const express = require('express');
const router = express.Router();
const { pool } = require('../config/database');
const icalGenerator = require('ical-generator').default;
const { syncExternalCalendar } = require('../utils/icalSync');
const { verifyToken } = require('../middleware/auth'); // Optionally require owner auth

// 1. Add new external calendar link
router.post('/import', verifyToken, async (req, res) => {
    const { propertyId, providerName, icalUrl } = req.body;

    if (!propertyId || !providerName || !icalUrl) {
        return res.status(400).json({ success: false, message: 'Missing required fields' });
    }

    let connection;
    try {
        connection = await pool.getConnection();

        // Check ownership (optional but recommended)
        const [prop] = await connection.query('SELECT owner_id FROM properties WHERE id = ?', [propertyId]);
        if (prop.length === 0) return res.status(404).json({ success: false, message: 'Property not found' });

        if (prop[0].owner_id !== req.user.id && req.user.role !== 'admin') {
            return res.status(403).json({ success: false, message: 'Unauthorized access to this property' });
        }

        const [result] = await connection.query(
            'INSERT INTO external_calendars (property_id, provider_name, ical_url) VALUES (?, ?, ?)',
            [propertyId, providerName, icalUrl]
        );

        const newCalendarId = result.insertId;

        // Perform initial sync immediately
        await syncExternalCalendar(newCalendarId, propertyId, icalUrl, providerName);

        res.status(201).json({ success: true, message: 'Calendar added and synced successfully', id: newCalendarId });
    } catch (error) {
        console.error('Error adding iCal:', error);
        res.status(500).json({ success: false, message: 'Server error adding calendar' });
    } finally {
        if (connection) connection.release();
    }
});

// 2. Get all external calendars for a property
router.get('/calendars/:propertyId', verifyToken, async (req, res) => {
    let connection;
    try {
        connection = await pool.getConnection();
        const [calendars] = await connection.query(
            'SELECT id, provider_name, ical_url, last_sync, created_at FROM external_calendars WHERE property_id = ?',
            [req.params.propertyId]
        );
        res.json({ success: true, calendars });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Server error fetching calendars' });
    } finally {
        if (connection) connection.release();
    }
});

// 3. Delete an external calendar
router.delete('/calendars/:id', verifyToken, async (req, res) => {
    let connection;
    try {
        connection = await pool.getConnection();
        // optionally verify ownership first
        await connection.query('DELETE FROM external_calendars WHERE id = ?', [req.params.id]);
        res.json({ success: true, message: 'Calendar removed successfully' });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Server error removing calendar' });
    } finally {
        if (connection) connection.release();
    }
});

// 4. Export Keyhost bookings to iCal (Publicly accessible by Airbnb/Booking.com)
// Note: We do NOT use verifyToken here because external platforms need to read it freely
router.get('/export/:propertyId', async (req, res) => {
    let connection;
    try {
        const { propertyId } = req.params;
        connection = await pool.getConnection();

        const [property] = await connection.query('SELECT name FROM properties WHERE id = ?', [propertyId]);
        if (property.length === 0) {
            return res.status(404).send('Property not found');
        }

        const calendar = icalGenerator({ name: `Keyhost Sync - ${property[0].name}` });

        // Get all active bookings for this property (internal and external)
        const [bookings] = await connection.query(`
            SELECT check_in_date, check_out_date, booking_reference, source, guest_name 
            FROM bookings 
            WHERE property_id = ? AND status IN ('confirmed', 'checked_in')
        `, [propertyId]);

        for (const booking of bookings) {
            calendar.createEvent({
                start: booking.check_in_date,
                end: booking.check_out_date, // Booking.com/Airbnb end dates on checkout day are exclusive
                summary: `Booked (${booking.source || 'Internal'})`,
                description: `Reservation ${booking.booking_reference}`,
                id: booking.booking_reference,
                allDay: true
            });
        }

        calendar.serve(res);

    } catch (error) {
        console.error('Error exporting iCal:', error);
        res.status(500).send('Server error generating iCal');
    } finally {
        if (connection) connection.release();
    }
});

module.exports = router;
