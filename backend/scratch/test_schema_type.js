const { pool } = require('../config/database');

async function check() {
  const [res1] = await pool.query("DESCRIBE properties");
  console.log("properties ID:");
  console.table(res1.filter(c => c.Field === 'id'));

  const [res2] = await pool.query("DESCRIBE hms_rooms");
  console.log("hms_rooms ID:");
  console.table(res2.filter(c => c.Field === 'id'));
  
  process.exit(0);
}
check();
