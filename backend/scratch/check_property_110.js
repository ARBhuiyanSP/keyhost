const { pool } = require('../config/database');

async function checkProperty110() {
    try {
        const [rows] = await pool.query('SELECT id, title FROM properties WHERE id = 110 OR id = 68 LIMIT 5');
        console.log('Property DB Rows:', JSON.stringify(rows, null, 2));

        const [imgRows] = await pool.query('SELECT * FROM property_images WHERE property_id = 110 OR property_id = 68 LIMIT 10');
        console.log('property_images table rows:', JSON.stringify(imgRows, null, 2));

        process.exit(0);
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
}

checkProperty110();
