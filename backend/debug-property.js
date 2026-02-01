const { pool } = require('./config/database');

async function checkProperty() {
    try {
        const [columns] = await pool.execute('SHOW COLUMNS FROM properties');
        console.log('Columns:', columns.map(c => c.Field));

        const [rows] = await pool.execute('SELECT id, title, average_rating, total_reviews FROM properties WHERE id = 43');
        console.log('Property 43:', rows[0]);
    } catch (error) {
        console.error('Error:', error);
    } finally {
        process.exit();
    }
}

checkProperty();
