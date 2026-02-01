const mysql = require('mysql2/promise');
require('dotenv').config();

const pool = mysql.createPool({
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'keyhost_booking_system',
    port: process.env.DB_PORT || 3306,
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
});

async function checkOrphans() {
    try {
        console.log('Checking for properties with invalid owner_id...');

        const [orphans] = await pool.execute(`
      SELECT p.id, p.title, p.owner_id 
      FROM properties p 
      LEFT JOIN users u ON p.owner_id = u.id 
      WHERE u.id IS NULL
    `);

        if (orphans.length > 0) {
            console.log(`Found ${orphans.length} properties with invalid owner_id:`);
            orphans.forEach(p => {
                console.log(`- Property ID: ${p.id}, Title: "${p.title}", Owner ID: ${p.owner_id} (Missing in users table)`);
            });

            // Optional: fix them by assigning to a valid admin or deleting
            // For now just list them.
        } else {
            console.log('✅ All properties have valid owners.');
        }

        // Also check users table structure specifically for ID type
        const [columns] = await pool.execute(`
      SELECT COLUMN_NAME, COLUMN_TYPE, EXTRA 
      FROM INFORMATION_SCHEMA.COLUMNS 
      WHERE TABLE_SCHEMA = ? AND TABLE_NAME = 'users' AND COLUMN_NAME = 'id'
    `, [process.env.DB_NAME || 'keyhost_booking_system']);

        console.log('\nUsers ID column definition:', columns[0]);

    } catch (error) {
        console.error('Error:', error);
    } finally {
        pool.end();
    }
}

checkOrphans();
