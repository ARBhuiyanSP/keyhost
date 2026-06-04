const { pool } = require('./config/database');

const checkUser = async () => {
    try {
        const [rows] = await pool.query('SELECT * FROM users WHERE email = ?', ['manager@keyhost.com']);
        console.log('User found:', rows);
        process.exit(0);
    } catch (error) {
        console.error('Error checking user:', error);
        process.exit(1);
    }
};

checkUser();
