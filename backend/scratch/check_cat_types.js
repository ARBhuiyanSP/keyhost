const { pool } = require('../config/database');

async function check() {
    try {
        const [rows] = await pool.execute(`
            SELECT p.id, p.property_type, dc.name as category_name 
            FROM properties p 
            JOIN display_category_properties dcp ON p.id = dcp.property_id 
            JOIN display_categories dc ON dcp.display_category_id = dc.id 
            WHERE p.status = 'active'
        `);
        console.table(rows);
    } catch (e) {
        console.error(e);
    } finally {
        await pool.end();
    }
}
check();
