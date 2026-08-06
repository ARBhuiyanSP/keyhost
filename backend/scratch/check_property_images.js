const { pool } = require('../config/database.js');

async function run() {
  try {
    const [properties] = await pool.query('SELECT id, title FROM properties');
    console.log(`Found ${properties.length} properties:`);
    for (const p of properties) {
      const [images] = await pool.query('SELECT COUNT(*) as count FROM property_images WHERE property_id = ?', [p.id]);
      console.log(`Property ID ${p.id}: "${p.title}" - ${images[0].count} images`);
    }
    process.exit(0);
  } catch (error) {
    console.error(error);
    process.exit(1);
  }
}

run();
