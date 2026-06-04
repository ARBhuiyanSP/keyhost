const { pool } = require('../config/database');

async function main() {
  try {
    const userId = 64;
    
    // Simulate req.user for middleware
    const [userRows] = await pool.execute(
      'SELECT id, email, user_type, host_id, is_active FROM users WHERE id = ?',
      [userId]
    );
    const reqUser = userRows[0];
    
    const formData = {
      first_name: 'Atiqur Rahman',
      last_name: 'Bhuiyan',
      email: 'atiqur.cumilla@gmail.com',
      phone: '01844015754', // a real phone number!
      date_of_birth: '1990-05-15',
      gender: 'male',
      address: 'Test Guest Address',
      city: 'Dhaka',
      state: 'Dhaka',
      country: 'Bangladesh',
      postal_code: '1212'
    };

    console.log('Simulating update profile for user 64...');
    
    const {
      first_name,
      last_name,
      phone,
      date_of_birth,
      gender,
      address,
      city,
      state,
      country,
      postal_code
    } = formData;

    const [existing] = await pool.execute(
      'SELECT id FROM users WHERE email = ? AND id != ?',
      [formData.email, reqUser.id]
    );
    console.log('Existing email check count:', existing.length);

    const updateFields = [];
    const updateValues = [];

    const allowedFields = {
      first_name, last_name, email: formData.email, phone, date_of_birth, gender,
      address, city, state, country, postal_code
    };

    Object.keys(allowedFields).forEach(key => {
      if (allowedFields[key] !== undefined) {
        let value = allowedFields[key];
        if (value === '' && ['date_of_birth', 'gender'].includes(key)) {
          value = null;
        }
        updateFields.push(`${key} = ?`);
        updateValues.push(value);
      }
    });

    updateValues.push(reqUser.id);
    
    console.log('Running query:', `UPDATE users SET ${updateFields.join(', ')}, updated_at = NOW() WHERE id = ?`);
    console.log('Values:', updateValues);

    const [result] = await pool.execute(
      `UPDATE users SET ${updateFields.join(', ')}, updated_at = NOW() WHERE id = ?`,
      updateValues
    );
    console.log('Update result:', result);

    // Get updated user
    const [users] = await pool.execute(`
      SELECT 
        id, first_name, last_name, email, phone, user_type,
        email_verified_at, phone_verified_at, is_active,
        profile_image, date_of_birth, gender, address,
        city, state, country, postal_code, language,
        timezone, email_notifications, sms_notifications,
        auto_accept_bookings,
        last_login_at, created_at, updated_at
      FROM users 
      WHERE id = ?
    `, [reqUser.id]);
    
    console.log('Updated user fetched:', users[0]);

  } catch (err) {
    console.error('CRITICAL ERROR:', err);
  } finally {
    process.exit(0);
  }
}

main();
