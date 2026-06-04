const { pool } = require('../config/database.js');

async function syncAll() {
    try {
        console.log('--- Starting Financial Sync ---');
        
        // 1. Clear existing transactions to start fresh
        await pool.query('DELETE FROM hms_accounts_transactions');
        await pool.query('DELETE FROM hms_accounts_vouchers');
        console.log('Cleared existing account records.');

        // 2. Sync Payments (Room Revenue)
        console.log('Syncing Room Revenue...');
        const [payments] = await pool.query(`
            SELECT p.*, b.property_id, pr.owner_id as host_id, u.id as owner_user_id
            FROM payments p
            JOIN bookings b ON p.booking_id = b.id
            JOIN properties pr ON b.property_id = pr.id
            JOIN property_owners po ON pr.owner_id = po.id
            JOIN users u ON po.user_id = u.id
            WHERE p.status = 'completed' AND p.cr_amount > 0
        `);

        const syncedCommissions = new Set();

        for (const p of payments) {
            // Get or create Room Revenue head for this host
            let [heads] = await pool.query('SELECT id FROM hms_accounts_heads WHERE (host_id = ? OR is_system = 1) AND name = ?', [p.owner_user_id, 'Room Revenue']);
            let headId = heads.length > 0 ? heads[0].id : 1;

            await pool.query(
                `INSERT INTO hms_accounts_transactions (host_id, property_id, account_head_id, amount, type, description, reference_type, reference_id, date) 
                 VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
                [p.owner_user_id, p.property_id, headId, p.cr_amount, 'credit', `Room Revenue - Booking #${p.booking_id}`, 'payment', p.id, p.payment_date || p.created_at]
            );

            // Sync Commission for this payment (only once per booking)
            if (!syncedCommissions.has(p.booking_id)) {
                const [earnings] = await pool.query(
                    'SELECT commission_amount FROM admin_earnings WHERE booking_id = ? AND status = "active"',
                    [p.booking_id]
                );

                if (earnings.length > 0 && earnings[0].commission_amount > 0) {
                    const commissionAmount = earnings[0].commission_amount;
                    
                    // Get or create Platform Commission head
                    let [commHeads] = await pool.query('SELECT id FROM hms_accounts_heads WHERE (host_id = ? OR is_system = 1) AND name = ?', [p.owner_user_id, 'Platform Commission']);
                    let commHeadId;
                    if (commHeads.length > 0) {
                        commHeadId = commHeads[0].id;
                    } else {
                        const [chResult] = await pool.query('INSERT INTO hms_accounts_heads (host_id, name, type) VALUES (?, ?, ?)', [p.owner_user_id, 'Platform Commission', 'expense']);
                        commHeadId = chResult.insertId;
                    }

                    await pool.query(
                        `INSERT INTO hms_accounts_transactions (host_id, property_id, account_head_id, amount, type, description, reference_type, reference_id, date) 
                         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
                        [p.owner_user_id, p.property_id, commHeadId, commissionAmount, 'debit', `Platform Commission - Booking #${p.booking_id}`, 'commission', p.booking_id, p.payment_date || p.created_at]
                    );
                    syncedCommissions.add(p.booking_id);
                }
            }
        }
        console.log(`Synced ${payments.length} payment records and their commissions.`);

        // 3. Sync Paid Payrolls (Salaries)
        console.log('Syncing Payrolls...');
        const [payrolls] = await pool.query(`
            SELECT p.*, e.name as employee_name, e.property_id as employee_property_id
            FROM hms_payrolls p
            JOIN hms_employees e ON p.employee_id = e.id
            WHERE p.status = 'paid'
        `);

        for (const pr of payrolls) {
            // Use employee's linked property or fallback to host's first property
            let finalPropertyId = pr.employee_property_id;
            if (!finalPropertyId) {
                const [hostProps] = await pool.query('SELECT id FROM properties WHERE owner_id = (SELECT id FROM property_owners WHERE user_id = ?) LIMIT 1', [pr.host_id]);
                finalPropertyId = hostProps.length > 0 ? hostProps[0].id : null;
            }

            // Get or create Staff Salary head
            let [heads] = await pool.query('SELECT id FROM hms_accounts_heads WHERE (host_id = ? OR is_system = 1) AND name = ?', [pr.host_id, 'Staff Salary']);
            let headId;
            if (heads.length > 0) {
                headId = heads[0].id;
            } else {
                const [hResult] = await pool.query('INSERT INTO hms_accounts_heads (host_id, name, type) VALUES (?, ?, ?)', [pr.host_id, 'Staff Salary', 'expense']);
                headId = hResult.insertId;
            }

            await pool.query(
                `INSERT INTO hms_accounts_transactions (host_id, property_id, account_head_id, amount, type, description, reference_type, reference_id, date) 
                 VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
                [
                    pr.host_id, 
                    finalPropertyId,
                    headId, 
                    pr.net_salary, 
                    'debit', 
                    `Salary Payment - ${pr.employee_name} (${pr.month}/${pr.year})`, 
                    'payroll', 
                    pr.id, 
                    pr.payment_date || pr.created_at
                ]
            );
        }
        console.log(`Synced ${payrolls.length} payroll records.`);

        // 4. Sync Food Orders
        console.log('Syncing Food & Beverage Income...');
        const [foodOrders] = await pool.query(`
            SELECT o.*, pr.owner_id as host_id, u.id as owner_user_id
            FROM hms_food_orders o
            JOIN properties pr ON o.property_id = pr.id
            JOIN property_owners po ON pr.owner_id = po.id
            JOIN users u ON po.user_id = u.id
            WHERE o.payment_status = 'paid'
        `);

        for (const o of foodOrders) {
            let [heads] = await pool.query('SELECT id FROM hms_accounts_heads WHERE (host_id = ? OR is_system = 1) AND name = ?', [o.owner_user_id, 'Food & Beverage Income']);
            let headId;
            if (heads.length > 0) {
                headId = heads[0].id;
            } else {
                const [hResult] = await pool.query('INSERT INTO hms_accounts_heads (host_id, name, type) VALUES (?, ?, ?)', [o.owner_user_id, 'Food & Beverage Income', 'income']);
                headId = hResult.insertId;
            }

            await pool.query(
                `INSERT INTO hms_accounts_transactions (host_id, property_id, account_head_id, amount, type, description, reference_type, reference_id, date) 
                 VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
                [o.owner_user_id, o.property_id, headId, o.total_amount, 'credit', `Food Order #${o.id} - ${o.guest_name}`, 'food_order', o.id, o.created_at]
            );
        }
        console.log(`Synced ${foodOrders.length} food orders.`);

        // 4. Sync Expenses
        console.log('Syncing Expenses...');
        const [expenses] = await pool.query(`
            SELECT e.*, pr.owner_id as host_id, u.id as owner_user_id
            FROM hms_expenses e
            JOIN properties pr ON e.property_id = pr.id
            JOIN property_owners po ON pr.owner_id = po.id
            JOIN users u ON po.user_id = u.id
        `);

        for (const e of expenses) {
            let [heads] = await pool.query('SELECT id FROM hms_accounts_heads WHERE (host_id = ? OR is_system = 1) AND name = ?', [e.owner_user_id, e.category || 'Operational Expense']);
            let headId;
            if (heads.length > 0) {
                headId = heads[0].id;
            } else {
                const [hResult] = await pool.query('INSERT INTO hms_accounts_heads (host_id, name, type) VALUES (?, ?, ?)', [e.owner_user_id, e.category || 'Operational Expense', 'expense']);
                headId = hResult.insertId;
            }

            await pool.query(
                `INSERT INTO hms_accounts_transactions (host_id, property_id, account_head_id, amount, type, description, reference_type, reference_id, date) 
                 VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
                [e.owner_user_id, e.property_id, headId, e.amount, 'debit', e.title || 'HMS Expense', 'expense', e.id, e.expense_date]
            );
        }
        console.log(`Synced ${expenses.length} expense records.`);

        // 5. Sync Refunds
        console.log('Syncing Completed Refunds...');
        const [refunds] = await pool.query(`
            SELECT r.*, b.property_id, pr.owner_id as host_id, u.id as owner_user_id
            FROM refunds r
            JOIN bookings b ON r.booking_id = b.id
            JOIN properties pr ON b.property_id = pr.id
            JOIN property_owners po ON pr.owner_id = po.id
            JOIN users u ON po.user_id = u.id
            WHERE r.status = 'completed'
        `);

        for (const refund of refunds) {
            let [heads] = await pool.query(
                'SELECT id FROM hms_accounts_heads WHERE (host_id = ? OR is_system = 1) AND name = ?',
                [refund.owner_user_id, 'Refunds/Cancellations']
            );
            
            let headId;
            if (heads.length > 0) {
                headId = heads[0].id;
            } else {
                const [hResult] = await pool.query(
                    'INSERT INTO hms_accounts_heads (host_id, name, type) VALUES (?, ?, ?)',
                    [refund.owner_user_id, 'Refunds/Cancellations', 'expense']
                );
                headId = hResult.insertId;
            }

            await pool.query(
                `INSERT INTO hms_accounts_transactions (host_id, property_id, account_head_id, amount, type, description, reference_type, reference_id, date) 
                 VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
                [
                    refund.owner_user_id, 
                    refund.property_id,
                    headId, 
                    refund.refund_amount, 
                    'debit', 
                    `Refund for Booking #${refund.booking_id} - Ref: ${refund.refund_reference}`, 
                    'refund', 
                    refund.id, 
                    refund.completed_at || new Date()
                ]
            );
        }

        console.log(`Synced ${refunds.length} refund records.`);

        console.log('--- Financial Sync Completed Successfully ---');
        process.exit(0);
    } catch (error) {
        console.error('Sync failed:', error);
        process.exit(1);
    }
}

syncAll();
