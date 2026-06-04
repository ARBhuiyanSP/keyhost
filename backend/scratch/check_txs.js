const { pool } = require('../config/database.js');

async function checkTransactions() {
    try {
        const [users] = await pool.query('SELECT id FROM users WHERE email = ?', ['arbhuiyan.pits@gmail.com']);
        if (users.length === 0) {
            console.log('User not found');
            process.exit(0);
        }
        const hostId = users[0].id;
        console.log(`Host ID: ${hostId}`);

        const [txs] = await pool.query(`
            SELECT t.*, h.name as head_name 
            FROM hms_accounts_transactions t
            JOIN hms_accounts_heads h ON t.account_head_id = h.id
            WHERE t.host_id = ?
        `, [hostId]);
        
        console.table(txs);
        process.exit(0);
    } catch (error) {
        console.error('Error:', error);
        process.exit(1);
    }
}

checkTransactions();
