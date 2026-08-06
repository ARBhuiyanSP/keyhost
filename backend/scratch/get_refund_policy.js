const mysql = require('mysql2/promise');
require('dotenv').config();

async function getRefundPolicy() {
  let connection;
  try {
    connection = await mysql.createConnection({
      host: process.env.DB_HOST || 'localhost',
      user: process.env.DB_USER || 'root',
      password: process.env.DB_PASSWORD || '',
      database: process.env.DB_NAME || 'keyhost_booking_system'
    });

    const [rows] = await connection.execute('SELECT `setting_value` FROM `system_settings` WHERE `setting_key` = "refund_policy" LIMIT 1');
    
    if (rows.length > 0) {
      console.log('---REFUND_POLICY_START---');
      console.log(rows[0].setting_value);
      console.log('---REFUND_POLICY_END---');
    } else {
      console.log('Refund policy not found in system_settings table.');
    }
  } catch (error) {
    console.error('Error:', error.message);
  } finally {
    if (connection) await connection.end();
  }
}

getRefundPolicy();
