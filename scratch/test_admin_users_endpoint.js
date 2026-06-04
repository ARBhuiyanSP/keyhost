const { pool } = require('../backend/config/database');
const { generatePagination, formatResponse } = require('../backend/utils/helpers');

async function testEndpoint() {
  try {
    const page = 1;
    const limit = 10;
    const offset = 0;
    
    // Get total count
    const [countResult] = await pool.execute(`
      SELECT COUNT(*) as total 
      FROM users u 
    `);

    const total = countResult[0].total;

    // Get users
    const [users] = await pool.execute(`
      SELECT 
        u.id, u.first_name, u.last_name, u.email, u.phone, u.user_type,
        u.is_active, u.auto_accept_bookings, u.email_verified_at, u.last_login_at, u.created_at,
        u.phone_verified_at, u.address, u.city, u.state, u.country, u.postal_code, u.bio,
        po.is_verified as owner_verified
      FROM users u
      LEFT JOIN property_owners po ON u.id = po.user_id
      ORDER BY u.created_at DESC
      LIMIT ? OFFSET ?
    `, [parseInt(limit), offset]);

    // Get stats
    const [statsRows] = await pool.execute(`
      SELECT 
        (SELECT COUNT(*) FROM users) as total_users,
        (SELECT COUNT(*) FROM users WHERE user_type = 'property_owner') as total_hosts,
        (SELECT COUNT(*) FROM property_owners WHERE is_verified = 1) as verified_hosts,
        (SELECT COUNT(*) FROM property_owners WHERE is_verified = 0) as pending_hosts,
        (SELECT COUNT(*) FROM users WHERE is_active = 1) as active_users,
        (SELECT COUNT(*) FROM users WHERE is_active = 0) as blocked_users
    `);
    const statsResult = statsRows[0] || {};

    const pagination = generatePagination(parseInt(page), parseInt(limit), total);

    const response = formatResponse(true, 'Users retrieved successfully', {
      users,
      pagination,
      stats: statsResult
    });

    console.log("FORMATTED RESPONSE:");
    console.log(JSON.stringify(response, null, 2));
    
    process.exit(0);
  } catch (error) {
    console.error("ENDPOINT TEST ERROR:", error);
    process.exit(1);
  }
}

testEndpoint();
