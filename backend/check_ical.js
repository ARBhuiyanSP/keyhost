const { pool } = require('./config/database');
const icalGenerator = require('ical-generator').default;

async function testExport() {
    let connection;
    try {
        const propertyId = 34; // Try property 1
        connection = await pool.getConnection();

        const [property] = await connection.query('SELECT title FROM properties WHERE id = ?', [propertyId]);
        if (property.length === 0) {
            console.log('Property not found');
            return;
        }

        const calendar = icalGenerator({ name: `Keyhost Sync - ${property[0].title}` });

        const [bookings] = await connection.query(`
            SELECT check_in_date, check_out_date, booking_reference, source, guest_name 
            FROM bookings 
            WHERE property_id = ? AND status IN ('request_accepted', 'confirmed', 'checked_in')
        `, [propertyId]);

        for (const booking of bookings) {
            calendar.createEvent({
                start: booking.check_in_date,
                end: booking.check_out_date,
                summary: `Booked (${booking.source || 'Internal'})`,
                description: `Reservation ${booking.booking_reference}`,
                id: booking.booking_reference,
                allDay: true
            });
        }

        let icalString = calendar.toString();
        icalString = icalString.replace(/\r?\n/g, '\r\n');
        
        console.log('SUCCESS:\n' + icalString.substring(0, 100) + '...');
    } catch (error) {
        console.error('ERROR:', error);
    } finally {
        if (connection) connection.release();
        pool.end();
    }
}
testExport();
