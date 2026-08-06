const { pool } = require('../config/database.js');

async function verifySummaryData() {
    try {
        const hostId = 59;
        const propertyId = 78; // The first property of host 59
        const startDate = '2020-01-01';
        const endDate = '2026-12-31';

        const [incomeBreakdown] = await pool.query(`
            SELECT h.name, SUM(t.amount) as amount 
            FROM hms_accounts_transactions t
            JOIN hms_accounts_heads h ON t.account_head_id = h.id
            WHERE t.host_id = ? AND t.property_id = ? AND t.type = 'credit' AND t.date BETWEEN ? AND ?
            GROUP BY h.id, h.name
        `, [hostId, propertyId, startDate, endDate]);

        const [expenseBreakdown] = await pool.query(`
            SELECT h.name, SUM(t.amount) as amount 
            FROM hms_accounts_transactions t
            JOIN hms_accounts_heads h ON t.account_head_id = h.id
            WHERE t.host_id = ? AND t.property_id = ? AND t.type = 'debit' AND t.date BETWEEN ? AND ?
            GROUP BY h.id, h.name
        `, [hostId, propertyId, startDate, endDate]);

        console.log('Income Breakdown:');
        console.table(incomeBreakdown);
        console.log('Expense Breakdown:');
        console.table(expenseBreakdown);
        process.exit(0);
    } catch (error) {
        console.error('Error:', error);
        process.exit(1);
    }
}

verifySummaryData();
