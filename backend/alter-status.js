const { pool } = require('./config/database');

async function alterDb() {
    try {
        await pool.query(`ALTER TABLE properties MODIFY COLUMN status ENUM('active','inactive','suspended','pending_approval','in_progress') DEFAULT 'in_progress';`);
        console.log("DB altered");
        process.exit(0);
    } catch (e) {
        console.error(e);
        process.exit(1);
    }
}
alterDb();
