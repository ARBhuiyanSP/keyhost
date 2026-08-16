const express = require('express');
const { pool } = require('../../config/database');
const { formatResponse } = require('../../utils/helpers');
const { verifyToken, requireHMSAccess, requireHMSPermission } = require('../../middleware/auth');
const { processBase64Image } = require('../../utils/imageProcessor');
const { syncPayrollToHMSAccounts } = require('../../utils/hms-sync');

const router = express.Router();

router.use(verifyToken);
// requireHMSAccess ensures the user has a valid HMS subscription and identifies the host_id
router.use(requireHMSAccess);

// --- Attendance (Personal endpoints for staff, do not require manage_hr permission) ---
router.get('/attendance/my', async (req, res) => {
    try {
        const [emp] = await pool.query('SELECT id FROM hms_employees WHERE user_id = ?', [req.user.id]);
        if (emp.length === 0) return res.status(404).json(formatResponse(false, 'Employee profile not found'));
        
        const employeeId = emp[0].id;
        const today = new Date().toISOString().split('T')[0];
        
        const [attendance] = await pool.query(
            'SELECT * FROM hms_attendance WHERE employee_id = ? AND date = ?',
            [employeeId, today]
        );

        const [roster] = await pool.query(
            'SELECT r.*, s.name as shift_name, s.start_time, s.end_time FROM hms_rosters r LEFT JOIN hms_shifts s ON r.shift_id = s.id WHERE r.employee_id = ? AND r.date = ?',
            [employeeId, today]
        );

        res.json(formatResponse(true, 'Attendance status retrieved', { 
            attendance: attendance[0] || null,
            roster: roster[0] || null
        }));
    } catch (error) {
        res.status(500).json(formatResponse(false, 'Failed to retrieve attendance status', null, error.message));
    }
});

router.post('/attendance/punch', async (req, res) => {
    try {
        const [emp] = await pool.query('SELECT id, host_id FROM hms_employees WHERE user_id = ?', [req.user.id]);
        if (emp.length === 0) return res.status(404).json(formatResponse(false, 'Employee profile not found'));
        
        const employeeId = emp[0].id;
        const hostId = emp[0].host_id;
        const today = new Date().toISOString().split('T')[0];
        const now = new Date();
        const ip = req.ip;

        const [existing] = await pool.query(
            'SELECT * FROM hms_attendance WHERE employee_id = ? AND date = ?',
            [employeeId, today]
        );

        if (existing.length === 0) {
            // Punch In
            await pool.query(
                `INSERT INTO hms_attendance (host_id, employee_id, date, punch_in, punch_in_ip, status) 
                 VALUES (?, ?, ?, ?, ?, 'present')`,
                [hostId, employeeId, today, now, ip]
            );
            res.json(formatResponse(true, 'Punched in successfully', { type: 'in', time: now }));
        } else if (!existing[0].punch_out) {
            // Punch Out
            const punchInTime = new Date(existing[0].punch_in);
            const workHours = (now - punchInTime) / (1000 * 60 * 60);
            
            await pool.query(
                `UPDATE hms_attendance SET punch_out = ?, punch_out_ip = ?, work_hours = ? 
                 WHERE id = ?`,
                [now, ip, workHours.toFixed(2), existing[0].id]
            );
            res.json(formatResponse(true, 'Punched out successfully', { type: 'out', time: now }));
        } else {
            res.status(400).json(formatResponse(false, 'Already punched out for today'));
        }
    } catch (error) {
        res.status(500).json(formatResponse(false, 'Action failed', null, error.message));
    }
});

// --- Employees list (Required for housekeeping dropdowns as well) ---
router.get('/employees', requireHMSPermission(['manage_hr', 'manage_housekeeping']), async (req, res) => {
    try {
        const hostId = getHostId(req);
        const [rows] = await pool.query(`
            SELECT e.*, d.name as department_name, ds.name as designation_name, s.name as shift_name
            FROM hms_employees e
            LEFT JOIN hms_departments d ON e.department_id = d.id
            LEFT JOIN hms_designations ds ON e.designation_id = ds.id
            LEFT JOIN hms_shifts s ON e.shift_id = s.id
            WHERE e.host_id = ?
            ORDER BY e.name ASC
        `, [hostId]);
        res.json(formatResponse(true, 'Employees retrieved successfully', { employees: rows }));
    } catch (error) {
        res.status(500).json(formatResponse(false, 'Failed to retrieve employees', null, error.message));
    }
});

// All subsequent routes require the HR manager permission
router.use(requireHMSPermission('manage_hr'));

const getHostId = (req) => {
    return req.user.user_type === 'staff' ? req.user.host_id : req.user.id;
};

// --- Departments ---
router.get('/departments', async (req, res) => {
    try {
        const hostId = getHostId(req);
        const [rows] = await pool.query(
            'SELECT * FROM hms_departments WHERE host_id = ? ORDER BY name ASC',
            [hostId]
        );
        res.json(formatResponse(true, 'Departments retrieved successfully', { departments: rows }));
    } catch (error) {
        res.status(500).json(formatResponse(false, 'Failed to retrieve departments', null, error.message));
    }
});

router.post('/departments', async (req, res) => {
    try {
        const hostId = getHostId(req);
        const { name, description, status } = req.body;
        const [result] = await pool.query(
            'INSERT INTO hms_departments (host_id, name, description, status) VALUES (?, ?, ?, ?)',
            [hostId, name, description, status || 'active']
        );
        res.status(201).json(formatResponse(true, 'Department created successfully', { id: result.insertId }));
    } catch (error) {
        res.status(500).json(formatResponse(false, 'Failed to create department', null, error.message));
    }
});

router.put('/departments/:id', async (req, res) => {
    try {
        const hostId = getHostId(req);
        const { name, description, status } = req.body;
        await pool.query(
            'UPDATE hms_departments SET name = ?, description = ?, status = ? WHERE id = ? AND host_id = ?',
            [name, description, status, req.params.id, hostId]
        );
        res.json(formatResponse(true, 'Department updated successfully'));
    } catch (error) {
        res.status(500).json(formatResponse(false, 'Failed to update department', null, error.message));
    }
});

router.delete('/departments/:id', async (req, res) => {
    try {
        const hostId = getHostId(req);
        await pool.query('DELETE FROM hms_departments WHERE id = ? AND host_id = ?', [req.params.id, hostId]);
        res.json(formatResponse(true, 'Department deleted successfully'));
    } catch (error) {
        res.status(500).json(formatResponse(false, 'Failed to delete department', null, error.message));
    }
});

// --- Designations ---
router.get('/designations', async (req, res) => {
    try {
        const hostId = getHostId(req);
        const [rows] = await pool.query(
            'SELECT * FROM hms_designations WHERE host_id = ? ORDER BY name ASC',
            [hostId]
        );
        res.json(formatResponse(true, 'Designations retrieved successfully', { designations: rows }));
    } catch (error) {
        res.status(500).json(formatResponse(false, 'Failed to retrieve designations', null, error.message));
    }
});

router.post('/designations', async (req, res) => {
    try {
        const hostId = getHostId(req);
        const { name, description, status } = req.body;
        const [result] = await pool.query(
            'INSERT INTO hms_designations (host_id, name, description, status) VALUES (?, ?, ?, ?)',
            [hostId, name, description, status || 'active']
        );
        res.status(201).json(formatResponse(true, 'Designation created successfully', { id: result.insertId }));
    } catch (error) {
        res.status(500).json(formatResponse(false, 'Failed to create designation', null, error.message));
    }
});

router.put('/designations/:id', async (req, res) => {
    try {
        const hostId = getHostId(req);
        const { name, description, status } = req.body;
        await pool.query(
            'UPDATE hms_designations SET name = ?, description = ?, status = ? WHERE id = ? AND host_id = ?',
            [name, description, status, req.params.id, hostId]
        );
        res.json(formatResponse(true, 'Designation updated successfully'));
    } catch (error) {
        res.status(500).json(formatResponse(false, 'Failed to update designation', null, error.message));
    }
});

router.delete('/designations/:id', async (req, res) => {
    try {
        const hostId = getHostId(req);
        await pool.query('DELETE FROM hms_designations WHERE id = ? AND host_id = ?', [req.params.id, hostId]);
        res.json(formatResponse(true, 'Designation deleted successfully'));
    } catch (error) {
        res.status(500).json(formatResponse(false, 'Failed to delete designation', null, error.message));
    }
});

// --- Shifts ---
router.get('/shifts', async (req, res) => {
    try {
        const hostId = getHostId(req);
        const [rows] = await pool.query(
            'SELECT * FROM hms_shifts WHERE host_id = ? ORDER BY name ASC',
            [hostId]
        );
        res.json(formatResponse(true, 'Shifts retrieved successfully', { shifts: rows }));
    } catch (error) {
        res.status(500).json(formatResponse(false, 'Failed to retrieve shifts', null, error.message));
    }
});

router.post('/shifts', async (req, res) => {
    try {
        const hostId = getHostId(req);
        const { name, start_time, end_time, status } = req.body;
        const [result] = await pool.query(
            'INSERT INTO hms_shifts (host_id, name, start_time, end_time, status) VALUES (?, ?, ?, ?, ?)',
            [hostId, name, start_time, end_time, status || 'active']
        );
        res.status(201).json(formatResponse(true, 'Shift created successfully', { id: result.insertId }));
    } catch (error) {
        res.status(500).json(formatResponse(false, 'Failed to create shift', null, error.message));
    }
});

// --- Employees Management (manage_hr only) ---

router.post('/employees', async (req, res) => {
    const connection = await pool.getConnection();
    try {
        await connection.beginTransaction();
        const hostId = getHostId(req);
        const { 
            name, email, phone, salary, property_id, designation_id, department_id, shift_id, 
            blood_group, date_of_birth, appointment_date, joining_date, address, photo, 
            status, role, permissions, password 
        } = req.body;

        // Check if email already exists in hms_employees for this host
        const [existingEmp] = await connection.query(
            'SELECT id FROM hms_employees WHERE email = ? AND host_id = ?', 
            [email, hostId]
        );
        if (existingEmp.length > 0) {
            await connection.rollback();
            return res.status(400).json(formatResponse(false, 'An employee with this email already exists'));
        }

        // Check if user already exists in users table
        const [existingUsers] = await connection.query('SELECT id FROM users WHERE email = ?', [email]);
        let userId = null;

        if (existingUsers.length > 0) {
            userId = existingUsers[0].id;
            
            // Check if this existing user is already linked to another employee
            const [existingLink] = await connection.query('SELECT id FROM hms_employees WHERE user_id = ?', [userId]);
            if (existingLink.length > 0) {
                await connection.rollback();
                return res.status(400).json(formatResponse(false, 'This email is already linked to another employee account'));
            }
        } else if (password) {
            // Check if phone number is already registered in users table
            if (phone) {
                const [existingPhone] = await connection.query('SELECT id FROM users WHERE phone = ?', [phone]);
                if (existingPhone.length > 0) {
                    await connection.rollback();
                    return res.status(400).json(formatResponse(false, 'Phone number is already in use by another user account'));
                }
            }

            // Create user for login if password provided
            const { hashPassword } = require('../../utils/helpers');
            const hashedPassword = await hashPassword(password);
            const [userResult] = await connection.query(
                `INSERT INTO users (first_name, last_name, email, phone, password, user_type, host_id, is_active, created_at) 
                 VALUES (?, ?, ?, ?, ?, 'staff', ?, 1, NOW())`,
                [name.split(' ')[0], name.split(' ').slice(1).join(' ') || '', email, phone, hashedPassword, hostId]
            );
            userId = userResult.insertId;
        }

        // Process photo if provided
        const photoUrl = photo ? await processBase64Image(photo, 'emp', 'employees') : null;

        const [result] = await connection.query(
            `INSERT INTO hms_employees (
                host_id, property_id, user_id, name, email, phone, salary, designation_id, department_id, shift_id, 
                blood_group, date_of_birth, appointment_date, joining_date, address, photo, status, role, permissions
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [
                hostId, 
                property_id || null,
                userId, 
                name, 
                email, 
                phone, 
                salary || 0, 
                designation_id || null, 
                department_id || null, 
                shift_id || null, 
                blood_group || null, 
                date_of_birth || null, 
                appointment_date || null, 
                joining_date || null, 
                address, 
                photoUrl, 
                status || 'active', 
                role || 'staff', 
                JSON.stringify(permissions || {})
            ]
        );

        await connection.commit();
        res.status(201).json(formatResponse(true, 'Employee added successfully', { id: result.insertId }));
    } catch (error) {
        await connection.rollback();
        let errorMsg = error.message;
        if (error.code === 'ER_DUP_ENTRY') {
            if (error.message.includes("key 'phone'")) {
                errorMsg = 'Phone number is already in use by another user account';
            } else if (error.message.includes("key 'email'")) {
                errorMsg = 'Email is already in use by another user account';
            }
        }
        res.status(error.code === 'ER_DUP_ENTRY' ? 400 : 500).json(formatResponse(false, 'Failed to add employee', null, errorMsg));
    } finally {
        connection.release();
    }
});

router.put('/employees/:id', async (req, res) => {
    const connection = await pool.getConnection();
    try {
        await connection.beginTransaction();
        const hostId = getHostId(req);
        const { 
            name, email, phone, salary, property_id, designation_id, department_id, shift_id, 
            blood_group, date_of_birth, appointment_date, joining_date, address, photo, 
            status, role, permissions, password 
        } = req.body;

        // Process photo if provided
        const photoUrl = photo ? await processBase64Image(photo, 'emp', 'employees') : null;

        // Get the current employee to find the user_id
        const [currentEmp] = await connection.query('SELECT user_id FROM hms_employees WHERE id = ? AND host_id = ?', [req.params.id, hostId]);
        
        if (currentEmp.length === 0) {
            await connection.rollback();
            return res.status(404).json(formatResponse(false, 'Employee not found'));
        }

        let userId = currentEmp[0].user_id;

        // Check if email is already in use by another employee of this host
        const [existingEmp] = await connection.query(
            'SELECT id FROM hms_employees WHERE email = ? AND host_id = ? AND id != ?', 
            [email, hostId, req.params.id]
        );
        if (existingEmp.length > 0) {
            await connection.rollback();
            return res.status(400).json(formatResponse(false, 'An employee with this email already exists'));
        }

        // Check if email is already in use by another user in the users table
        const [dupEmail] = await connection.query(
            'SELECT id FROM users WHERE email = ? AND id != ?', 
            [email, userId || 0]
        );
        if (dupEmail.length > 0) {
            await connection.rollback();
            return res.status(400).json(formatResponse(false, 'Email is already in use by another user account'));
        }

        // Check if phone number is already in use by another user in the users table
        if (phone) {
            const [dupPhone] = await connection.query(
                'SELECT id FROM users WHERE phone = ? AND id != ?', 
                [phone, userId || 0]
            );
            if (dupPhone.length > 0) {
                await connection.rollback();
                return res.status(400).json(formatResponse(false, 'Phone number is already in use by another user account'));
            }
        }

        // If no user exists but a password is provided, create a user
        if (!userId && password) {
            const { hashPassword } = require('../../utils/helpers');
            const hashedPassword = await hashPassword(password);
            const [userResult] = await connection.query(
                `INSERT INTO users (first_name, last_name, email, phone, password, user_type, host_id, is_active, created_at) 
                 VALUES (?, ?, ?, ?, ?, 'staff', ?, 1, NOW())`,
                [name.split(' ')[0], name.split(' ').slice(1).join(' ') || '', email, phone, hashedPassword, hostId]
            );
            userId = userResult.insertId;
        }

        // Update employee record
        await connection.query(
            `UPDATE hms_employees SET 
                name = ?, email = ?, phone = ?, salary = ?, property_id = ?, designation_id = ?, department_id = ?, shift_id = ?, 
                blood_group = ?, date_of_birth = ?, appointment_date = ?, joining_date = ?, address = ?, photo = ?, 
                status = ?, role = ?, permissions = ?, user_id = ?
            WHERE id = ? AND host_id = ?`,
            [
                name, email, phone, salary || 0, property_id || null, designation_id || null, department_id || null, shift_id || null, 
                blood_group || null, date_of_birth || null, appointment_date || null, joining_date || null, 
                address, photoUrl, status, role, JSON.stringify(permissions || {}), userId, req.params.id, hostId
            ]
        );

        // If employee has a linked user account, update that too
        if (userId) {
            const updateFields = [email, phone, name.split(' ')[0], name.split(' ').slice(1).join(' ') || ''];
            let query = 'UPDATE users SET email = ?, phone = ?, first_name = ?, last_name = ?';
            
            if (password) {
                const { hashPassword } = require('../../utils/helpers');
                const hashedPassword = await hashPassword(password);
                query += ', password = ?';
                updateFields.push(hashedPassword);
            }
            
            query += ' WHERE id = ?';
            updateFields.push(userId);
            
            await connection.query(query, updateFields);
        }

        await connection.commit();
        res.json(formatResponse(true, 'Employee and login account updated successfully'));
    } catch (error) {
        await connection.rollback();
        let errorMsg = error.message;
        if (error.code === 'ER_DUP_ENTRY') {
            if (error.message.includes("key 'phone'")) {
                errorMsg = 'Phone number is already in use by another user account';
            } else if (error.message.includes("key 'email'")) {
                errorMsg = 'Email is already in use by another user account';
            }
        }
        res.status(error.code === 'ER_DUP_ENTRY' ? 400 : 500).json(formatResponse(false, 'Failed to update employee', null, errorMsg));
    } finally {
        connection.release();
    }
});

// --- Allowances & Deductions ---
router.get('/allowances', async (req, res) => {
    try {
        const hostId = getHostId(req);
        const [rows] = await pool.query('SELECT * FROM hms_allowances WHERE host_id = ?', [hostId]);
        res.json(formatResponse(true, 'Allowances retrieved successfully', { allowances: rows }));
    } catch (error) {
        res.status(500).json(formatResponse(false, 'Failed to retrieve allowances', null, error.message));
    }
});

router.post('/allowances', async (req, res) => {
    try {
        const hostId = getHostId(req);
        const { name, amount_type, amount } = req.body;
        await pool.query(
            'INSERT INTO hms_allowances (host_id, name, amount_type, amount) VALUES (?, ?, ?, ?)',
            [hostId, name, amount_type, amount]
        );
        res.status(201).json(formatResponse(true, 'Allowance created successfully'));
    } catch (error) {
        res.status(500).json(formatResponse(false, 'Failed to create allowance', null, error.message));
    }
});

router.get('/deductions', async (req, res) => {
    try {
        const hostId = getHostId(req);
        const [rows] = await pool.query('SELECT * FROM hms_deductions WHERE host_id = ?', [hostId]);
        res.json(formatResponse(true, 'Deductions retrieved successfully', { deductions: rows }));
    } catch (error) {
        res.status(500).json(formatResponse(false, 'Failed to retrieve deductions', null, error.message));
    }
});

router.post('/deductions', async (req, res) => {
    try {
        const hostId = getHostId(req);
        const { name, amount_type, amount } = req.body;
        await pool.query(
            'INSERT INTO hms_deductions (host_id, name, amount_type, amount) VALUES (?, ?, ?, ?)',
            [hostId, name, amount_type, amount]
        );
        res.status(201).json(formatResponse(true, 'Deduction created successfully'));
    } catch (error) {
        res.status(500).json(formatResponse(false, 'Failed to create deduction', null, error.message));
    }
});

// --- Payroll ---
router.get('/payrolls', async (req, res) => {
    try {
        const hostId = getHostId(req);
        const [rows] = await pool.query(`
            SELECT p.*, e.name as employee_name
            FROM hms_payrolls p
            JOIN hms_employees e ON p.employee_id = e.id
            WHERE p.host_id = ?
            ORDER BY p.year DESC, p.month DESC
        `, [hostId]);
        res.json(formatResponse(true, 'Payrolls retrieved successfully', { payrolls: rows }));
    } catch (error) {
        res.status(500).json(formatResponse(false, 'Failed to retrieve payrolls', null, error.message));
    }
});

router.post('/payrolls', async (req, res) => {
    try {
        const hostId = getHostId(req);
        const { employee_id, month, year, basic_salary, total_allowance, total_deduction, net_salary, payment_date, status } = req.body;
        await pool.query(
            `INSERT INTO hms_payrolls (host_id, employee_id, month, year, basic_salary, total_allowance, total_deduction, net_salary, payment_date, status) 
             VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [hostId, employee_id, month, year, basic_salary, total_allowance, total_deduction, net_salary, payment_date, status || 'pending']
        );
        res.status(201).json(formatResponse(true, 'Payroll recorded successfully'));
    } catch (error) {
        res.status(500).json(formatResponse(false, 'Failed to record payroll', null, error.message));
    }
});

router.post('/payrolls/bulk', async (req, res) => {
    const connection = await pool.getConnection();
    try {
        await connection.beginTransaction();
        const hostId = getHostId(req);
        const { month, year, payment_date, allowances, deductions } = req.body;

        // Get all active employees for this host
        const [employees] = await connection.query(
            'SELECT id, salary FROM hms_employees WHERE host_id = ? AND status = "active"',
            [hostId]
        );

        for (const emp of employees) {
            // Check if payroll already exists for this month/year/employee
            const [existing] = await connection.query(
                'SELECT id FROM hms_payrolls WHERE employee_id = ? AND month = ? AND year = ?',
                [emp.id, month, year]
            );

            if (existing.length === 0) {
                // Calculate allowances
                const totalAllowance = (allowances || []).reduce((acc, curr) => {
                    if (curr.amount_type === 'fixed') return acc + parseFloat(curr.amount || 0);
                    return acc + (parseFloat(emp.salary || 0) * parseFloat(curr.amount || 0) / 100);
                }, 0);

                // Calculate deductions
                const totalDeduction = (deductions || []).reduce((acc, curr) => {
                    if (curr.amount_type === 'fixed') return acc + parseFloat(curr.amount || 0);
                    return acc + (parseFloat(emp.salary || 0) * parseFloat(curr.amount || 0) / 100);
                }, 0);

                const netSalary = parseFloat(emp.salary || 0) + totalAllowance - totalDeduction;

                await connection.query(
                    `INSERT INTO hms_payrolls (host_id, employee_id, month, year, basic_salary, total_allowance, total_deduction, net_salary, payment_date, status) 
                     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 'pending')`,
                    [hostId, emp.id, month, year, emp.salary, totalAllowance, totalDeduction, netSalary, payment_date]
                );
            }
        }

        await connection.commit();
        res.json(formatResponse(true, 'Bulk payroll generated with allowances and deductions'));
    } catch (error) {
        await connection.rollback();
        res.status(500).json(formatResponse(false, 'Bulk generation failed', null, error.message));
    } finally {
        connection.release();
    }
});

router.patch('/payrolls/:id/status', async (req, res) => {
    try {
        const hostId = getHostId(req);
        const { status, payment_date } = req.body;
        
        const [result] = await pool.query(
            'UPDATE hms_payrolls SET status = ?, payment_date = ? WHERE id = ? AND host_id = ?',
            [status, payment_date || new Date().toISOString().split('T')[0], req.params.id, hostId]
        );

        if (result.affectedRows === 0) {
            return res.status(404).json(formatResponse(false, 'Payroll record not found or access denied'));
        }

        // Sync to HMS accounts if paid
        if (status === 'paid') {
            try {
                await syncPayrollToHMSAccounts(req.params.id);
            } catch (syncError) {
                console.error('Payroll sync error:', syncError);
            }
        }

        res.json(formatResponse(true, `Payroll marked as ${status}`));
    } catch (error) {
        res.status(500).json(formatResponse(false, 'Failed to update payroll status', null, error.message));
    }
});

// --- Roster Management ---
router.get('/rosters', async (req, res) => {
    try {
        const hostId = getHostId(req);
        const { month, year } = req.query;
        const [rows] = await pool.query(
            'SELECT * FROM hms_rosters WHERE host_id = ? AND MONTH(date) = ? AND YEAR(date) = ?',
            [hostId, month, year]
        );
        res.json(formatResponse(true, 'Rosters retrieved successfully', { rosters: rows }));
    } catch (error) {
        res.status(500).json(formatResponse(false, 'Failed to retrieve rosters', null, error.message));
    }
});

router.post('/rosters/bulk', async (req, res) => {
    const connection = await pool.getConnection();
    try {
        await connection.beginTransaction();
        const hostId = getHostId(req);
        const { assignments } = req.body; // Array of { employee_id, date, shift_id }

        for (const assign of assignments) {
            await connection.query(
                `INSERT INTO hms_rosters (host_id, employee_id, date, shift_id) 
                 VALUES (?, ?, ?, ?) 
                 ON DUPLICATE KEY UPDATE shift_id = VALUES(shift_id)`,
                [hostId, assign.employee_id, assign.date, assign.shift_id]
            );
        }

        await connection.commit();
        res.json(formatResponse(true, 'Roster updated successfully'));
    } catch (error) {
        await connection.rollback();
        res.status(500).json(formatResponse(false, 'Failed to update roster', null, error.message));
    } finally {
        connection.release();
    }
});

// --- Attendance daily view for HR managers ---

router.get('/attendance/daily', async (req, res) => {
    try {
        const hostId = getHostId(req);
        const { date } = req.query;
        const [rows] = await pool.query(`
            SELECT a.*, e.name as employee_name, e.photo, d.name as department_name, s.name as shift_name, s.start_time, s.end_time
            FROM hms_attendance a
            JOIN hms_employees e ON a.employee_id = e.id
            LEFT JOIN hms_departments d ON e.department_id = d.id
            LEFT JOIN hms_rosters r ON a.employee_id = r.employee_id AND a.date = r.date
            LEFT JOIN hms_shifts s ON r.shift_id = s.id
            WHERE a.host_id = ? AND a.date = ?
        `, [hostId, date]);
        res.json(formatResponse(true, 'Daily attendance retrieved', { attendance: rows }));
    } catch (error) {
        res.status(500).json(formatResponse(false, 'Failed to retrieve attendance', null, error.message));
    }
});

module.exports = router;
