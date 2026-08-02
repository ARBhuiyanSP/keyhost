const { pool } = require('../backend/config/database');

async function run() {
  try {
    const [rows] = await pool.query('SELECT p.id, p.title, p.slug, COUNT(pi.id) as img_count FROM properties p LEFT JOIN property_images pi ON p.id = pi.property_id WHERE p.status = "active" GROUP BY p.id');
    console.log(JSON.stringify(rows, null, 2));
  } catch (err) {
    console.error(err);
  } finally {
    process.exit(0);
  }
}

run();
