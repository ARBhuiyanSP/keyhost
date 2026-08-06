const mysql = require('mysql2/promise');
require('dotenv').config();

async function describeTable() {
  let connection;
  try {
    connection = await mysql.createConnection({
      host: process.env.DB_HOST || 'localhost',
      user: process.env.DB_USER || 'root',
      password: process.env.DB_PASSWORD || '',
      database: process.env.DB_NAME || 'keyhost_booking_system'
    });

    const [rows] = await connection.execute('DESCRIBE `system_settings`');
    console.log('Columns:', JSON.stringify(rows, null, 2));
  } catch (error) {
    console.error('Error:', error.message);
  } finally {
    if (connection) await connection.end();
  }
}

describeTable();
