const { pool } = require('./config/database');

const fixUser = async () => {
    try {
        // Find the user ID linked to manager@keyhost.com in hms_employees
        const [emp] = await pool.query('SELECT user_id FROM hms_employees WHERE email = ?', ['manager@keyhost.com']);
        if (emp.length > 0 && emp[0].user_id) {
            const userId = emp[0].user_id;
            console.log('Fixing user ID:', userId);
            await pool.query(
                'UPDATE users SET email = ?, first_name = ? WHERE id = ?',
                ['manager@keyhost.com', 'Manager', userId]
            );
            console.log('User fixed successfully.');
        } else {
            console.log('Employee not found or no user_id linked.');
        }
        process.exit(0);
    } catch (error) {
        console.error('Error fixing user:', error);
        process.exit(1);
    }
};

fixUser();
