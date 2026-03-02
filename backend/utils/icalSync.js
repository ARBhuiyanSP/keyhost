const ical = require('node-ical');
const { pool } = require('../config/database');
const crypto = require('crypto');

async function syncExternalCalendar(calendarId, propertyId, icalUrl, providerName) {
    let connection;
    try {
        console.log(`Starting sync for calendar ${calendarId} (${providerName}) - Property ${propertyId}`);
        connection = await pool.getConnection();

        const webEvents = await ical.async.fromURL(icalUrl);
        let syncedCount = 0;

        for (const event of Object.values(webEvents)) {
            if (event.type === 'VEVENT') {
                const uid = event.uid;
                const start = new Date(event.start);
                const end = new Date(event.end);

                const formattedStart = start.toISOString().split('T')[0];
                const formattedEnd = end.toISOString().split('T')[0];

                const [existing] = await connection.query(
                    `SELECT id FROM bookings WHERE external_booking_id = ? AND property_id = ?`,
                    [uid, propertyId]
                );

                if (existing.length === 0) {
                    const bookingRef = 'EXT-' + crypto.randomBytes(4).toString('hex').toUpperCase();

                    const query = `
                        INSERT INTO bookings (
                            booking_reference, guest_id, property_id, check_in_date, check_out_date,
                            number_of_guests, base_price, total_amount, status, payment_status,
                            source, external_booking_id, guest_name
                        ) VALUES (?, NULL, ?, ?, ?, 1, 0, 0, 'confirmed', 'paid', ?, ?, ?)
                    `;

                    const eventSummary = event.summary || `External Booking (${providerName})`;

                    await connection.query(query, [
                        bookingRef, propertyId, formattedStart, formattedEnd, providerName, uid, eventSummary
                    ]);

                    syncedCount++;
                }
            }
        }

        await connection.query(
            `UPDATE external_calendars SET last_sync = NOW() WHERE id = ? `,
            [calendarId]
        );

        console.log(`Finished sync for calendar ${calendarId}.Synced ${syncedCount} new events.`);
    } catch (error) {
        console.error(`Error syncing calendar ${calendarId}: `, error.message);
    } finally {
        if (connection) connection.release();
    }
}

async function syncAllExternalCalendars() {
    let connection;
    try {
        console.log('Starting global calendar sync...');
        connection = await pool.getConnection();
        const [calendars] = await connection.query(`SELECT id, property_id, provider_name, ical_url FROM external_calendars`);

        for (const cal of calendars) {
            await syncExternalCalendar(cal.id, cal.property_id, cal.ical_url, cal.provider_name);
        }
        console.log('Global calendar sync finished.');
    } catch (error) {
        console.error('Error in global calendar sync:', error);
    } finally {
        if (connection) connection.release();
    }
}

module.exports = {
    syncAllExternalCalendars,
    syncExternalCalendar
};
