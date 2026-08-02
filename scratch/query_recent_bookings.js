const { pool } = require('../backend/config/database');

async function main() {
  try {
    const [rows] = await pool.execute(`
      SELECT b.*, p.title as property_title 
      FROM bookings b
      JOIN properties p ON b.property_id = p.id
      ORDER BY b.id DESC
      LIMIT 2
    `);
    console.log(JSON.stringify(rows, null, 2));
    process.exit(0);
  } catch (error) {
    console.error(error);
    process.exit(1);
  }
}

main();
