const { pool } = require('../backend/config/database');

async function testStats() {
  try {
    const [statsRows] = await pool.execute(`
      SELECT 
        (SELECT COUNT(*) FROM users) as total_users,
        (SELECT COUNT(*) FROM users WHERE user_type = 'property_owner') as total_hosts,
        (SELECT COUNT(*) FROM property_owners WHERE is_verified = 1) as verified_hosts,
        (SELECT COUNT(*) FROM property_owners WHERE is_verified = 0) as pending_hosts,
        (SELECT COUNT(*) FROM users WHERE is_active = 1) as active_users,
        (SELECT COUNT(*) FROM users WHERE is_active = 0) as blocked_users
    `);
    console.log("DATABASE STATS RESULT:", statsRows[0]);
    process.exit(0);
  } catch (error) {
    console.error("DATABASE STATS ERROR:", error);
    process.exit(1);
  }
}

testStats();
