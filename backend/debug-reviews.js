const { pool } = require('./config/database');

async function checkReviews() {
    try {
        // Check table columns
        const [columns] = await pool.execute('SHOW COLUMNS FROM reviews');
        console.log('Columns:', columns.map(c => c.Field));

        // Check data sample
        const [rows] = await pool.execute('SELECT * FROM reviews LIMIT 1');
        console.log('Sample Row:', rows[0]);

        // Check aggregation
        const [stats] = await pool.execute(`
      SELECT 
        AVG(cleanliness_rating) as cleanliness,
        AVG(accuracy_rating) as accuracy
      FROM reviews
    `);
        console.log('Stats:', stats[0]);

        // Check distribution
        const [dist] = await pool.execute(`
      SELECT rating, COUNT(*) as count 
      FROM reviews 
      GROUP BY rating
    `);
        console.log('Distribution:', dist);

    } catch (error) {
        console.error('Error:', error);
    } finally {
        process.exit();
    }
}

checkReviews();
