const { pool } = require('./config/database');

const checkEmployee = async () => {
    try {
        const [rows] = await pool.query('SELECT * FROM hms_employees WHERE email = ?', ['manager@keyhost.com']);
        console.log('Employee found:', rows);
        process.exit(0);
    } catch (error) {
        console.error('Error checking employee:', error);
        process.exit(1);
    }
};

checkEmployee();
