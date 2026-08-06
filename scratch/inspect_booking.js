const { pool } = require('../backend/config/database');

async function main() {
  try {
    const [rows] = await pool.execute(`
      SELECT *
      FROM bookings
      WHERE id = 11
    `);
    console.log(JSON.stringify(rows, null, 2));
    process.exit(0);
  } catch (error) {
    console.error(error);
    process.exit(1);
  }
}

main();
