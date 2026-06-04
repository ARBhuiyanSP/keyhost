// Approve all existing pending reviews that came from checked_out bookings
const { pool } = require('./config/database');

async function approvePendingReviews() {
  try {
    // Approve all pending reviews that have a valid checked_out booking
    const [result] = await pool.execute(`
      UPDATE reviews r
      JOIN bookings b ON r.booking_id = b.id
      SET r.status = 'approved', r.is_public = 1, r.updated_at = NOW()
      WHERE r.status = 'pending'
        AND b.status = 'checked_out'
    `);
    console.log(`✅ Approved ${result.affectedRows} pending reviews`);

    // Recalculate property ratings for all affected properties
    const [properties] = await pool.execute(`
      SELECT DISTINCT property_id FROM reviews WHERE status = 'approved' AND is_public = 1
    `);

    let updated = 0;
    for (const { property_id } of properties) {
      const [ratingResult] = await pool.execute(`
        SELECT AVG(rating) as avg_rating, COUNT(*) as total_reviews
        FROM reviews
        WHERE property_id = ? AND status = 'approved' AND is_public = 1
      `, [property_id]);

      if (ratingResult.length > 0) {
        await pool.execute(
          'UPDATE properties SET average_rating = ?, total_reviews = ? WHERE id = ?',
          [ratingResult[0].avg_rating, ratingResult[0].total_reviews, property_id]
        );
        updated++;
        console.log(`  Property ${property_id}: avg=${parseFloat(ratingResult[0].avg_rating||0).toFixed(1)}, total=${ratingResult[0].total_reviews}`);
      }
    }

    console.log(`✅ Updated ratings for ${updated} properties`);
    process.exit(0);
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

approvePendingReviews();
