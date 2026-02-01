const mysql = require('mysql2/promise');
require('dotenv').config();

const pool = mysql.createPool({
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'keyhost_booking_system',
    port: process.env.DB_PORT || 3306,
    waitForConnections: true,
    connectionLimit: 10
});

async function fixOrphans() {
    try {
        console.log('Finding properties with orphaned owners...');

        // Find a valid property owner to re-assign to, or use a default one like Admin (id 1)
        // First, let's see if ID 1 exists and is admin/owner
        const [users] = await pool.execute('SELECT id, first_name FROM users WHERE id = 1');
        let fallbackId;

        if (users.length > 0) {
            fallbackId = users[0].id;
            console.log(`Using fallback user ID: ${fallbackId} (${users[0].first_name})`);
        } else {
            // Find ANY valid user
            const [anyUsers] = await pool.execute('SELECT id FROM users LIMIT 1');
            if (anyUsers.length > 0) {
                fallbackId = anyUsers[0].id;
                console.log(`Using fallback user ID: ${fallbackId}`);
            } else {
                console.error('No users found in database! Cannot fix properties.');
                return;
            }
        }

        // Update
        const [result] = await pool.execute(`
      UPDATE properties p
      LEFT JOIN users u ON p.owner_id = u.id
      SET p.owner_id = ?
      WHERE u.id IS NULL
    `, [fallbackId]);

        console.log(`Updated ${result.affectedRows} properties to belong to user ID ${fallbackId}.`);

    } catch (error) {
        console.error('Error fixing orphans:', error);
    } finally {
        await pool.end();
    }
}

fixOrphans();
