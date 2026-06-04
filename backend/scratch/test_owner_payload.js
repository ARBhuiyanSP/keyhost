const { pool } = require('../config/database');

async function main() {
  try {
    const userId = 21; // Let's check user 21 who was verified as property_owner in previous compaction steps
    const [userRows] = await pool.execute(
      'SELECT id, email, user_type, first_name, last_name FROM users WHERE id = ?',
      [userId]
    );
    if (userRows.length === 0) {
      console.log('User 21 not found, checking user 64 or first property owner...');
      const [allOwners] = await pool.execute('SELECT id, email, user_type, first_name, last_name FROM users WHERE user_type = "property_owner" LIMIT 1');
      if (allOwners.length === 0) {
        console.log('No property owner found!');
        process.exit(0);
      }
      console.log('Using owner:', allOwners[0]);
      return runForUser(allOwners[0].id);
    } else {
      console.log('Using owner 21:', userRows[0]);
      return runForUser(userId);
    }
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
}

async function runForUser(userId) {
  try {
    const [userRows] = await pool.execute('SELECT * FROM users WHERE id = ?', [userId]);
    const u = userRows[0];
    
    // Simulate updating user
    const [propertyOwners] = await pool.execute('SELECT * FROM property_owners WHERE user_id = ?', [userId]);
    const po = propertyOwners[0] || {};
    
    const body = {
      first_name: u.first_name,
      last_name: u.last_name,
      email: u.email,
      phone: u.phone,
      date_of_birth: u.date_of_birth,
      gender: u.gender,
      address: u.address,
      city: u.city,
      state: u.state,
      country: u.country,
      postal_code: u.postal_code,
      bio: u.bio,
      business_name: po.business_name || '',
      business_license: po.business_license || '',
      tax_id: po.tax_id || '',
      bank_account_number: po.bank_account_number || '',
      bank_name: po.bank_name || '',
      bank_routing_number: po.bank_routing_number || '',
      auto_accept_bookings: u.auto_accept_bookings
    };

    console.log('Updating with body...');
    // We run the logic inside the router
    // Update users table
    const userUpdateFields = [];
    const userUpdateValues = [];
    const allowedUserFields = {
      first_name: body.first_name, 
      last_name: body.last_name, 
      email: body.email, 
      phone: body.phone, 
      date_of_birth: body.date_of_birth, 
      gender: body.gender,
      address: body.address, 
      city: body.city, 
      state: body.state, 
      country: body.country, 
      postal_code: body.postal_code, 
      bio: body.bio, 
      auto_accept_bookings: body.auto_accept_bookings
    };

    Object.keys(allowedUserFields).forEach(key => {
      if (allowedUserFields[key] !== undefined) {
        let value = allowedUserFields[key];
        if (value === '' && ['date_of_birth', 'gender'].includes(key)) {
          value = null;
        }
        if (key === 'auto_accept_bookings') {
          value = value ? 1 : 0;
        }
        userUpdateFields.push(`${key} = ?`);
        userUpdateValues.push(value);
      }
    });

    if (userUpdateFields.length > 0) {
      userUpdateValues.push(userId);
      await pool.execute(
        `UPDATE users SET ${userUpdateFields.join(', ')}, updated_at = NOW() WHERE id = ?`,
        userUpdateValues
      );
    }

    // Get updated user info
    const [users] = await pool.execute(`
      SELECT id, first_name, last_name, email, phone, user_type,
             email_verified_at, phone_verified_at, is_active,
             profile_image, date_of_birth, gender, address,
             city, state, country, postal_code, language,
             timezone, email_notifications, sms_notifications,
             auto_accept_bookings, last_login_at, created_at, updated_at,
             bio
      FROM users
      WHERE id = ?
    `, [userId]);

    const user = users[0];
    const [pos] = await pool.execute(`
      SELECT * FROM property_owners
      WHERE user_id = ?
    `, [userId]);

    if (pos.length > 0) {
      user.property_owner_info = pos[0];
    }

    console.log('Result user payload structure:', Object.keys(user));
    console.log('user_type value:', user.user_type);
    console.log('Full user payload:', JSON.stringify(user, null, 2));

  } catch (err) {
    console.error(err);
  } finally {
    process.exit(0);
  }
}

main();
