const express = require('express');
const { pool } = require('../../config/database');
const { formatResponse } = require('../../utils/helpers');
const { verifyToken, requireHMSAccess, requireHMSPermission } = require('../../middleware/auth');

const router = express.Router();

router.use(verifyToken);
router.use(requireHMSAccess);
router.use(requireHMSPermission('manage_accounts'));

const getHostId = (req) => {
    return req.user.user_type === 'staff' ? req.user.host_id : req.user.id;
};

// --- Account Heads ---
router.get('/heads', async (req, res) => {
    try {
        const hostId = getHostId(req);
        const [rows] = await pool.query(
            'SELECT * FROM hms_accounts_heads WHERE host_id = ? OR is_system = 1 ORDER BY type, name',
            [hostId]
        );
        res.json(formatResponse(true, 'Account heads retrieved', { heads: rows }));
    } catch (error) {
        res.status(500).json(formatResponse(false, 'Failed to retrieve account heads', null, error.message));
    }
});

router.post('/heads', async (req, res) => {
    try {
        const hostId = getHostId(req);
        const { name, type, parent_id } = req.body;
        
        const [result] = await pool.query(
            'INSERT INTO hms_accounts_heads (host_id, name, type, parent_id) VALUES (?, ?, ?, ?)',
            [hostId, name, type, parent_id || null]
        );
        
        res.json(formatResponse(true, 'Account head created', { id: result.insertId }));
    } catch (error) {
        res.status(500).json(formatResponse(false, 'Failed to create account head', null, error.message));
    }
});

// --- Vouchers (Income/Expense) ---
router.get('/vouchers', async (req, res) => {
    try {
        const hostId = getHostId(req);
        const { property_id } = req.query;
        let query = 'SELECT v.*, u.first_name as creator_name FROM hms_accounts_vouchers v LEFT JOIN users u ON v.created_by = u.id WHERE v.host_id = ?';
        let params = [hostId];

        if (property_id) {
            query += ' AND v.property_id = ?';
            params.push(property_id);
        }

        query += ' ORDER BY v.date DESC, v.id DESC';
        const [rows] = await pool.query(query, params);
        res.json(formatResponse(true, 'Vouchers retrieved', { vouchers: rows }));
    } catch (error) {
        res.status(500).json(formatResponse(false, 'Failed to retrieve vouchers', null, error.message));
    }
});

router.post('/vouchers', async (req, res) => {
    const connection = await pool.getConnection();
    try {
        await connection.beginTransaction();
        const hostId = getHostId(req);
        const { type, date, total_amount, remarks, items, property_id } = req.body; // items: [{head_id, amount, description}]
        
        const voucherNo = `${type.toUpperCase()[0]}${Date.now().toString().slice(-6)}`;
        
        const creatorId = req.user.employee_user_id || req.user.id;
        const [vResult] = await connection.query(
            'INSERT INTO hms_accounts_vouchers (host_id, property_id, voucher_no, type, date, total_amount, remarks, created_by) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
            [hostId, property_id || null, voucherNo, type, date, total_amount, remarks, creatorId]
        );
        
        const voucherId = vResult.insertId;
        
        for (const item of items) {
            // Record transaction
            // Payment: Credit Cash/Bank (Asset), Debit Expense (Expense)
            // Receipt: Debit Cash/Bank (Asset), Credit Income (Income)
            const transType = type === 'payment' ? 'debit' : 'credit';
            
            await connection.query(
                'INSERT INTO hms_accounts_transactions (host_id, property_id, account_head_id, amount, type, description, reference_type, reference_id, date) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)',
                [hostId, property_id || null, item.head_id, item.amount, transType, item.description, 'voucher', voucherId, date]
            );
        }
        
        await connection.commit();
        res.json(formatResponse(true, 'Voucher recorded successfully', { id: voucherId, voucherNo }));
    } catch (error) {
        await connection.rollback();
        res.status(500).json(formatResponse(false, 'Failed to record voucher', null, error.message));
    } finally {
        connection.release();
    }
});

// --- Reports ---
router.get('/reports/summary', async (req, res) => {
    try {
        const hostId = getHostId(req);
        const { startDate, endDate, property_id } = req.query;
        
        // Updated queries to handle netting of credits and debits based on head type
        let incomeQuery = `
            SELECT SUM(CASE WHEN t.type = 'credit' THEN t.amount ELSE -t.amount END) as total 
            FROM hms_accounts_transactions t
            JOIN hms_accounts_heads h ON t.account_head_id = h.id
            WHERE t.host_id = ? AND h.type = 'income' AND t.date BETWEEN ? AND ?`;
            
        let expenseQuery = `
            SELECT SUM(CASE WHEN t.type = 'debit' THEN t.amount ELSE -t.amount END) as total 
            FROM hms_accounts_transactions t
            JOIN hms_accounts_heads h ON t.account_head_id = h.id
            WHERE t.host_id = ? AND h.type = 'expense' AND t.date BETWEEN ? AND ?`;
        
        let incomeBreakdownQuery = `
            SELECT h.name, SUM(CASE WHEN t.type = 'credit' THEN t.amount ELSE -t.amount END) as amount 
            FROM hms_accounts_transactions t
            JOIN hms_accounts_heads h ON t.account_head_id = h.id
            WHERE t.host_id = ? AND h.type = 'income' AND t.date BETWEEN ? AND ?
        `;
        
        let expenseBreakdownQuery = `
            SELECT h.name, SUM(CASE WHEN t.type = 'debit' THEN t.amount ELSE -t.amount END) as amount 
            FROM hms_accounts_transactions t
            JOIN hms_accounts_heads h ON t.account_head_id = h.id
            WHERE t.host_id = ? AND h.type = 'expense' AND t.date BETWEEN ? AND ?
        `;

        let params = [hostId, startDate, endDate];

        if (property_id) {
            incomeQuery += ' AND t.property_id = ?';
            expenseQuery += ' AND t.property_id = ?';
            incomeBreakdownQuery += ' AND t.property_id = ?';
            expenseBreakdownQuery += ' AND t.property_id = ?';
            params.push(property_id);
        }

        incomeBreakdownQuery += ' GROUP BY h.id, h.name';
        expenseBreakdownQuery += ' GROUP BY h.id, h.name';

        const [income] = await pool.query(incomeQuery, params);
        const [expense] = await pool.query(expenseQuery, params);
        const [incomeBreakdown] = await pool.query(incomeBreakdownQuery, params);
        const [expenseBreakdown] = await pool.query(expenseBreakdownQuery, params);
        
        res.json(formatResponse(true, 'Summary retrieved', {
            totalIncome: income[0].total || 0,
            totalExpense: expense[0].total || 0,
            netProfit: (income[0].total || 0) - (expense[0].total || 0),
            incomeBreakdown,
            expenseBreakdown
        }));
    } catch (error) {
        console.error('[HMS-ACCOUNTS] Summary error:', error);
        res.status(500).json(formatResponse(false, 'Failed to retrieve summary', null, error.message));
    }
});

module.exports = router;
