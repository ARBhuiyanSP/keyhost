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

async function checkTable() {
    try {
        console.log('Checking messages table structure...');
        const [columns] = await pool.execute('DESCRIBE messages');
        console.log('Columns in messages table:');
        columns.forEach(col => {
            console.log(`- ${col.Field} (${col.Type})`);
        });

        console.log('\nChecking conversations table structure...');
        const [convColumns] = await pool.execute('DESCRIBE conversations');
        console.log('Columns in conversations table:');
        convColumns.forEach(col => {
            console.log(`- ${col.Field} (${col.Type})`);
        });

    } catch (error) {
        console.error('Error:', error);
    } finally {
        pool.end();
    }
}

checkTable();
