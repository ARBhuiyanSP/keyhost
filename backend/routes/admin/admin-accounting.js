const express = require('express');
const { pool } = require('../../config/database');
const { formatResponse } = require('../../utils/helpers');

const router = express.Router();

// =============================================
// GET EXPENSE CATEGORIES
// =============================================
router.get('/categories', async (req, res) => {
  try {
    const [categories] = await pool.execute(`
      SELECT * FROM admin_expense_categories WHERE is_active = 1 ORDER BY name ASC
    `);
    res.json(formatResponse(true, 'Expense categories fetched', categories));
  } catch (error) {
    console.error('Fetch expense categories error:', error);
    res.status(500).json(formatResponse(false, 'Failed to fetch categories', null, error.message));
  }
});

// =============================================
// CREATE EXPENSE CATEGORY
// =============================================
router.post('/categories', async (req, res) => {
  try {
    const { name, slug, description, icon } = req.body;
    if (!name) {
      return res.status(400).json(formatResponse(false, 'Category name is required'));
    }
    // Generate slug if not provided
    const categorySlug = slug || name.toLowerCase().replace(/[^a-z0-9]+/g, '_').replace(/(^_+|_+$)/g, '');
    const categoryIcon = icon || 'FiFolder';

    // Check if slug already exists
    const [existing] = await pool.execute('SELECT id FROM admin_expense_categories WHERE slug = ?', [categorySlug]);
    if (existing.length > 0) {
      return res.status(400).json(formatResponse(false, 'Category slug or name already exists'));
    }

    const [result] = await pool.execute(`
      INSERT INTO admin_expense_categories (name, slug, description, icon, is_active, created_at, updated_at)
      VALUES (?, ?, ?, ?, 1, NOW(), NOW())
    `, [name, categorySlug, description || null, categoryIcon]);

    const [newCategory] = await pool.execute('SELECT * FROM admin_expense_categories WHERE id = ?', [result.insertId]);

    res.json(formatResponse(true, 'Expense category created successfully', newCategory[0]));
  } catch (error) {
    console.error('Create expense category error:', error);
    res.status(500).json(formatResponse(false, 'Failed to create expense category', null, error.message));
  }
});

// =============================================
// UPDATE EXPENSE CATEGORY
// =============================================
router.put('/categories/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { name, description, icon, is_active } = req.body;
    if (!name) {
      return res.status(400).json(formatResponse(false, 'Category name is required'));
    }
    const [existing] = await pool.execute('SELECT id FROM admin_expense_categories WHERE id = ?', [id]);
    if (existing.length === 0) {
      return res.status(404).json(formatResponse(false, 'Category not found'));
    }
    await pool.execute(`
      UPDATE admin_expense_categories
      SET name = ?, description = ?, icon = ?, is_active = ?, updated_at = NOW()
      WHERE id = ?
    `, [name, description || null, icon || 'FiFolder', is_active !== undefined ? is_active : 1, id]);
    const [updated] = await pool.execute('SELECT * FROM admin_expense_categories WHERE id = ?', [id]);
    res.json(formatResponse(true, 'Category updated successfully', updated[0]));
  } catch (error) {
    console.error('Update expense category error:', error);
    res.status(500).json(formatResponse(false, 'Failed to update category', null, error.message));
  }
});

// =============================================
// GET PLATFORM EXPENSES (With Date Range & Category Filters)
// =============================================
router.get('/expenses', async (req, res) => {
  try {
    const { start_date, end_date, category_id, search } = req.query;

    let whereConditions = ['1=1'];
    let params = [];

    if (start_date) {
      whereConditions.push('e.expense_date >= ?');
      params.push(start_date);
    }
    if (end_date) {
      whereConditions.push('e.expense_date <= ?');
      params.push(end_date);
    }
    if (category_id && category_id !== 'all') {
      whereConditions.push('e.category_id = ?');
      params.push(parseInt(category_id));
    }
    if (search) {
      whereConditions.push('(e.title LIKE ? OR e.voucher_no LIKE ? OR e.notes LIKE ?)');
      const term = `%${search}%`;
      params.push(term, term, term);
    }

    const whereClause = whereConditions.join(' AND ');

    const [expenses] = await pool.execute(`
      SELECT 
        e.*,
        c.name as category_name,
        c.icon as category_icon,
        c.slug as category_slug
      FROM admin_expenses e
      JOIN admin_expense_categories c ON e.category_id = c.id
      WHERE ${whereClause}
      ORDER BY e.expense_date DESC, e.id DESC
    `, params);

    // Summary breakdown by category
    const [summaryRows] = await pool.execute(`
      SELECT 
        c.name as category_name,
        c.id as category_id,
        COALESCE(SUM(e.amount), 0) as total_amount
      FROM admin_expenses e
      JOIN admin_expense_categories c ON e.category_id = c.id
      WHERE ${whereClause}
      GROUP BY c.id, c.name
    `, params);

    const totalExpense = expenses.reduce((sum, e) => sum + parseFloat(e.amount || 0), 0);

    res.json(formatResponse(true, 'Expenses fetched', {
      expenses,
      summary_by_category: summaryRows,
      total_expense: totalExpense
    }));
  } catch (error) {
    console.error('Fetch expenses error:', error);
    res.status(500).json(formatResponse(false, 'Failed to fetch expenses', null, error.message));
  }
});

// =============================================
// CREATE PLATFORM EXPENSE ENTRY
// =============================================
router.post('/expenses', async (req, res) => {
  try {
    const { category_id, title, amount, expense_date, voucher_no, payment_method, receipt_url, notes } = req.body;

    if (!category_id || !title || !amount || !expense_date) {
      return res.status(400).json(formatResponse(false, 'Category, title, amount, and expense date are required'));
    }

    const created_by = req.user?.id || null;

    const [result] = await pool.execute(`
      INSERT INTO admin_expenses (
        category_id, title, amount, expense_date, voucher_no,
        payment_method, receipt_url, notes, created_by, created_at, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, NOW(), NOW())
    `, [
      category_id, title, parseFloat(amount), expense_date, voucher_no || null,
      payment_method || 'cash', receipt_url || null, notes || null, created_by
    ]);

    const [newExpense] = await pool.execute(`
      SELECT e.*, c.name as category_name, c.icon as category_icon
      FROM admin_expenses e
      JOIN admin_expense_categories c ON e.category_id = c.id
      WHERE e.id = ?
    `, [result.insertId]);

    res.json(formatResponse(true, 'Expense recorded successfully', newExpense[0]));
  } catch (error) {
    console.error('Create expense error:', error);
    res.status(500).json(formatResponse(false, 'Failed to record expense', null, error.message));
  }
});

// =============================================
// UPDATE PLATFORM EXPENSE
// =============================================
router.put('/expenses/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { category_id, title, amount, expense_date, voucher_no, payment_method, receipt_url, notes } = req.body;

    const [existing] = await pool.execute('SELECT id FROM admin_expenses WHERE id = ?', [id]);
    if (existing.length === 0) {
      return res.status(404).json(formatResponse(false, 'Expense record not found'));
    }

    await pool.execute(`
      UPDATE admin_expenses
      SET category_id = ?, title = ?, amount = ?, expense_date = ?, voucher_no = ?,
          payment_method = ?, receipt_url = ?, notes = ?, updated_at = NOW()
      WHERE id = ?
    `, [
      category_id, title, parseFloat(amount), expense_date, voucher_no || null,
      payment_method || 'cash', receipt_url || null, notes || null, id
    ]);

    const [updated] = await pool.execute(`
      SELECT e.*, c.name as category_name, c.icon as category_icon
      FROM admin_expenses e
      JOIN admin_expense_categories c ON e.category_id = c.id
      WHERE e.id = ?
    `, [id]);

    res.json(formatResponse(true, 'Expense record updated', updated[0]));
  } catch (error) {
    console.error('Update expense error:', error);
    res.status(500).json(formatResponse(false, 'Failed to update expense', null, error.message));
  }
});

// =============================================
// DELETE PLATFORM EXPENSE
// =============================================
router.delete('/expenses/:id', async (req, res) => {
  try {
    const { id } = req.params;
    await pool.execute('DELETE FROM admin_expenses WHERE id = ?', [id]);
    res.json(formatResponse(true, 'Expense entry deleted successfully'));
  } catch (error) {
    console.error('Delete expense error:', error);
    res.status(500).json(formatResponse(false, 'Failed to delete expense', null, error.message));
  }
});

// =============================================
// PROFIT & LOSS (P&L) STATEMENT REPORT
// =============================================
router.get('/profit-loss', async (req, res) => {
  try {
    const { start_date, end_date } = req.query;

    let revWhere = ["b.status IN ('confirmed', 'checked_in', 'checked_out')", "b.status != 'cancelled'"];
    let expWhere = ['1=1'];
    let revParams = [];
    let expParams = [];

    if (start_date) {
      revWhere.push('b.created_at >= ?');
      expWhere.push('e.expense_date >= ?');
      revParams.push(start_date + ' 00:00:00');
      expParams.push(start_date);
    }
    if (end_date) {
      revWhere.push('b.created_at <= ?');
      expWhere.push('e.expense_date <= ?');
      revParams.push(end_date + ' 23:59:59');
      expParams.push(end_date);
    }

    // 1. Total Booking Revenues & Commission
    const [bookingRevRows] = await pool.execute(`
      SELECT 
        COALESCE(SUM(b.admin_commission_amount), 0) as total_commission,
        COALESCE(SUM(b.total_amount), 0) as gross_booking_payments
      FROM bookings b
      WHERE ${revWhere.join(' AND ')} AND b.payment_status = 'paid'
    `, revParams);


    const bookingCommission = parseFloat(bookingRevRows[0]?.total_commission || 0);
    const grossBookingPayments = parseFloat(bookingRevRows[0]?.gross_booking_payments || 0);

    // 2. HMS Subscription SaaS Revenues
    const [subscriptionRows] = await pool.execute(`
      SELECT 
        COALESCE(SUM(amount), 0) as total_subscriptions,
        COALESCE(SUM(gateway_fee), 0) as total_gateway_fees
      FROM orders
      WHERE package_id IS NOT NULL AND status IN ('completed', 'Success', 'paid')
        ${start_date ? 'AND created_at >= ?' : ''}
        ${end_date ? 'AND created_at <= ?' : ''}
    `, [...(start_date ? [start_date + ' 00:00:00'] : []), ...(end_date ? [end_date + ' 23:59:59'] : [])]);

    const subscriptionRevenue = parseFloat(subscriptionRows[0]?.total_subscriptions || 0) - parseFloat(subscriptionRows[0]?.total_gateway_fees || 0);

    // Total Platform Revenue
    const totalRevenue = bookingCommission + subscriptionRevenue;

    // 3. Categorized Platform Expenses
    const [expenseCategoryRows] = await pool.execute(`
      SELECT 
        c.name as category_name,
        c.slug as category_slug,
        c.icon as category_icon,
        COALESCE(SUM(e.amount), 0) as total_amount
      FROM admin_expense_categories c
      LEFT JOIN admin_expenses e ON c.id = e.category_id AND ${expWhere.join(' AND ')}
      GROUP BY c.id, c.name, c.slug, c.icon
      ORDER BY total_amount DESC
    `, expParams);

    const totalExpense = expenseCategoryRows.reduce((sum, item) => sum + parseFloat(item.total_amount || 0), 0);

    // 4. Net Profit / Net Loss Calculation
    const netProfitLoss = totalRevenue - totalExpense;
    const isProfit = netProfitLoss >= 0;

    res.json(formatResponse(true, 'Profit & Loss Statement generated', {
      period: {
        start_date: start_date || 'Lifetime',
        end_date: end_date || 'Present'
      },
      revenue: {
        booking_commission: bookingCommission,
        hms_subscriptions: subscriptionRevenue,
        gross_booking_volume: grossBookingPayments,
        total_revenue: totalRevenue
      },
      expenses: {
        categories: expenseCategoryRows,
        total_expense: totalExpense
      },
      summary: {
        total_revenue: totalRevenue,
        total_expense: totalExpense,
        net_profit_loss: Math.abs(netProfitLoss),
        is_profit: isProfit,
        profit_margin_pct: totalRevenue > 0 ? Math.round((netProfitLoss / totalRevenue) * 100) : 0
      }
    }));
  } catch (error) {
    console.error('P&L report error:', error);
    res.status(500).json(formatResponse(false, 'Failed to generate P&L report', null, error.message));
  }
});

module.exports = router;
