const { pool } = require('../config/database.js');

async function updateRoom() {
    try {
        const [bRows] = await pool.query('SELECT hms_room_id FROM bookings WHERE id = 166');
        if (bRows.length > 0 && bRows[0].hms_room_id) {
            await pool.query('UPDATE hms_rooms SET status = "dirty" WHERE id = ?', [bRows[0].hms_room_id]);
            console.log('Successfully updated room status to dirty for booking 166.');
        }
        process.exit(0);
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
}

updateRoom();
