const { pool } = require('../config/database.js');

async function debugPayroll() {
    try {
        const [rows] = await pool.query('SELECT * FROM hms_accounts_transactions WHERE reference_type = "payroll"');
        console.table(rows);
        process.exit(0);
    } catch (error) {
        console.error(error);
        process.exit(1);
    }
}

debugPayroll();
