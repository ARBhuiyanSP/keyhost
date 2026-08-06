const { pool } = require('./config/database');

async function test() {
    try {
        const [rows] = await pool.query('DESCRIBE properties;');
        console.log(rows);
        process.exit(0);
    } catch (e) {
        console.error(e);
        process.exit(1);
    }
}
test();
