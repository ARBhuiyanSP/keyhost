const mysql = require('mysql2/promise');
require('dotenv').config();

async function main() {
  const connection = await mysql.createConnection({
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'keyhost_booking_system',
    port: process.env.DB_PORT || 3306
  });

  try {
    const [rows] = await connection.query('SELECT * FROM payment_settings');
    console.log('Payment Settings:', rows);
  } catch (err) {
    console.error(err);
  } finally {
    await connection.end();
  }
}

main();
