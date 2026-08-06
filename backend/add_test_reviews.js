const { pool } = require('./config/database');

async function run() {
  // Get first active property
  const [props] = await pool.execute("SELECT id FROM properties WHERE status = 'active' LIMIT 3");
  const [users] = await pool.execute("SELECT id FROM users WHERE user_type = 'guest' LIMIT 1");

  if (!props.length || !users.length) {
    console.log('No active property or guest found');
    process.exit(0);
  }

  const pId = props[0].id;
  const uId = users[0].id;
  console.log('Property:', pId, 'User:', uId);

  // Find any booking for this user or create test review directly
  const [bk] = await pool.execute('SELECT id, status FROM bookings WHERE guest_id = ? LIMIT 5', [uId]);
  console.log('User bookings:', bk);

  if (!bk.length) {
    console.log('No bookings found. Will insert test review directly with fake booking ref...');
    // Insert a dummy booking first
    const [bkResult] = await pool.execute(`
      INSERT INTO bookings (property_id, guest_id, booking_reference, check_in_date, check_out_date, 
        number_of_guests, base_price, total_amount, status, created_at)
      VALUES (?, ?, 'TEST-REVIEW-001', DATE_SUB(NOW(), INTERVAL 10 DAY), DATE_SUB(NOW(), INTERVAL 3 DAY),
        2, 5000, 5000, 'checked_out', NOW())
    `, [pId, uId]);
    const bkId = bkResult.insertId;
    console.log('Created test booking:', bkId);

    // Now add review
    await addReview(pId, uId, bkId);
  } else {
    const bkId = bk[0].id;
    await pool.execute("UPDATE bookings SET status = 'checked_out' WHERE id = ?", [bkId]);
    console.log('Set booking', bkId, 'to checked_out');
    await addReview(pId, uId, bkId);
  }

  process.exit(0);
}

async function addReview(pId, uId, bkId) {
  const comments = [
    'Excellent property! Very clean and comfortable. The host was super responsive and helpful. Location was perfect.',
    'Had a wonderful stay. The place was exactly as described. Highly recommended!',
    'Great value for money. Clean, spacious and well-equipped. Will definitely book again.',
  ];

  for (let i = 0; i < 3; i++) {
    try {
      const [r] = await pool.execute(`
        INSERT INTO reviews (booking_id, guest_id, property_id, rating, title, comment,
          cleanliness_rating, communication_rating, check_in_rating,
          accuracy_rating, location_rating, value_rating,
          status, is_public, created_at)
        VALUES (?, ?, ?, ?, ?, ?, 5, 5, 5, 5, 5, 5, 'approved', 1, DATE_SUB(NOW(), INTERVAL ? DAY))
      `, [bkId, uId, pId, 5 - (i % 2), ['Great stay!', 'Wonderful experience', 'Loved it'][i], comments[i], i * 5]);
      console.log('Review', i + 1, 'added:', r.insertId);
      if (i > 0) break; // Only insert once per booking
    } catch (e) {
      if (e.code === 'ER_DUP_ENTRY') {
        console.log('Review already exists for this booking');
        break;
      }
      console.error(e.message);
    }
  }

  // Update property rating
  const [ratingResult] = await pool.execute(
    'SELECT AVG(rating) as avg_rating, COUNT(*) as total FROM reviews WHERE property_id = ? AND status = "approved" AND is_public = 1',
    [pId]
  );
  await pool.execute(
    'UPDATE properties SET average_rating = ?, total_reviews = ? WHERE id = ?',
    [ratingResult[0].avg_rating, ratingResult[0].total, pId]
  );
  console.log(`✅ Property ${pId} updated: avg=${parseFloat(ratingResult[0].avg_rating||0).toFixed(1)}, total=${ratingResult[0].total}`);
}

run().catch(e => { console.error(e); process.exit(1); });
