const express = require('express');
const { pool } = require('../../config/database');
const { formatResponse } = require('../../utils/helpers');

const router = express.Router();

// =============================================
// GET ALL CORPORATE EMPLOYEES
// =============================================
router.get('/employees', async (req, res) => {
  try {
    const { search, department, status } = req.query;

    let whereConditions = ['1=1'];
    let params = [];

    if (department && department !== 'all') {
      whereConditions.push('e.department = ?');
      params.push(department);
    }
    if (status && status !== 'all') {
      whereConditions.push('e.status = ?');
      params.push(status);
    }
    if (search) {
      whereConditions.push('(e.name LIKE ? OR e.email LIKE ? OR e.phone LIKE ? OR e.designation LIKE ?)');
      const term = `%${search}%`;
      params.push(term, term, term, term);
    }

    const whereClause = whereConditions.join(' AND ');

    const [employees] = await pool.execute(`
      SELECT 
        e.*,
        p.permissions
      FROM admin_employees e
      LEFT JOIN admin_staff_permissions p ON e.id = p.employee_id
      WHERE ${whereClause}
      ORDER BY e.id DESC
    `, params);

    // Summary stats
    const totalStaff = employees.length;
    const activeStaff = employees.filter(e => e.status === 'active').length;
    const totalMonthlySalary = employees.reduce((sum, e) => sum + parseFloat(e.base_salary || 0), 0);

    res.json(formatResponse(true, 'Corporate employees fetched', {
      employees,
      stats: {
        total_staff: totalStaff,
        active_staff: activeStaff,
        total_monthly_payroll: totalMonthlySalary
      }
    }));
  } catch (error) {
    console.error('Fetch corporate employees error:', error);
    res.status(500).json(formatResponse(false, 'Failed to fetch employees', null, error.message));
  }
});

// =============================================
// CREATE CORPORATE EMPLOYEE
// =============================================
router.post('/employees', async (req, res) => {
  try {
    const { name, email, phone, designation, department, base_salary, joining_date, blood_group, nid_number, address, photo_url, nid_document_url } = req.body;

    if (!name || !email || !designation || base_salary === undefined) {
      return res.status(400).json(formatResponse(false, 'Name, email, designation, and base salary are required'));
    }

    const [existingEmail] = await pool.execute('SELECT id FROM admin_employees WHERE email = ?', [email]);
    if (existingEmail.length > 0) {
      return res.status(400).json(formatResponse(false, 'An employee with this email already exists'));
    }

    const [result] = await pool.execute(`
      INSERT INTO admin_employees (
        name, email, phone, designation, department, base_salary,
        joining_date, blood_group, nid_number, address, photo_url, nid_document_url, status, created_at, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'active', NOW(), NOW())
    `, [
      name, email, phone || null, designation, department || 'General', parseFloat(base_salary || 0),
      joining_date || null, blood_group || null, nid_number || null, address || null, photo_url || null, nid_document_url || null
    ]);

    const employeeId = result.insertId;

    // Initialize default permissions for corporate staff
    const defaultPermissions = JSON.stringify({
      dashboard: true,
      manage_bookings: true,
      manage_properties: false,
      manage_hosts: false,
      financials: false,
      hr: false,
      settings: false
    });

    await pool.execute(`
      INSERT INTO admin_staff_permissions (employee_id, permissions, created_at, updated_at)
      VALUES (?, ?, NOW(), NOW())
    `, [employeeId, defaultPermissions]);

    const [newEmp] = await pool.execute(`
      SELECT e.*, p.permissions
      FROM admin_employees e
      LEFT JOIN admin_staff_permissions p ON e.id = p.employee_id
      WHERE e.id = ?
    `, [employeeId]);

    res.json(formatResponse(true, 'Corporate employee created', newEmp[0]));
  } catch (error) {
    console.error('Create corporate employee error:', error);
    res.status(500).json(formatResponse(false, 'Failed to create employee', null, error.message));
  }
});

// =============================================
// UPDATE CORPORATE EMPLOYEE
// =============================================
router.put('/employees/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { name, email, phone, designation, department, base_salary, joining_date, blood_group, nid_number, address, photo_url, nid_document_url, status } = req.body;

    const [existing] = await pool.execute('SELECT id FROM admin_employees WHERE id = ?', [id]);
    if (existing.length === 0) {
      return res.status(404).json(formatResponse(false, 'Employee profile not found'));
    }

    await pool.execute(`
      UPDATE admin_employees
      SET name = ?, email = ?, phone = ?, designation = ?, department = ?,
          base_salary = ?, joining_date = ?, blood_group = ?, nid_number = ?,
          address = ?, photo_url = ?, nid_document_url = ?, status = ?, updated_at = NOW()
      WHERE id = ?
    `, [
      name, email, phone || null, designation, department || 'General',
      parseFloat(base_salary || 0), joining_date || null, blood_group || null,
      nid_number || null, address || null, photo_url || null, nid_document_url || null, status || 'active', id
    ]);

    const [updated] = await pool.execute(`
      SELECT e.*, p.permissions
      FROM admin_employees e
      LEFT JOIN admin_staff_permissions p ON e.id = p.employee_id
      WHERE e.id = ?
    `, [id]);

    res.json(formatResponse(true, 'Employee profile updated', updated[0]));
  } catch (error) {
    console.error('Update corporate employee error:', error);
    res.status(500).json(formatResponse(false, 'Failed to update employee', null, error.message));
  }
});

// =============================================
// UPDATE STAFF GRANULAR PERMISSIONS MATRIX
// =============================================
router.put('/employees/:id/permissions', async (req, res) => {
  try {
    const { id } = req.params;
    const { permissions } = req.body;

    if (!permissions) {
      return res.status(400).json(formatResponse(false, 'Permissions data object required'));
    }

    const permJson = typeof permissions === 'string' ? permissions : JSON.stringify(permissions);

    await pool.execute(`
      INSERT INTO admin_staff_permissions (employee_id, permissions, created_at, updated_at)
      VALUES (?, ?, NOW(), NOW())
      ON DUPLICATE KEY UPDATE permissions = VALUES(permissions), updated_at = NOW()
    `, [id, permJson]);

    res.json(formatResponse(true, 'Staff permissions matrix updated successfully'));
  } catch (error) {
    console.error('Update permissions error:', error);
    res.status(500).json(formatResponse(false, 'Failed to update permissions', null, error.message));
  }
});

// =============================================
// GET MONTHLY PAYROLL SHEET
// =============================================
router.get('/payrolls', async (req, res) => {
  try {
    const { month, year } = req.query;
    const curDate = new Date();
    const targetMonth = month ? parseInt(month) : curDate.getMonth() + 1;
    const targetYear = year ? parseInt(year) : curDate.getFullYear();

    const [payrolls] = await pool.execute(`
      SELECT 
        p.*,
        e.name as employee_name,
        e.email as employee_email,
        e.designation,
        e.department,
        e.photo_url
      FROM admin_payrolls p
      JOIN admin_employees e ON p.employee_id = e.id
      WHERE p.month = ? AND p.year = ?
      ORDER BY e.name ASC
    `, [targetMonth, targetYear]);

    res.json(formatResponse(true, 'Payroll sheet fetched', {
      month: targetMonth,
      year: targetYear,
      payrolls
    }));
  } catch (error) {
    console.error('Fetch payrolls error:', error);
    res.status(500).json(formatResponse(false, 'Failed to fetch payroll sheet', null, error.message));
  }
});

// =============================================
// GENERATE MONTHLY PAYROLL SHEET
// =============================================
router.post('/payrolls/generate', async (req, res) => {
  try {
    const { month, year } = req.body;
    const curDate = new Date();
    const targetMonth = month ? parseInt(month) : curDate.getMonth() + 1;
    const targetYear = year ? parseInt(year) : curDate.getFullYear();

    // Fetch all active employees
    const [employees] = await pool.execute(`
      SELECT id, name, base_salary FROM admin_employees WHERE status = 'active'
    `);

    if (employees.length === 0) {
      return res.status(400).json(formatResponse(false, 'No active employees found to generate payroll'));
    }

    let generatedCount = 0;
    for (const emp of employees) {
      const baseSal = parseFloat(emp.base_salary || 0);
      await pool.execute(`
        INSERT INTO admin_payrolls (
          employee_id, month, year, base_salary, bonus_allowance, deduction, net_salary, payment_status, created_at, updated_at
        ) VALUES (?, ?, ?, ?, 0.00, 0.00, ?, 'pending', NOW(), NOW())
        ON DUPLICATE KEY UPDATE base_salary = VALUES(base_salary), updated_at = NOW()
      `, [emp.id, targetMonth, targetYear, baseSal, baseSal]);
      generatedCount++;
    }

    res.json(formatResponse(true, `Payroll sheet generated for ${generatedCount} employees`));
  } catch (error) {
    console.error('Generate payroll error:', error);
    res.status(500).json(formatResponse(false, 'Failed to generate payroll sheet', null, error.message));
  }
});

// =============================================
// PROCESS SALARY PAYMENT & AUTO-HIT ACCOUNTS (`admin_expenses`)
// =============================================
router.post('/payrolls/:id/pay', async (req, res) => {
  try {
    const { id } = req.params;
    const { bonus_allowance, deduction, payment_method, notes } = req.body;

    const [payrolls] = await pool.execute(`
      SELECT p.*, e.name as employee_name, e.designation
      FROM admin_payrolls p
      JOIN admin_employees e ON p.employee_id = e.id
      WHERE p.id = ?
    `, [id]);

    if (payrolls.length === 0) {
      return res.status(404).json(formatResponse(false, 'Payroll record not found'));
    }

    const payroll = payrolls[0];
    const baseSal = parseFloat(payroll.base_salary || 0);
    const bonus = parseFloat(bonus_allowance || payroll.bonus_allowance || 0);
    const deduct = parseFloat(deduction || payroll.deduction || 0);
    const netSalary = Math.max(0, baseSal + bonus - deduct);

    // Get "Staff Salaries & Benefits" category id
    const [salCat] = await pool.execute(`
      SELECT id FROM admin_expense_categories WHERE slug = 'salaries' OR name LIKE '%Salaries%' LIMIT 1
    `);
    const categoryId = salCat[0]?.id || 5;

    // 1. AUTO-HIT ACCOUNTS: Create debit entry in `admin_expenses`
    const voucherNo = `SAL-${payroll.year}${String(payroll.month).padStart(2, '0')}-${payroll.employee_id}`;
    const expTitle = `Salary Disbursement - ${payroll.employee_name} (${payroll.designation})`;
    const expDate = new Date().toISOString().split('T')[0];

    const [expResult] = await pool.execute(`
      INSERT INTO admin_expenses (
        category_id, title, amount, expense_date, voucher_no, payment_method, notes, created_by, created_at, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, NOW(), NOW())
    `, [
      categoryId, expTitle, netSalary, expDate, voucherNo, payment_method || 'bank_transfer',
      notes || `Monthly salary for ${payroll.month}/${payroll.year}`, req.user?.id || null
    ]);

    const expenseId = expResult.insertId;

    // 2. Mark Payroll status as paid
    await pool.execute(`
      UPDATE admin_payrolls
      SET bonus_allowance = ?, deduction = ?, net_salary = ?,
          payment_status = 'paid', payment_date = NOW(), expense_id = ?, notes = ?, updated_at = NOW()
      WHERE id = ?
    `, [bonus, deduct, netSalary, expenseId, notes || null, id]);

    res.json(formatResponse(true, 'Salary paid successfully! Transaction debited in platform accounts.', {
      payroll_id: id,
      net_salary: netSalary,
      expense_voucher: voucherNo
    }));
  } catch (error) {
    console.error('Pay salary error:', error);
    res.status(500).json(formatResponse(false, 'Failed to process salary payment', null, error.message));
  }
});

module.exports = router;
