const mysql = require('mysql2/promise');

(async () => {
  const conn = await mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: '',
    database: 'keyhost_booking_system'
  });

  // Check if monthly rent already exists
  const [existing] = await conn.query("SELECT id, name, is_active FROM property_types WHERE name LIKE '%onthly%'");
  console.log('Existing monthly types:', existing);

  if (existing.length === 0) {
    // Check what columns exist
    const [cols] = await conn.query("DESCRIBE property_types");
    console.log('Columns:', cols.map(c => c.Field));

    // Insert with minimal required columns
    const [result] = await conn.query(
      "INSERT INTO property_types (name, is_active) VALUES ('Monthly Rent', 1)"
    );
    console.log('Inserted Monthly Rent with id:', result.insertId);
  } else {
    await conn.query("UPDATE property_types SET is_active=1 WHERE name LIKE '%onthly%'");
    console.log('Activated existing monthly type');
  }

  const [all] = await conn.query('SELECT id, name, is_active FROM property_types ORDER BY id');
  console.table(all);
  await conn.end();
})().catch(e => console.error(e.message));
