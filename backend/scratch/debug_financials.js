const { pool } = require('../config/database.js');

async function debugData() {
    try {
        console.log('--- Checking Financial Data ---');
        
        const [bookings] = await pool.query('SELECT COUNT(*) as count, SUM(total_amount) as total FROM bookings WHERE status != "cancelled"');
        console.log('Total Bookings:', bookings[0]);

        const [payments] = await pool.query('SELECT COUNT(*) as count, SUM(cr_amount) as total FROM payments WHERE status = "completed"');
        console.log('Total Payments Received:', payments[0]);

        const [foodOrders] = await pool.query('SELECT COUNT(*) as count, SUM(total_amount) as total FROM hms_food_orders WHERE payment_status = "paid"');
        console.log('Paid Food Orders:', foodOrders[0]);

        const [expenses] = await pool.query('SELECT COUNT(*) as count, SUM(amount) as total FROM hms_expenses');
        console.log('Total Expenses:', expenses[0]);

        const [transactions] = await pool.query('SELECT COUNT(*) as count, SUM(amount) as total, type FROM hms_accounts_transactions GROUP BY type');
        console.log('Current Account Transactions:', transactions);

        process.exit(0);
    } catch (error) {
        console.error('Error:', error);
        process.exit(1);
    }
}

debugData();
