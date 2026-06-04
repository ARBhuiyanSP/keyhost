const { pool } = require('./config/database');

const checkUserById = async () => {
    try {
        const [rows] = await pool.query('SELECT * FROM users WHERE id = ?', [62]);
        console.log('User found by ID 62:', rows);
        process.exit(0);
    } catch (error) {
        console.error('Error checking user:', error);
        process.exit(1);
    }
};

checkUserById();
