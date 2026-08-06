const { pool } = require('../backend/config/database');

async function checkProperties() {
  try {
    const [properties] = await pool.query('SELECT id, title, owner_id, is_hms_enabled FROM properties WHERE owner_id = 29');
    console.log('=== Properties for owner 29 ===');
    console.log(JSON.stringify(properties, null, 2));

    const [rooms] = await pool.query('SELECT id, property_id, room_number, status FROM hms_rooms WHERE property_id IN (77, 78)');
    console.log('\n=== HMS Rooms ===');
    console.log(JSON.stringify(rooms, null, 2));
  } catch (err) {
    console.error('Error:', err);
  } finally {
    await pool.end();
  }
}

checkProperties();
