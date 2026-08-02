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

        if (property_id && property_id !== 'all') {
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

// --- Income Statement ---
router.get('/reports/income-statement', async (req, res) => {
    try {
        const hostId = getHostId(req);
        const { startDate, endDate, property_id } = req.query;

        if (!startDate || !endDate) {
            return res.status(400).json(formatResponse(false, 'startDate and endDate are required', null));
        }

        // 1. Fetch Income heads and sum
        let revenueQuery = `
            SELECT h.id as head_id, h.name as head_name, 
                   SUM(CASE WHEN t.type = 'credit' THEN t.amount ELSE -t.amount END) as amount
            FROM hms_accounts_transactions t
            JOIN hms_accounts_heads h ON t.account_head_id = h.id
            WHERE t.host_id = ? AND h.type = 'income' AND t.date BETWEEN ? AND ?
        `;
        
        // 2. Fetch Expense heads and sum
        let expenseQuery = `
            SELECT h.id as head_id, h.name as head_name, 
                   SUM(CASE WHEN t.type = 'debit' THEN t.amount ELSE -t.amount END) as amount
            FROM hms_accounts_transactions t
            JOIN hms_accounts_heads h ON t.account_head_id = h.id
            WHERE t.host_id = ? AND h.type = 'expense' AND t.date BETWEEN ? AND ?
        `;

        // 3. Fetch all transactions (Details view)
        let txQuery = `
            SELECT t.id, t.date, h.id as head_id, h.name as head_name, h.type as head_type, 
                   t.amount, t.type as trans_type, t.description, t.reference_type, t.reference_id,
                   p.title as property_name
            FROM hms_accounts_transactions t
            JOIN hms_accounts_heads h ON t.account_head_id = h.id
            LEFT JOIN properties p ON t.property_id = p.id
            WHERE t.host_id = ? AND t.date BETWEEN ? AND ?
        `;

        let params = [hostId, startDate, endDate];
        let txParams = [hostId, startDate, endDate];

        if (property_id && property_id !== 'all') {
            revenueQuery += ' AND t.property_id = ?';
            expenseQuery += ' AND t.property_id = ?';
            txQuery += ' AND t.property_id = ?';
            params.push(property_id);
            txParams.push(property_id);
        }

        revenueQuery += ' GROUP BY h.id, h.name';
        expenseQuery += ' GROUP BY h.id, h.name';
        txQuery += ' ORDER BY t.date DESC, t.id DESC';

        const [revenueRows] = await pool.query(revenueQuery, params);
        const [expenseRows] = await pool.query(expenseQuery, params);
        const [txRows] = await pool.query(txQuery, txParams);

        const revenues = revenueRows.filter(r => parseFloat(r.amount) !== 0);
        const expenses = expenseRows.filter(r => parseFloat(r.amount) !== 0);

        const totalRevenue = revenues.reduce((sum, r) => sum + parseFloat(r.amount || 0), 0);
        const totalExpenses = expenses.reduce((sum, r) => sum + parseFloat(r.amount || 0), 0);
        const netProfit = totalRevenue - totalExpenses;

        res.json(formatResponse(true, 'Income statement retrieved', {
            revenues,
            expenses,
            totalRevenue,
            totalExpenses,
            netProfit,
            transactions: txRows
        }));
    } catch (error) {
        console.error('[HMS-ACCOUNTS] Income Statement error:', error);
        res.status(500).json(formatResponse(false, 'Failed to retrieve income statement', null, error.message));
    }
});

// --- Balance Sheet ---
router.get('/reports/balance-sheet', async (req, res) => {
    try {
        const hostId = getHostId(req);
        const { startDate, endDate, property_id } = req.query;

        if (!startDate || !endDate) {
            return res.status(400).json(formatResponse(false, 'startDate and endDate are required', null));
        }

        // 1. Calculate Cash & Bank (Asset) up to endDate
        // Cash = ITD Credits - ITD Debits
        let cashQuery = `
            SELECT SUM(CASE WHEN t.type = 'credit' THEN t.amount ELSE -t.amount END) as balance
            FROM hms_accounts_transactions t
            WHERE t.host_id = ? AND t.date <= ?
        `;
        let cashParams = [hostId, endDate];
        if (property_id && property_id !== 'all') {
            cashQuery += ' AND t.property_id = ?';
            cashParams.push(property_id);
        }
        const [cashResult] = await pool.query(cashQuery, cashParams);
        const cashBalance = parseFloat(cashResult[0]?.balance || 0);

        // 2. Fetch Custom Asset accounts up to endDate (increased by debit, decreased by credit)
        let assetQuery = `
            SELECT h.id as head_id, h.name as head_name,
                   SUM(CASE WHEN t.type = 'debit' THEN t.amount ELSE -t.amount END) as amount
            FROM hms_accounts_transactions t
            JOIN hms_accounts_heads h ON t.account_head_id = h.id
            WHERE t.host_id = ? AND h.type = 'asset' AND t.date <= ?
        `;
        let assetParams = [hostId, endDate];
        if (property_id && property_id !== 'all') {
            assetQuery += ' AND t.property_id = ?';
            assetParams.push(property_id);
        }
        assetQuery += ' GROUP BY h.id, h.name';
        const [assetRows] = await pool.query(assetQuery, assetParams);
        const customAssets = assetRows.filter(r => parseFloat(r.amount) !== 0);

        // 3. Fetch Custom Liability accounts up to endDate (increased by credit, decreased by debit)
        let liabilityQuery = `
            SELECT h.id as head_id, h.name as head_name,
                   SUM(CASE WHEN t.type = 'credit' THEN t.amount ELSE -t.amount END) as amount
            FROM hms_accounts_transactions t
            JOIN hms_accounts_heads h ON t.account_head_id = h.id
            WHERE t.host_id = ? AND h.type = 'liability' AND t.date <= ?
        `;
        let liabilityParams = [hostId, endDate];
        if (property_id && property_id !== 'all') {
            liabilityQuery += ' AND t.property_id = ?';
            liabilityParams.push(property_id);
        }
        liabilityQuery += ' GROUP BY h.id, h.name';
        const [liabilityRows] = await pool.query(liabilityQuery, liabilityParams);
        const customLiabilities = liabilityRows.filter(r => parseFloat(r.amount) !== 0);

        // 4. Calculate Owner's Equity
        // - Retained Earnings: Net profit (Income credits/debits - Expense debits/credits) up to (startDate - 1)
        let retainedEarningsQuery = `
            SELECT SUM(CASE 
                WHEN h.type = 'income' AND t.type = 'credit' THEN t.amount
                WHEN h.type = 'income' AND t.type = 'debit' THEN -t.amount
                WHEN h.type = 'expense' AND t.type = 'debit' THEN -t.amount
                WHEN h.type = 'expense' AND t.type = 'credit' THEN t.amount
                ELSE 0 
            END) as balance
            FROM hms_accounts_transactions t
            JOIN hms_accounts_heads h ON t.account_head_id = h.id
            WHERE t.host_id = ? AND h.type IN ('income', 'expense') AND t.date < ?
        `;
        let reParams = [hostId, startDate];
        if (property_id && property_id !== 'all') {
            retainedEarningsQuery += ' AND t.property_id = ?';
            reParams.push(property_id);
        }
        const [reResult] = await pool.query(retainedEarningsQuery, reParams);
        const retainedEarnings = parseFloat(reResult[0]?.balance || 0);

        // - Current Earnings: Net profit (Income credits/debits - Expense debits/credits) from startDate to endDate
        let currentEarningsQuery = `
            SELECT SUM(CASE 
                WHEN h.type = 'income' AND t.type = 'credit' THEN t.amount
                WHEN h.type = 'income' AND t.type = 'debit' THEN -t.amount
                WHEN h.type = 'expense' AND t.type = 'debit' THEN -t.amount
                WHEN h.type = 'expense' AND t.type = 'credit' THEN t.amount
                ELSE 0 
            END) as balance
            FROM hms_accounts_transactions t
            JOIN hms_accounts_heads h ON t.account_head_id = h.id
            WHERE t.host_id = ? AND h.type IN ('income', 'expense') AND t.date BETWEEN ? AND ?
        `;
        let ceParams = [hostId, startDate, endDate];
        if (property_id && property_id !== 'all') {
            currentEarningsQuery += ' AND t.property_id = ?';
            ceParams.push(property_id);
        }
        const [ceResult] = await pool.query(currentEarningsQuery, ceParams);
        const currentEarnings = parseFloat(ceResult[0]?.balance || 0);

        // 5. Fetch asset/liability transactions up to endDate (Details View)
        let bsTxQuery = `
            SELECT t.id, t.date, h.id as head_id, h.name as head_name, h.type as head_type, 
                   t.amount, t.type as trans_type, t.description, t.reference_type, t.reference_id,
                   p.title as property_name
            FROM hms_accounts_transactions t
            JOIN hms_accounts_heads h ON t.account_head_id = h.id
            LEFT JOIN properties p ON t.property_id = p.id
            WHERE t.host_id = ? AND h.type IN ('asset', 'liability') AND t.date <= ?
        `;
        let bsTxParams = [hostId, endDate];
        if (property_id && property_id !== 'all') {
            bsTxQuery += ' AND t.property_id = ?';
            bsTxParams.push(property_id);
        }
        bsTxQuery += ' ORDER BY t.date DESC, t.id DESC';
        const [bsTxRows] = await pool.query(bsTxQuery, bsTxParams);

        // Calculate totals
        const totalAssets = cashBalance + customAssets.reduce((sum, a) => sum + parseFloat(a.amount || 0), 0);
        const totalLiabilities = customLiabilities.reduce((sum, l) => sum + parseFloat(l.amount || 0), 0);
        const totalEquity = retainedEarnings + currentEarnings;
        const totalLiabilitiesAndEquity = totalLiabilities + totalEquity;

        res.json(formatResponse(true, 'Balance sheet retrieved', {
            cashAndBank: cashBalance,
            customAssets,
            customLiabilities,
            retainedEarnings,
            currentEarnings,
            totalAssets,
            totalLiabilities,
            totalEquity,
            totalLiabilitiesAndEquity,
            transactions: bsTxRows
        }));
    } catch (error) {
        console.error('[HMS-ACCOUNTS] Balance Sheet error:', error);
        res.status(500).json(formatResponse(false, 'Failed to retrieve balance sheet', null, error.message));
    }
});

module.exports = router;
