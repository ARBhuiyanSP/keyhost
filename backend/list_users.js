const { pool } = require('./config/database');

const listUsers = async () => {
    try {
        const [rows] = await pool.query('SELECT id, email, user_type FROM users ORDER BY id DESC LIMIT 10');
        console.log('Recent Users:', rows);
        process.exit(0);
    } catch (error) {
        console.error('Error listing users:', error);
        process.exit(1);
    }
};

listUsers();
