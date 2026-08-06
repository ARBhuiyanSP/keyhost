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

                // Safe parsing to avoid timezone shift on toISOString() 
                const sYear = start.getFullYear();
                const sMonth = String(start.getMonth() + 1).padStart(2, '0');
                const sDay = String(start.getDate()).padStart(2, '0');
                const formattedStart = `${sYear}-${sMonth}-${sDay}`;

                const eYear = end.getFullYear();
                const eMonth = String(end.getMonth() + 1).padStart(2, '0');
                const eDay = String(end.getDate()).padStart(2, '0');
                const formattedEnd = `${eYear}-${eMonth}-${eDay}`;

                // Calculate duration in days
                const nights = Math.ceil((end - start) / (1000 * 60 * 60 * 24));
                
                // OTAs like Airbnb often send massive 1-year to 3-year "Not available" blocks 
                // for dates beyond their booking window. We skip those to avoid locking the entire calendar.
                if (nights > 100) {
                    console.log(`Skipping massive external event (${nights} nights) for property ${propertyId}`);
                    continue;
                }

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
