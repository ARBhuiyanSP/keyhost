const { pool } = require('../config/database');

async function checkData() {
    try {
        const [rows] = await pool.query('SELECT id, room_number, images FROM hms_rooms LIMIT 5');
        console.log(JSON.stringify(rows, null, 2));
    } catch (error) {
        console.error('Error:', error);
    } finally {
        process.exit();
    }
}

checkData();
