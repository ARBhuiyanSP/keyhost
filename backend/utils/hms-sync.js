const { pool } = require('../config/database');

/**
 * Synchronize a payment to HMS accounts if the property has HMS enabled
 * @param {number} paymentId - The ID of the payment record
 */
async function syncPaymentToHMSAccounts(paymentId) {
    try {
        console.log(`[HMS-SYNC] Syncing payment ${paymentId} to HMS accounts...`);
        
        // 1. Get payment and booking details
        const [rows] = await pool.query(`
            SELECT p.*, b.property_id, b.id as booking_id, b.security_deposit, pr.owner_id as owner_id, u.id as host_user_id, pr.is_hms_enabled
            FROM payments p
            JOIN bookings b ON p.booking_id = b.id
            JOIN properties pr ON b.property_id = pr.id
            JOIN property_owners po ON pr.owner_id = po.id
            JOIN users u ON po.user_id = u.id
            WHERE p.id = ?
        `, [paymentId]);

        if (rows.length === 0) {
            console.warn(`[HMS-SYNC] Payment ${paymentId} not found`);
            return;
        }

        const payment = rows[0];

        // 2. Check if HMS is enabled for this property
        if (!payment.is_hms_enabled) {
            console.log(`[HMS-SYNC] HMS not enabled for property ${payment.property_id}. Skipping sync.`);
            return;
        }

        // 3. Only sync completed payments (received money)
        if (payment.status !== 'completed' || payment.cr_amount <= 0) {
            console.log(`[HMS-SYNC] Payment ${paymentId} is not completed or has no CR amount. Skipping sync.`);
            return;
        }

        // 4. Check if already synced to avoid duplicates
        const [existing] = await pool.query(
            'SELECT id FROM hms_accounts_transactions WHERE reference_type = "payment" AND reference_id = ?',
            [paymentId]
        );

        if (existing.length > 0) {
            console.log(`[HMS-SYNC] Payment ${paymentId} already synced to HMS accounts.`);
            return;
        }

        // 5. Determine Head details and Net Amount to sync
        let headId;
        let amountToSync = parseFloat(payment.cr_amount) || 0;
        let description = `Room Revenue - Booking #${payment.booking_id} (Ref: ${payment.payment_reference})`;
        let headName = 'Room Revenue';
        let headType = 'income';

        if (payment.transaction_type === 'security_deposit_claim') {
            headName = 'Security Deposit Claims Received';
            description = `Security Deposit Claim - Booking #${payment.booking_id} (Ref: ${payment.payment_reference})`;
        } else {
            // Exclude security deposit from regular payment income credits
            const [completedRegularPayments] = await pool.query(
                `SELECT id, cr_amount FROM payments 
                 WHERE booking_id = ? AND status = 'completed' AND transaction_type != 'security_deposit_claim' 
                 ORDER BY id ASC`,
                [payment.booking_id]
            );

            let remainingSecurityDeposit = parseFloat(payment.security_deposit) || 0;
            let excludedForCurrentPayment = 0;

            for (const pItem of completedRegularPayments) {
                const pAmount = parseFloat(pItem.cr_amount) || 0;
                const excluded = Math.min(pAmount, remainingSecurityDeposit);
                remainingSecurityDeposit -= excluded;
                if (pItem.id === paymentId) {
                    excludedForCurrentPayment = excluded;
                    break;
                }
            }

            amountToSync = (parseFloat(payment.cr_amount) || 0) - excludedForCurrentPayment;
        }

        if (amountToSync <= 0) {
            console.log(`[HMS-SYNC] Net amount for payment ${paymentId} is <= 0 after security deposit exclusion. Skipping sync.`);
            return;
        }

        // Get or create Account Head
        let [heads] = await pool.query(
            'SELECT id FROM hms_accounts_heads WHERE (host_id = ? OR is_system = 1) AND name = ?',
            [payment.host_user_id, headName]
        );
        
        if (heads.length > 0) {
            headId = heads[0].id;
        } else {
            const [hResult] = await pool.query(
                'INSERT INTO hms_accounts_heads (host_id, name, type) VALUES (?, ?, ?)',
                [payment.host_user_id, headName, headType]
            );
            headId = hResult.insertId;
        }

        // 6. Record income transaction
        await pool.query(
            `INSERT INTO hms_accounts_transactions (host_id, property_id, account_head_id, amount, type, description, reference_type, reference_id, date) 
             VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [
                payment.host_user_id, 
                payment.property_id, 
                headId, 
                amountToSync, 
                'credit', 
                description, 
                'payment', 
                payment.id, 
                payment.payment_date || payment.created_at
            ]
        );

        // 7. Sync Platform Commission as Expense (only once per booking)
        try {
            // Check if commission for this booking is already synced
            const [existingComm] = await pool.query(
                'SELECT id FROM hms_accounts_transactions WHERE reference_type = "commission" AND reference_id = ?',
                [payment.booking_id]
            );

            if (existingComm.length === 0) {
                const [earnings] = await pool.query(
                    'SELECT commission_amount FROM admin_earnings WHERE booking_id = ? AND status = "active"',
                    [payment.booking_id]
                );

                if (earnings.length > 0 && earnings[0].commission_amount > 0) {
                    const commissionAmount = earnings[0].commission_amount;
                    
                    // Get or create Account Head (Platform Commission)
                    let [commHeads] = await pool.query(
                        'SELECT id FROM hms_accounts_heads WHERE (host_id = ? OR is_system = 1) AND name = ?',
                        [payment.host_user_id, 'Platform Commission']
                    );
                    
                    let commHeadId;
                    if (commHeads.length > 0) {
                        commHeadId = commHeads[0].id;
                    } else {
                        const [chResult] = await pool.query(
                            'INSERT INTO hms_accounts_heads (host_id, name, type) VALUES (?, ?, ?)',
                            [payment.host_user_id, 'Platform Commission', 'expense']
                        );
                        commHeadId = chResult.insertId;
                    }

                    // Record commission expense (using booking_id as reference_id)
                    await pool.query(
                        `INSERT INTO hms_accounts_transactions (host_id, property_id, account_head_id, amount, type, description, reference_type, reference_id, date) 
                         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
                        [
                            payment.host_user_id, 
                            payment.property_id, 
                            commHeadId, 
                            commissionAmount, 
                            'debit', 
                            `Platform Commission - Booking #${payment.booking_id}`, 
                            'commission', 
                            payment.booking_id, 
                            payment.payment_date || payment.created_at
                        ]
                    );
                    console.log(`[HMS-SYNC] Recorded platform commission ${commissionAmount} for booking ${payment.booking_id}`);
                }
            }
        } catch (commError) {
            console.error(`[HMS-SYNC] Failed to sync commission for payment ${paymentId}:`, commError);
        }

        console.log(`[HMS-SYNC] Successfully synced payment ${paymentId} to HMS accounts for property ${payment.property_id}`);
    } catch (error) {
        console.error(`[HMS-SYNC] Failed to sync payment ${paymentId} to HMS accounts:`, error);
    }
}

/**
 * Synchronize a payroll record to HMS accounts
 * @param {number} payrollId - The ID of the payroll record
 */
async function syncPayrollToHMSAccounts(payrollId) {
    try {
        console.log(`[HMS-SYNC] Syncing payroll ${payrollId} to HMS accounts...`);
        
        // 1. Get payroll details
        const [rows] = await pool.query(`
            SELECT p.*, e.name as employee_name, e.property_id as employee_property_id
            FROM hms_payrolls p
            JOIN hms_employees e ON p.employee_id = e.id
            WHERE p.id = ?
        `, [payrollId]);

        if (rows.length === 0) {
            console.warn(`[HMS-SYNC] Payroll ${payrollId} not found`);
            return;
        }

        const payroll = rows[0];

        // 2. Only sync paid payrolls
        if (payroll.status !== 'paid' || payroll.net_salary <= 0) {
            console.log(`[HMS-SYNC] Payroll ${payrollId} is not paid or has no salary. Skipping sync.`);
            return;
        }

        // 3. Check if already synced to avoid duplicates
        const [existing] = await pool.query(
            'SELECT id FROM hms_accounts_transactions WHERE reference_type = "payroll" AND reference_id = ?',
            [payrollId]
        );

        if (existing.length > 0) {
            console.log(`[HMS-SYNC] Payroll ${payrollId} already synced to HMS accounts.`);
            return;
        }

        // 4. Get or create Account Head (Staff Salary)
        let [heads] = await pool.query(
            'SELECT id FROM hms_accounts_heads WHERE (host_id = ? OR is_system = 1) AND name = ?',
            [payroll.host_id, 'Staff Salary']
        );
        
        let headId;
        if (heads.length > 0) {
            headId = heads[0].id;
        } else {
            const [hResult] = await pool.query(
                'INSERT INTO hms_accounts_heads (host_id, name, type) VALUES (?, ?, ?)',
                [payroll.host_id, 'Staff Salary', 'expense']
            );
            headId = hResult.insertId;
        }

        // Use employee's linked property or fallback to host's first property
        let finalPropertyId = payroll.employee_property_id;
        if (!finalPropertyId) {
            const [hostProps] = await pool.query('SELECT id FROM properties WHERE owner_id = (SELECT id FROM property_owners WHERE user_id = ?) LIMIT 1', [payroll.host_id]);
            finalPropertyId = hostProps.length > 0 ? hostProps[0].id : null;
        }

        // 5. Record transaction
        await pool.query(
            `INSERT INTO hms_accounts_transactions (host_id, property_id, account_head_id, amount, type, description, reference_type, reference_id, date) 
             VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [
                payroll.host_id, 
                finalPropertyId,
                headId, 
                payroll.net_salary, 
                'debit', 
                `Salary Payment - ${payroll.employee_name} (${payroll.month}/${payroll.year})`, 
                'payroll', 
                payroll.id, 
                payroll.payment_date || new Date().toISOString().split('T')[0]
            ]
        );

        console.log(`[HMS-SYNC] Successfully synced payroll ${payrollId} for ${payroll.employee_name}`);
    } catch (error) {
        console.error(`[HMS-SYNC] Failed to sync payroll ${payrollId} to HMS accounts:`, error);
    }
}

/**
 * Synchronize a food order to HMS accounts
 * @param {number} orderId - The ID of the food order
 */
async function syncFoodOrderToHMSAccounts(orderId) {
    try {
        console.log(`[HMS-SYNC] Syncing food order ${orderId} to HMS accounts...`);
        
        // 1. Get order details
        const [rows] = await pool.query(`
            SELECT o.*, pr.owner_id as host_id, u.id as host_user_id
            FROM hms_food_orders o
            JOIN properties pr ON o.property_id = pr.id
            JOIN property_owners po ON pr.owner_id = po.id
            JOIN users u ON po.user_id = u.id
            WHERE o.id = ?
        `, [orderId]);

        if (rows.length === 0) {
            console.warn(`[HMS-SYNC] Food order ${orderId} not found`);
            return;
        }

        const order = rows[0];

        // 2. Only sync paid orders
        if (order.payment_status !== 'paid' || order.total_amount <= 0) {
            console.log(`[HMS-SYNC] Food order ${orderId} is not paid. Skipping sync.`);
            return;
        }

        // 3. Check if already synced to avoid duplicates
        const [existing] = await pool.query(
            'SELECT id FROM hms_accounts_transactions WHERE reference_type = "food_order" AND reference_id = ?',
            [orderId]
        );

        if (existing.length > 0) {
            console.log(`[HMS-SYNC] Food order ${orderId} already synced to HMS accounts.`);
            return;
        }

        // 4. Get or create Account Head (Food & Beverage Income)
        let [heads] = await pool.query(
            'SELECT id FROM hms_accounts_heads WHERE (host_id = ? OR is_system = 1) AND name = ?',
            [order.host_user_id, 'Food & Beverage Income']
        );
        
        let headId;
        if (heads.length > 0) {
            headId = heads[0].id;
        } else {
            const [hResult] = await pool.query(
                'INSERT INTO hms_accounts_heads (host_id, name, type) VALUES (?, ?, ?)',
                [order.host_user_id, 'Food & Beverage Income', 'income']
            );
            headId = hResult.insertId;
        }

        // 5. Record transaction
        await pool.query(
            `INSERT INTO hms_accounts_transactions (host_id, property_id, account_head_id, amount, type, description, reference_type, reference_id, date) 
             VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [
                order.host_user_id, 
                order.property_id,
                headId, 
                order.total_amount, 
                'credit', 
                `Food Order #${order.id} - ${order.guest_name}`, 
                'food_order', 
                order.id, 
                order.created_at || new Date()
            ]
        );

        console.log(`[HMS-SYNC] Successfully synced food order ${orderId} for ${order.guest_name}`);
    } catch (error) {
        console.error(`[HMS-SYNC] Failed to sync food order ${orderId} to HMS accounts:`, error);
    }
}

/**
 * Synchronize a refund to HMS accounts
 * @param {number} refundId - The ID of the refund
 */
async function syncRefundToHMSAccounts(refundId) {
    try {
        console.log(`[HMS-SYNC] Syncing refund ${refundId} to HMS accounts...`);
        
        // 1. Get refund details
        const [rows] = await pool.query(`
            SELECT r.*, b.property_id, pr.owner_id as host_id, u.id as host_user_id
            FROM refunds r
            JOIN bookings b ON r.booking_id = b.id
            JOIN properties pr ON b.property_id = pr.id
            JOIN property_owners po ON pr.owner_id = po.id
            JOIN users u ON po.user_id = u.id
            WHERE r.id = ?
        `, [refundId]);

        if (rows.length === 0) {
            console.warn(`[HMS-SYNC] Refund ${refundId} not found`);
            return;
        }

        const refund = rows[0];

        // Skip security deposit refunds since the security deposit is already excluded from Room Revenue credits
        if (refund.refund_reference && refund.refund_reference.startsWith('SEC-REF')) {
            console.log(`[HMS-SYNC] Refund ${refundId} is a security deposit refund. Skipping sync to host ledger.`);
            return;
        }

        // 2. Only sync completed or processing refunds
        if (!['completed', 'processing'].includes(refund.status) || refund.refund_amount <= 0) {
            console.log(`[HMS-SYNC] Refund ${refundId} is not completed/processing or amount is 0. Skipping sync.`);
            return;
        }

        // 3. Check if already synced to avoid duplicates
        const [existing] = await pool.query(
            'SELECT id FROM hms_accounts_transactions WHERE reference_type = "refund" AND reference_id = ?',
            [refundId]
        );

        if (existing.length > 0) {
            console.log(`[HMS-SYNC] Refund ${refundId} already synced to HMS accounts.`);
            return;
        }

        // 4. Get or create Account Head (Refunds/Cancellations - expense)
        let [heads] = await pool.query(
            'SELECT id FROM hms_accounts_heads WHERE (host_id = ? OR is_system = 1) AND name = ?',
            [refund.host_user_id, 'Refunds/Cancellations']
        );
        
        let headId;
        if (heads.length > 0) {
            headId = heads[0].id;
        } else {
            const [hResult] = await pool.query(
                'INSERT INTO hms_accounts_heads (host_id, name, type) VALUES (?, ?, ?)',
                [refund.host_user_id, 'Refunds/Cancellations', 'expense']
            );
            headId = hResult.insertId;
        }

        // 5. Record transaction (Debit - since money is going out)
        await pool.query(
            `INSERT INTO hms_accounts_transactions (host_id, property_id, account_head_id, amount, type, description, reference_type, reference_id, date) 
             VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [
                refund.host_user_id, 
                refund.property_id,
                headId, 
                refund.refund_amount, 
                'debit', 
                `Refund for Booking #${refund.booking_id} - Ref: ${refund.refund_reference}`, 
                'refund', 
                refund.id, 
                refund.completed_at || refund.updated_at || new Date()
            ]
        );

        console.log(`[HMS-SYNC] Successfully synced refund ${refundId} for booking ${refund.booking_id}`);
    } catch (error) {
        console.error(`[HMS-SYNC] Failed to sync refund ${refundId} to HMS accounts:`, error);
    }
}

module.exports = {
    syncPaymentToHMSAccounts,
    syncPayrollToHMSAccounts,
    syncFoodOrderToHMSAccounts,
    syncRefundToHMSAccounts
};
