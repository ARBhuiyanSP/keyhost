const mysql = require('mysql2/promise');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') });

(async () => {
  const pool = await mysql.createPool({
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
  });

  const [cols] = await pool.execute("SHOW COLUMNS FROM properties LIKE 'slug'");
  console.log('slug column:', JSON.stringify(cols));

  const [sample] = await pool.execute('SELECT id, title FROM properties LIMIT 5');
  console.log('sample rows:', JSON.stringify(sample));

  await pool.end();
})();
