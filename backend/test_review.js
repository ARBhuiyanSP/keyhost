// Add a test approved review to verify the reviews display is working
// Run: node test_review.js <property_id> <guest_user_id> <booking_id>
const { pool } = require('./config/database');

async function addTestReview() {
  const propertyId = process.argv[2];
  const guestId = process.argv[3];
  const bookingId = process.argv[4];

  if (!propertyId || !guestId || !bookingId) {
    // Show available checked_out bookings to use
    console.log('Usage: node test_review.js <property_id> <guest_user_id> <booking_id>');
    console.log('\nAvailable checked_out bookings:');
    const [bookings] = await pool.execute(`
      SELECT b.id, b.property_id, b.guest_id, b.booking_reference, b.check_out_date,
             p.title as property_title, u.first_name, u.last_name
      FROM bookings b
      JOIN properties p ON b.property_id = p.id
      JOIN users u ON b.guest_id = u.id
      LEFT JOIN reviews r ON r.booking_id = b.id
      WHERE b.status = 'checked_out' AND r.id IS NULL
      LIMIT 10
    `);
    console.table(bookings);
    process.exit(0);
  }

  try {
    const [result] = await pool.execute(`
      INSERT INTO reviews (
        booking_id, guest_id, property_id, rating, title, comment,
        cleanliness_rating, communication_rating, check_in_rating,
        accuracy_rating, location_rating, value_rating,
        status, is_public, created_at
      ) VALUES (?, ?, ?, 5, 'Great stay!', 
        'Amazing property! Very clean and comfortable. The host was very responsive. Would definitely book again.',
        5, 5, 5, 5, 5, 5, 'approved', 1, NOW())
    `, [bookingId, guestId, propertyId]);

    console.log(`✅ Test review added (ID: ${result.insertId})`);

    // Update property rating
    const [ratingResult] = await pool.execute(`
      SELECT AVG(rating) as avg_rating, COUNT(*) as total_reviews
      FROM reviews WHERE property_id = ? AND status = 'approved' AND is_public = 1
    `, [propertyId]);

    await pool.execute(
      'UPDATE properties SET average_rating = ?, total_reviews = ? WHERE id = ?',
      [ratingResult[0].avg_rating, ratingResult[0].total_reviews, propertyId]
    );

    console.log(`✅ Property ${propertyId} rating updated: ${parseFloat(ratingResult[0].avg_rating).toFixed(1)} (${ratingResult[0].total_reviews} reviews)`);
    process.exit(0);
  } catch (err) {
    console.error('Error:', err.message);
    process.exit(1);
  }
}

addTestReview();
