const { pool } = require('../config/database');

async function stats() {
    try {
        const [rows] = await pool.execute('SELECT property_type, status, COUNT(*) as count FROM properties GROUP BY property_type, status');
        console.table(rows);
    } catch (e) {
        console.error(e);
    } finally {
        await pool.end();
    }
}
stats();
