const { pool } = require('../config/database');

async function checkSchema() {
  try {
    const [columns] = await pool.query('DESCRIBE hms_staff');
    console.log('Columns of hms_staff:');
    console.log(columns);
    
    const [existing] = await pool.query('SELECT * FROM hms_staff LIMIT 1');
    console.log('Sample staff row:', existing);
  } catch (err) {
    console.error('Error checking schema:', err);
  } finally {
    process.exit(0);
  }
}

checkSchema();
