const { pool } = require('../backend/config/database');

async function main() {
  try {
    const [rows] = await pool.execute(`
      SELECT id, title, base_price, monthly_rent_enabled, monthly_approved, monthly_rent_amount, monthly_security_deposit, monthly_advance_amount, cleaning_fee, security_deposit, extra_guest_fee, is_hms_enabled
      FROM properties
      WHERE id = 77
    `);
    console.log(JSON.stringify(rows, null, 2));
    process.exit(0);
  } catch (error) {
    console.error(error);
    process.exit(1);
  }
}

main();
