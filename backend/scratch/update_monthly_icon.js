const mysql = require('mysql2/promise');

(async () => {
  const conn = await mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: '',
    database: 'keyhost_booking_system'
  });

  // Set icon_url for Monthly Rent and fix sort orders
  await conn.query("UPDATE property_types SET icon_url='/images/nav-icon-monthly.png', sort_order=4 WHERE name='Monthly Rent'");
  await conn.query("UPDATE property_types SET sort_order=1 WHERE name='Room'");
  await conn.query("UPDATE property_types SET sort_order=2 WHERE name='Apartment'");
  await conn.query("UPDATE property_types SET sort_order=3 WHERE name='Hotels'");
  await conn.query("UPDATE property_types SET sort_order=99 WHERE name='Flight'");

  const [all] = await conn.query('SELECT id, name, icon_url, sort_order, is_active FROM property_types ORDER BY sort_order');
  console.table(all);
  await conn.end();
})().catch(e => console.error(e.message));
