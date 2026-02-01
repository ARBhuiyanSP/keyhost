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

async function migrateMessages() {
    try {
        console.log('Checking messages table...');

        // Check if conversation_id column exists
        const [columns] = await pool.execute(`
      SELECT COLUMN_NAME 
      FROM INFORMATION_SCHEMA.COLUMNS 
      WHERE TABLE_SCHEMA = ? AND TABLE_NAME = 'messages' AND COLUMN_NAME = 'conversation_id'
    `, [process.env.DB_NAME || 'keyhost_booking_system']);

        if (columns.length === 0) {
            console.log('⚠️  Messages table exists but has wrong schema (missing conversation_id).');
            console.log('🔄 Renaming old messages table to messages_backup...');

            await pool.execute('RENAME TABLE messages TO messages_backup_' + Date.now());
            console.log('✅ Old table renamed.');

            console.log('🔄 Creating new messages table...');
            await pool.execute(`
            CREATE TABLE messages (
                id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
                conversation_id BIGINT UNSIGNED NOT NULL,
                sender_id BIGINT UNSIGNED NOT NULL,
                content TEXT NOT NULL,
                is_read BOOLEAN DEFAULT FALSE,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (conversation_id) REFERENCES conversations(id) ON DELETE CASCADE,
                FOREIGN KEY (sender_id) REFERENCES users(id) ON DELETE CASCADE,
                INDEX idx_conversation (conversation_id),
                INDEX idx_sender (sender_id),
                INDEX idx_is_read (is_read),
                INDEX idx_created_at (created_at)
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
        `);
            console.log('✅ New messages table created successfully!');
        } else {
            console.log('✅ Messages table already has the correct schema.');
        }

    } catch (error) {
        console.error('Error during migration:', error);
    } finally {
        pool.end();
    }
}

migrateMessages();
