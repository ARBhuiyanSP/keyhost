const { pool } = require('../config/database');

const run = async () => {
  try {
    const tables = ['hms_bills', 'hms_food_orders', 'hms_food_order_items'];
    for (const table of tables) {
        console.log(`\n--- ${table} ---`);
        const [rows] = await pool.query(`DESCRIBE ${table}`);
        console.table(rows);
    }
    process.exit(0);
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
};

run();
