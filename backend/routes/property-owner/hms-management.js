const express = require('express');
const { pool } = require('../../config/database');
const { formatResponse, calculateRefundAmount } = require('../../utils/helpers');
const { verifyToken, requirePropertyOwner, requireHMSAccess, requireHMSPermission } = require('../../middleware/auth');
const { syncFoodOrderToHMSAccounts, syncRefundToHMSAccounts } = require('../../utils/hms-sync');
const { sendCheckoutSms, sendRefundSms } = require('../../utils/sms');

const router = express.Router();

router.use(verifyToken);
router.use(requirePropertyOwner);

const getHostId = (req) => {
    return req.user.user_type === 'staff' ? req.user.host_id : req.user.id;
};

// Security Check Middleware: Ensure host owns the property
const verifyPropertyOwnership = async (req, res, next) => {
    const propertyId = parseInt(req.params.propertyId || req.body.property_id);
    if (!propertyId || isNaN(propertyId)) {
        console.warn('[HMS-MGMT] Missing or invalid propertyId in request');
        return next();
    }

    try {
        console.log(`[HMS-MGMT] Verifying ownership for property ${propertyId}, user ${req.user.id}`);
        const [property] = await pool.query(
            'SELECT p.id FROM properties p JOIN property_owners po ON p.owner_id = po.id WHERE p.id = ? AND po.user_id = ?',
            [propertyId, req.user.id]
        );

        if (property.length === 0) {
            console.warn(`[HMS-MGMT] Ownership verification failed for property ${propertyId}, user ${req.user.id}`);
            return res.status(403).json(formatResponse(false, 'Access denied. You do not own this property.'));
        }
        console.log(`[HMS-MGMT] Ownership verified for property ${propertyId}`);
        next();
    } catch (error) {
        console.error('[HMS-MGMT] Ownership check CRASH:', error);
        res.status(500).json(formatResponse(false, 'Ownership check failed', null, error.message));
    }
};

// --- Staff Management ---

router.get('/staff/:propertyId', requireHMSAccess, requireHMSPermission('manage_hr'), verifyPropertyOwnership, async (req, res) => {
    try {
        const { propertyId } = req.params;
        console.log(`[HMS-MGMT] Retrieving staff for property ${propertyId}`);
        const [staff] = await pool.query(
            `SELECT s.*, e.permissions, e.user_id 
             FROM hms_staff s 
             LEFT JOIN hms_employees e ON s.email = e.email 
             WHERE s.property_id = ? 
             ORDER BY s.first_name ASC`,
            [propertyId]
        );
        res.json(formatResponse(true, 'Staff retrieved successfully', { staff }));
    } catch (error) {
        console.error('[HMS-MGMT] Get staff CRASH:', error);
        res.status(500).json(formatResponse(false, 'Failed to retrieve staff', null, error.message));
    }
});

router.post('/staff', requireHMSAccess, requireHMSPermission('manage_hr'), verifyPropertyOwnership, async (req, res) => {
    const connection = await pool.getConnection();
    try {
        await connection.beginTransaction();
        const { property_id, first_name, last_name, email, phone, role, salary, joining_date, status, password, permissions } = req.body;
        const hostId = getHostId(req);

        // Check if email already exists in hms_employees for this host
        if (email) {
            const [existingEmp] = await connection.query(
                'SELECT id FROM hms_employees WHERE email = ? AND host_id = ?', 
                [email, hostId]
            );
            if (existingEmp.length > 0) {
                await connection.rollback();
                return res.status(400).json(formatResponse(false, 'An employee with this email already exists'));
            }
        }

        // Check if email already exists in hms_staff for this property
        if (email) {
            const [existingStaff] = await connection.query(
                'SELECT id FROM hms_staff WHERE email = ? AND property_id = ?', 
                [email, property_id]
            );
            if (existingStaff.length > 0) {
                await connection.rollback();
                return res.status(400).json(formatResponse(false, 'A staff member with this email already exists on this property'));
            }
        }

        // 1. Check/create user login account
        let userId = null;
        if (email) {
            const [existingUsers] = await connection.query('SELECT id FROM users WHERE email = ?', [email]);
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

                const { hashPassword } = require('../../utils/helpers');
                const hashedPassword = await hashPassword(password);
                const [userResult] = await connection.query(
                    `INSERT INTO users (first_name, last_name, email, phone, password, user_type, host_id, is_active, created_at) 
                     VALUES (?, ?, ?, ?, ?, 'staff', ?, 1, NOW())`,
                    [first_name, last_name, email, phone, hashedPassword, hostId]
                );
                userId = userResult.insertId;
            }
        }

        // 2. Check/create/update hms_employees record so permissions check works
        if (email) {
            const [existingEmp] = await connection.query('SELECT id FROM hms_employees WHERE email = ?', [email]);
            if (existingEmp.length > 0) {
                await connection.query(
                    `UPDATE hms_employees SET 
                        name = ?, phone = ?, salary = ?, status = ?, role = ?, permissions = ?, user_id = ?, property_id = ? 
                     WHERE id = ?`,
                    [
                        `${first_name} ${last_name}`.trim(), 
                        phone, 
                        salary || 0, 
                        status === 'active' ? 'active' : 'inactive', 
                        role || 'staff', 
                        JSON.stringify(permissions || {}), 
                        userId, 
                        property_id || null, 
                        existingEmp[0].id
                    ]
                );
            } else {
                await connection.query(
                    `INSERT INTO hms_employees (
                        host_id, property_id, user_id, name, email, phone, salary, status, role, permissions, joining_date
                    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
                    [
                        hostId, 
                        property_id || null, 
                        userId, 
                        `${first_name} ${last_name}`.trim(), 
                        email, 
                        phone, 
                        salary || 0, 
                        status === 'active' ? 'active' : 'inactive', 
                        role || 'staff', 
                        JSON.stringify(permissions || {}), 
                        joining_date || null
                    ]
                );
            }
        }

        // 3. Insert into hms_staff
        await connection.query(
            `INSERT INTO hms_staff (property_id, first_name, last_name, email, phone, role, salary, joining_date, status) 
             VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [property_id, first_name, last_name, email, phone, role, salary, joining_date, status || 'active']
        );

        await connection.commit();
        res.status(201).json(formatResponse(true, 'Staff member added successfully'));
    } catch (error) {
        await connection.rollback();
        console.error('[HMS-MGMT] Add staff CRASH:', error);
        let errorMsg = error.message;
        if (error.code === 'ER_DUP_ENTRY') {
            if (error.message.includes("key 'phone'")) {
                errorMsg = 'Phone number is already in use by another user account';
            } else if (error.message.includes("key 'email'")) {
                errorMsg = 'Email is already in use by another user account';
            }
        }
        res.status(error.code === 'ER_DUP_ENTRY' ? 400 : 500).json(formatResponse(false, 'Failed to add staff member', null, errorMsg));
    } finally {
        connection.release();
    }
});

router.put('/staff/:id', requireHMSAccess, requireHMSPermission('manage_hr'), async (req, res) => {
    const connection = await pool.getConnection();
    try {
        await connection.beginTransaction();
        const { id } = req.params;
        const { first_name, last_name, email, phone, role, salary, joining_date, status, password, permissions } = req.body;
        const hostId = getHostId(req);

        console.log(`[HMS-MGMT] Updating staff member ${id}`);
        // Verify ownership (simplified)
        const [check] = await connection.query(
            'SELECT s.id, s.email FROM hms_staff s JOIN properties p ON s.property_id = p.id JOIN property_owners po ON p.owner_id = po.id WHERE s.id = ? AND po.user_id = ?',
            [id, req.user.id]
        );

        if (check.length === 0) {
            await connection.rollback();
            console.warn(`[HMS-MGMT] Update access denied for staff ${id}, user ${req.user.id}`);
            return res.status(403).json(formatResponse(false, 'Access denied'));
        }

        const oldEmail = check[0].email;

        // Find linked employee and user ID details
        let empId = null;
        let empUserId = null;
        if (oldEmail) {
            const [emps] = await connection.query('SELECT id, user_id FROM hms_employees WHERE email = ? AND host_id = ?', [oldEmail, hostId]);
            if (emps.length > 0) {
                empId = emps[0].id;
                empUserId = emps[0].user_id;
            }
        }

        // Check if email is already in use by another employee of this host
        if (email) {
            const [existingEmp] = await connection.query(
                'SELECT id FROM hms_employees WHERE email = ? AND host_id = ? AND id != ?', 
                [email, hostId, empId || 0]
            );
            if (existingEmp.length > 0) {
                await connection.rollback();
                return res.status(400).json(formatResponse(false, 'An employee with this email already exists'));
            }
        }

        // Check if email is already in use by another user in the users table
        if (email) {
            const [dupEmail] = await connection.query(
                'SELECT id FROM users WHERE email = ? AND id != ?', 
                [email, empUserId || 0]
            );
            if (dupEmail.length > 0) {
                await connection.rollback();
                return res.status(400).json(formatResponse(false, 'Email is already in use by another user account'));
            }
        }

        // Check if phone number is already in use by another user in the users table
        if (phone) {
            const [dupPhone] = await connection.query(
                'SELECT id FROM users WHERE phone = ? AND id != ?', 
                [phone, empUserId || 0]
            );
            if (dupPhone.length > 0) {
                await connection.rollback();
                return res.status(400).json(formatResponse(false, 'Phone number is already in use by another user account'));
            }
        }

        // 1. Check if user login account exists for new email or create/update it
        let userId = null;
        if (email) {
            const [existingUsers] = await connection.query('SELECT id FROM users WHERE email = ?', [email]);
            if (existingUsers.length > 0) {
                userId = existingUsers[0].id;
                
                // If password is provided, update it
                if (password) {
                    const { hashPassword } = require('../../utils/helpers');
                    const hashedPassword = await hashPassword(password);
                    await connection.query('UPDATE users SET password = ? WHERE id = ?', [hashedPassword, userId]);
                }
            } else if (password) {
                const { hashPassword } = require('../../utils/helpers');
                const hashedPassword = await hashPassword(password);
                const [userResult] = await connection.query(
                    `INSERT INTO users (first_name, last_name, email, phone, password, user_type, host_id, is_active, created_at) 
                     VALUES (?, ?, ?, ?, ?, 'staff', ?, 1, NOW())`,
                    [first_name, last_name, email, phone, hashedPassword, hostId]
                );
                userId = userResult.insertId;
            }
        }

        // 2. Check/create/update hms_employees record
        if (email) {
            const [existingEmp] = await connection.query('SELECT id FROM hms_employees WHERE email = ? OR email = ?', [email, oldEmail]);
            if (existingEmp.length > 0) {
                await connection.query(
                    `UPDATE hms_employees SET 
                        name = ?, email = ?, phone = ?, salary = ?, status = ?, role = ?, permissions = ?, user_id = ? 
                     WHERE id = ?`,
                    [
                        `${first_name} ${last_name}`.trim(), 
                        email, 
                        phone, 
                        salary || 0, 
                        status === 'active' ? 'active' : 'inactive', 
                        role || 'staff', 
                        JSON.stringify(permissions || {}), 
                        userId, 
                        existingEmp[0].id
                    ]
                );
            } else {
                await connection.query(
                    `INSERT INTO hms_employees (
                        host_id, user_id, name, email, phone, salary, status, role, permissions, joining_date
                    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
                    [
                        hostId, 
                        userId, 
                        `${first_name} ${last_name}`.trim(), 
                        email, 
                        phone, 
                        salary || 0, 
                        status === 'active' ? 'active' : 'inactive', 
                        role || 'staff', 
                        JSON.stringify(permissions || {}), 
                        joining_date || null
                    ]
                );
            }
        }

        // 3. Update hms_staff
        await connection.query(
            `UPDATE hms_staff SET first_name = ?, last_name = ?, email = ?, phone = ?, role = ?, salary = ?, joining_date = ?, status = ? 
             WHERE id = ?`,
            [first_name, last_name, email, phone, role, salary, joining_date, status, id]
        );

        await connection.commit();
        res.json(formatResponse(true, 'Staff member updated successfully'));
    } catch (error) {
        await connection.rollback();
        console.error('[HMS-MGMT] Update staff CRASH:', error);
        let errorMsg = error.message;
        if (error.code === 'ER_DUP_ENTRY') {
            if (error.message.includes("key 'phone'")) {
                errorMsg = 'Phone number is already in use by another user account';
            } else if (error.message.includes("key 'email'")) {
                errorMsg = 'Email is already in use by another user account';
            }
        }
        res.status(error.code === 'ER_DUP_ENTRY' ? 400 : 500).json(formatResponse(false, 'Failed to update staff member', null, errorMsg));
    } finally {
        connection.release();
    }
});

router.delete('/staff/:id', requireHMSAccess, requireHMSPermission('manage_hr'), async (req, res) => {
    const connection = await pool.getConnection();
    try {
        await connection.beginTransaction();
        const { id } = req.params;
        
        console.log(`[HMS-MGMT] Deleting staff member ${id}`);
        const [check] = await connection.query(
            'SELECT s.id, s.email FROM hms_staff s JOIN properties p ON s.property_id = p.id JOIN property_owners po ON p.owner_id = po.id WHERE s.id = ? AND po.user_id = ?',
            [id, req.user.id]
        );

        if (check.length === 0) {
            await connection.rollback();
            console.warn(`[HMS-MGMT] Delete access denied for staff ${id}, user ${req.user.id}`);
            return res.status(403).json(formatResponse(false, 'Access denied'));
        }

        const staffEmail = check[0].email;

        // Delete from hms_employees and users if exists
        if (staffEmail) {
            const [emp] = await connection.query('SELECT user_id FROM hms_employees WHERE email = ?', [staffEmail]);
            if (emp.length > 0) {
                const userId = emp[0].user_id;
                await connection.query('DELETE FROM hms_employees WHERE email = ?', [staffEmail]);
                if (userId) {
                    await connection.query('DELETE FROM users WHERE id = ?', [userId]);
                }
            }
        }

        await connection.query('DELETE FROM hms_staff WHERE id = ?', [id]);
        
        await connection.commit();
        res.json(formatResponse(true, 'Staff member deleted successfully'));
    } catch (error) {
        await connection.rollback();
        console.error('[HMS-MGMT] Delete staff CRASH:', error);
        res.status(500).json(formatResponse(false, 'Failed to delete staff member', null, error.message));
    } finally {
        connection.release();
    }
});

// --- Expense Tracking ---

router.get('/expenses/:propertyId', requireHMSAccess, requireHMSPermission('manage_accounts'), verifyPropertyOwnership, async (req, res) => {
    try {
        const { propertyId } = req.params;
        const [expenses] = await pool.query(
            'SELECT * FROM hms_expenses WHERE property_id = ? ORDER BY expense_date DESC',
            [propertyId]
        );
        res.json(formatResponse(true, 'Expenses retrieved successfully', { expenses }));
    } catch (error) {
        console.error('[HMS-MGMT] Get expenses CRASH:', error);
        res.status(500).json(formatResponse(false, 'Failed to retrieve expenses', null, error.message));
    }
});

router.post('/expenses', requireHMSAccess, requireHMSPermission('manage_accounts'), verifyPropertyOwnership, async (req, res) => {
    try {
        const { property_id, category, title, description, amount, expense_date, payment_method } = req.body;
        
        const [eResult] = await pool.query(
            `INSERT INTO hms_expenses (property_id, category, title, description, amount, expense_date, payment_method) 
             VALUES (?, ?, ?, ?, ?, ?, ?)`,
            [property_id, category, title, description, amount, expense_date, payment_method || 'cash']
        );

        // Auto-post to accounts
        try {
            const hostId = getHostId(req);
            // Get or create expense head
            let [heads] = await pool.query('SELECT id FROM hms_accounts_heads WHERE (host_id = ? OR is_system = 1) AND name = ?', [hostId, category || 'Operational Expense']);
            let headId;
            if (heads.length > 0) {
                headId = heads[0].id;
            } else {
                const [hResult] = await pool.query('INSERT INTO hms_accounts_heads (host_id, name, type) VALUES (?, ?, ?)', [hostId, category || 'Operational Expense', 'expense']);
                headId = hResult.insertId;
            }

            await pool.query(
                `INSERT INTO hms_accounts_transactions (host_id, property_id, account_head_id, amount, type, description, reference_type, reference_id, date) 
                 VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
                [hostId, property_id, headId, amount, 'debit', title || 'HMS Expense', 'expense', eResult.insertId, expense_date]
            );
        } catch (accError) {
            console.error('[HMS-MGMT] Auto-post expense to accounts failed:', accError);
        }
        
        res.status(201).json(formatResponse(true, 'Expense recorded successfully'));
    } catch (error) {
        console.error('[HMS-MGMT] Add expense CRASH:', error);
        res.status(500).json(formatResponse(false, 'Failed to record expense', null, error.message));
    }
});

router.delete('/expenses/:id', requireHMSAccess, requireHMSPermission('manage_accounts'), async (req, res) => {
    try {
        const { id } = req.params;
        
        console.log(`[HMS-MGMT] Deleting expense ${id}`);
        const [check] = await pool.query(
            'SELECT e.id FROM hms_expenses e JOIN properties p ON e.property_id = p.id JOIN property_owners po ON p.owner_id = po.id WHERE e.id = ? AND po.user_id = ?',
            [id, req.user.id]
        );

        if (check.length === 0) {
            console.warn(`[HMS-MGMT] Delete access denied for expense ${id}, user ${req.user.id}`);
            return res.status(403).json(formatResponse(false, 'Access denied'));
        }

        await pool.query('DELETE FROM hms_expenses WHERE id = ?', [id]);
        res.json(formatResponse(true, 'Expense deleted successfully'));
    } catch (error) {
        console.error('[HMS-MGMT] Delete expense CRASH:', error);
        res.status(500).json(formatResponse(false, 'Failed to delete expense', null, error.message));
    }
});

// --- Guest Billing (Service Charges, Food, Laundry etc.) ---

router.get('/bills/:bookingId', requireHMSAccess, requireHMSPermission('manage_reservations'), async (req, res) => {
    try {
        const { bookingId } = req.params;
        
        // Security Check: Verify host owns the booking
        const [booking] = await pool.query(
            `SELECT b.id FROM bookings b 
             JOIN properties p ON b.property_id = p.id 
             JOIN property_owners po ON p.owner_id = po.id 
             WHERE b.id = ? AND po.user_id = ?`,
            [bookingId, req.user.id]
        );

        if (booking.length === 0) {
            return res.status(403).json(formatResponse(false, 'Access denied'));
        }

        const [bills] = await pool.query(
            'SELECT * FROM hms_bills WHERE booking_id = ? ORDER BY created_at DESC',
            [bookingId]
        );
        
        res.json(formatResponse(true, 'Bills retrieved successfully', { bills }));
    } catch (error) {
        console.error('[HMS-MGMT] Get bills CRASH:', error);
        res.status(500).json(formatResponse(false, 'Failed to retrieve bills', null, error.message));
    }
});

router.post('/bills', requireHMSAccess, requireHMSPermission('manage_reservations'), async (req, res) => {
    try {
        const { booking_id, service_name, amount, guest_name } = req.body;
        
        // Security check
        const [booking] = await pool.query(
            `SELECT b.id FROM bookings b 
             JOIN properties p ON b.property_id = p.id 
             JOIN property_owners po ON p.owner_id = po.id 
             WHERE b.id = ? AND po.user_id = ?`,
            [booking_id, req.user.id]
        );

        if (booking.length === 0) {
            return res.status(403).json(formatResponse(false, 'Access denied'));
        }

        await pool.query(
            `INSERT INTO hms_bills (host_id, booking_id, guest_name, service_name, amount) 
             VALUES (?, ?, ?, ?, ?)`,
            [getHostId(req), booking_id, guest_name || 'Guest', service_name, amount]
        );
        
        res.status(201).json(formatResponse(true, 'Bill item added successfully'));
    } catch (error) {
        console.error('[HMS-MGMT] Add bill CRASH:', error);
        res.status(500).json(formatResponse(false, 'Failed to add bill item', null, error.message));
    }
});

router.delete('/bills/:id', requireHMSAccess, requireHMSPermission('manage_reservations'), async (req, res) => {
    try {
        const { id } = req.params;
        const hostId = getHostId(req);
        const [check] = await pool.query(
            'SELECT id FROM hms_bills WHERE id = ? AND host_id = ?',
            [id, hostId]
        );

        if (check.length === 0) {
            return res.status(403).json(formatResponse(false, 'Access denied'));
        }

        await pool.query('DELETE FROM hms_bills WHERE id = ?', [id]);
        res.json(formatResponse(true, 'Bill item deleted successfully'));
    } catch (error) {
        console.error('[HMS-MGMT] Delete bill CRASH:', error);
        res.status(500).json(formatResponse(false, 'Failed to delete bill item', null, error.message));
    }
});

// --- Housekeeping Management ---

router.get('/housekeeping/:propertyId', requireHMSAccess, requireHMSPermission('manage_housekeeping'), verifyPropertyOwnership, async (req, res) => {
    try {
        const { propertyId } = req.params;
        const [tasks] = await pool.query(
            `SELECT h.*, r.room_number, 
                    TRIM(COALESCE(CONCAT(s.first_name, ' ', s.last_name), e.name)) as staff_first_name, 
                    '' as staff_last_name 
             FROM hms_housekeeping h
             JOIN hms_rooms r ON h.room_id = r.id
             LEFT JOIN hms_staff s ON h.staff_id = s.id
             LEFT JOIN hms_employees e ON h.staff_id = e.id
             WHERE h.property_id = ? 
             ORDER BY h.priority DESC, h.created_at DESC`,
            [propertyId]
        );
        res.json(formatResponse(true, 'Housekeeping tasks retrieved', { tasks }));
    } catch (error) {
        console.error('[HMS-MGMT] Get housekeeping CRASH:', error);
        res.status(500).json(formatResponse(false, 'Failed to retrieve housekeeping tasks'));
    }
});

router.post('/housekeeping', requireHMSAccess, requireHMSPermission('manage_housekeeping'), verifyPropertyOwnership, async (req, res) => {
    try {
        const { property_id, room_id, staff_id, priority, notes } = req.body;
        
        await pool.query(
            `INSERT INTO hms_housekeeping (property_id, room_id, staff_id, priority, notes, status) 
             VALUES (?, ?, ?, ?, ?, 'dirty')`,
            [property_id, room_id, staff_id, priority || 'medium', notes]
        );

        // Update room status to dirty if not already
        await pool.query('UPDATE hms_rooms SET status = "dirty" WHERE id = ?', [room_id]);
        
        res.status(201).json(formatResponse(true, 'Housekeeping task assigned'));
    } catch (error) {
        console.error('[HMS-MGMT] Add housekeeping CRASH:', error);
        res.status(500).json(formatResponse(false, 'Failed to assign housekeeping task'));
    }
});

router.put('/housekeeping/:id', requireHMSAccess, requireHMSPermission('manage_housekeeping'), async (req, res) => {
    try {
        const { id } = req.params;
        const { status, staff_id, priority, notes } = req.body;

        const [task] = await pool.query('SELECT * FROM hms_housekeeping WHERE id = ?', [id]);
        if (task.length === 0) return res.status(404).json(formatResponse(false, 'Task not found'));

        let completedAt = task[0].completed_at;
        if (status === 'clean' || status === 'inspected') {
            completedAt = new Date();
            // Update room status
            await pool.query('UPDATE hms_rooms SET status = "available" WHERE id = ?', [task[0].room_id]);
        } else if (status === 'cleaning') {
            await pool.query('UPDATE hms_rooms SET status = "maintenance" WHERE id = ?', [task[0].room_id]);
        }

        await pool.query(
            `UPDATE hms_housekeeping SET status = ?, staff_id = ?, priority = ?, notes = ?, completed_at = ? 
             WHERE id = ?`,
            [status, staff_id, priority, notes, completedAt, id]
        );

        res.json(formatResponse(true, 'Housekeeping task updated'));
    } catch (error) {
        console.error('[HMS-MGMT] Update housekeeping CRASH:', error);
        res.status(500).json(formatResponse(false, 'Failed to update task'));
    }
});

// --- Food & Beverage Management ---

const { processBase64Image } = require('../../utils/imageProcessor');

router.get('/food-items/:propertyId', requireHMSAccess, requireHMSPermission('manage_food_beverage'), verifyPropertyOwnership, async (req, res) => {
    try {
        const hostId = getHostId(req);
        const [items] = await pool.query(
            `SELECT fi.* 
             FROM hms_food_items fi
             JOIN properties p ON fi.property_id = p.id
             JOIN property_owners po ON p.owner_id = po.id
             WHERE po.user_id = ?
             ORDER BY fi.category ASC, fi.name ASC`,
            [hostId]
        );
        res.json(formatResponse(true, 'Food items retrieved', { items }));
    } catch (error) {
        console.error('[HMS-MGMT] Get food items CRASH:', error);
        res.status(500).json(formatResponse(false, 'Failed to retrieve food items'));
    }
});

router.post('/food-items', requireHMSAccess, requireHMSPermission('manage_food_beverage'), verifyPropertyOwnership, async (req, res) => {
    try {
        const { property_id, name, description, price, category, image_url } = req.body;
        
        let processedImageUrl = null;
        if (image_url && image_url.startsWith('data:image')) {
            processedImageUrl = await processBase64Image(image_url, 'hms-food');
        }

        await pool.query(
            `INSERT INTO hms_food_items (property_id, name, description, price, category, image_url) 
             VALUES (?, ?, ?, ?, ?, ?)`,
            [property_id, name, description, price, category, processedImageUrl]
        );
        res.status(201).json(formatResponse(true, 'Food item added'));
    } catch (error) {
        console.error('[HMS-MGMT] Add food item CRASH:', error);
        res.status(500).json(formatResponse(false, 'Failed to add food item'));
    }
});

router.put('/food-items/:id', requireHMSAccess, requireHMSPermission('manage_food_beverage'), async (req, res) => {
    try {
        const { id } = req.params;
        const { name, description, price, category, image_url, is_available } = req.body;
        
        let processedImageUrl = image_url;
        if (image_url && image_url.startsWith('data:image')) {
            processedImageUrl = await processBase64Image(image_url, 'hms-food');
        }

        await pool.query(
            `UPDATE hms_food_items SET name = ?, description = ?, price = ?, category = ?, image_url = ?, is_available = ? 
             WHERE id = ?`,
            [name, description, price, category, processedImageUrl, is_available, id]
        );
        res.json(formatResponse(true, 'Food item updated'));
    } catch (error) {
        console.error('[HMS-MGMT] Update food item CRASH:', error);
        res.status(500).json(formatResponse(false, 'Failed to update food item'));
    }
});

router.get('/food-orders/:propertyId', requireHMSAccess, requireHMSPermission('manage_food_beverage'), verifyPropertyOwnership, async (req, res) => {
    try {
        const { propertyId } = req.params;
        const [orders] = await pool.query(
            `SELECT o.*, b.booking_reference as ref_booking_id 
             FROM hms_food_orders o
             LEFT JOIN bookings b ON o.booking_id = b.id
             WHERE o.property_id = ? 
             ORDER BY o.created_at DESC`,
            [propertyId]
        );
        
        // Fetch items for each order
        for (let order of orders) {
            const [items] = await pool.query(
                `SELECT oi.*, fi.name as item_name 
                 FROM hms_food_order_items oi
                 JOIN hms_food_items fi ON oi.item_id = fi.id
                 WHERE oi.order_id = ?`,
                [order.id]
            );
            order.items = items;
        }
        
        res.json(formatResponse(true, 'Food orders retrieved', { orders }));
    } catch (error) {
        console.error('[HMS-MGMT] Get food orders CRASH:', error);
        res.status(500).json(formatResponse(false, 'Failed to retrieve food orders'));
    }
});

router.post('/food-orders', requireHMSAccess, requireHMSPermission('manage_food_beverage'), verifyPropertyOwnership, async (req, res) => {
    const connection = await pool.getConnection();
    try {
        await connection.beginTransaction();
        const { property_id, booking_id, guest_name, room_number, total_amount, status, payment_status, notes, items } = req.body;
        
        const [result] = await connection.query(
            `INSERT INTO hms_food_orders (property_id, booking_id, guest_name, room_number, total_amount, status, payment_status, notes) 
             VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
            [property_id, booking_id, guest_name, room_number, total_amount, status || 'pending', payment_status || 'unpaid', notes]
        );
        
        const orderId = result.insertId;
        
        for (let item of items) {
            await connection.query(
                `INSERT INTO hms_food_order_items (order_id, item_id, quantity, price_at_time) 
                 VALUES (?, ?, ?, ?)`,
                [orderId, item.item_id, item.quantity, item.price]
            );
        }

        // If billed to room, add to hms_bills
        if (payment_status === 'billed_to_room' && booking_id) {
            await connection.query(
                `INSERT INTO hms_bills (host_id, booking_id, guest_name, service_name, amount) 
                 VALUES (?, ?, ?, ?, ?)`,
                [getHostId(req), booking_id, guest_name || 'Guest', `Food Order #${orderId}`, total_amount]
            );
        }

        await connection.commit();

        // If paid directly, post to accounts (After commit so pool.query can see it)
        if (payment_status === 'paid') {
            try {
                await syncFoodOrderToHMSAccounts(orderId);
            } catch (accError) {
                console.error('[HMS-MGMT] Auto-post food order to accounts failed:', accError);
            }
        }
        
        res.status(201).json(formatResponse(true, 'Food order placed', { orderId }));
    } catch (error) {
        await connection.rollback();
        console.error('[HMS-MGMT] Add food order CRASH:', error);
        res.status(500).json(formatResponse(false, 'Failed to place food order'));
    } finally {
        connection.release();
    }
});

router.put('/food-orders/:id', requireHMSAccess, requireHMSPermission('manage_food_beverage'), async (req, res) => {
    const connection = await pool.getConnection();
    try {
        await connection.beginTransaction();
        const { id } = req.params;
        const { status, payment_status } = req.body;
        
        // 1. Get current order state to check for status transitions
        const [orders] = await connection.query('SELECT * FROM hms_food_orders WHERE id = ?', [id]);
        if (orders.length === 0) {
            await connection.rollback();
            return res.status(404).json(formatResponse(false, 'Order not found'));
        }
        const order = orders[0];
        const oldPaymentStatus = order.payment_status;
        const newPaymentStatus = payment_status || oldPaymentStatus;

        // 2. Update the food order
        await connection.query(
            'UPDATE hms_food_orders SET status = ?, payment_status = ? WHERE id = ?',
            [status || order.status, newPaymentStatus, id]
        );

        // 3. Sync with hms_bills (Room Folio) - Idempotent Sync
        // We ensure the bill entry exists if it should, and is removed if it should not.
        const shouldBeInBills = newPaymentStatus === 'billed_to_room' && (status || order.status) !== 'cancelled';

        if (!shouldBeInBills) {
            // Ensure it's REMOVED from room bill if it's there
            console.log(`[HMS-MGMT] Ensuring Food Order #${id} is removed from hms_bills (Sync)`);
            await connection.query(
                'DELETE FROM hms_bills WHERE booking_id = ? AND service_name = ?',
                [order.booking_id, `Food Order #${id}`]
            );
        } 
        else if (order.booking_id) {
            // Ensure it EXISTS in room bill
            const [existingBill] = await connection.query(
                'SELECT id FROM hms_bills WHERE booking_id = ? AND service_name = ?',
                [order.booking_id, `Food Order #${id}`]
            );

            if (existingBill.length === 0) {
                console.log(`[HMS-MGMT] Adding missing Food Order #${id} to hms_bills (Sync)`);
                await connection.query(
                    `INSERT INTO hms_bills (host_id, booking_id, guest_name, service_name, amount) 
                     VALUES (?, ?, ?, ?, ?)`,
                    [getHostId(req), order.booking_id, order.guest_name || 'Guest', `Food Order #${id}`, order.total_amount]
                );
            } else {
                // Optional: Update amount if it changed (though current PUT doesn't support it)
                await connection.query(
                    'UPDATE hms_bills SET amount = ?, guest_name = ? WHERE id = ?',
                    [order.total_amount, order.guest_name || 'Guest', existingBill[0].id]
                );
            }
        }

        await connection.commit();

        // 4. Sync to accounts if paid (After commit)
        if (newPaymentStatus === 'paid') {
            try {
                await syncFoodOrderToHMSAccounts(id);
            } catch (syncError) {
                console.error('[HMS-MGMT] Food order sync failed on update:', syncError);
            }
        }
        
        res.json(formatResponse(true, 'Order status updated and synced with billing'));
    } catch (error) {
        if (connection) await connection.rollback();
        console.error('[HMS-MGMT] Update food order CRASH:', error);
        res.status(500).json(formatResponse(false, 'Failed to update order'));
    } finally {
        if (connection) connection.release();
    }
});

router.put('/settle-bill/:bookingId', requireHMSAccess, requireHMSPermission('manage_reservations'), async (req, res) => {
    const connection = await pool.getConnection();
    try {
        await connection.beginTransaction();
        const { bookingId } = req.params;
        const { total_amount } = req.body;
        
        // 1. Update booking status to checked_out and paid
        // We also update the total_amount in the booking table to reflect the final folio total
        await connection.query(
            'UPDATE bookings SET status = "checked_out", payment_status = "paid", total_amount = ? WHERE id = ?',
            [total_amount, bookingId]
        );

        // 1.1 Update room status to 'dirty'
        const [bookingRows] = await connection.query('SELECT hms_room_id FROM bookings WHERE id = ?', [bookingId]);
        if (bookingRows.length > 0 && bookingRows[0].hms_room_id) {
            await connection.query('UPDATE hms_rooms SET status = "dirty" WHERE id = ?', [bookingRows[0].hms_room_id]);
        }
        
        // 2. Mark related food orders as paid if they were billed to room
        const [roomBilledOrders] = await connection.query(
            'SELECT id, total_amount FROM hms_food_orders WHERE booking_id = ? AND payment_status = "billed_to_room"',
            [bookingId]
        );

        await connection.query(
            'UPDATE hms_food_orders SET payment_status = "paid" WHERE booking_id = ? AND payment_status = "billed_to_room"',
            [bookingId]
        );

        // 3. Calculate how much is being paid now (Balance Payment)
        const [paymentSummary] = await connection.query(
            'SELECT COALESCE(SUM(cr_amount), 0) as already_paid FROM payments WHERE booking_id = ? AND status = "completed"',
            [bookingId]
        );
        const alreadyPaid = parseFloat(paymentSummary[0].already_paid || 0);
        const balanceToPay = Math.max(0, parseFloat(total_amount) - alreadyPaid);

        let balancePaymentId = null;

        // 4. Add a payment record for the balance amount (only if there's a balance)
        if (balanceToPay > 0) {
            const settlementRef = `SETTLE-${bookingId}-${Date.now()}`;
            const [pResult] = await connection.query(
                `INSERT INTO payments (booking_id, amount, cr_amount, payment_type, payment_method, status, payment_reference, notes) 
                 VALUES (?, ?, ?, 'booking', 'cash', 'completed', ?, ?)`,
                [bookingId, balanceToPay, balanceToPay, settlementRef, 'Final settlement at checkout']
            );
            balancePaymentId = pResult.insertId;
        }
        
        await connection.commit();

        try {
            await sendCheckoutSms(bookingId);
        } catch (smsErr) {
            console.error(`Failed to send checkout SMS for booking ${bookingId}:`, smsErr.message);
        }

        // 5. Sync each settled food order to accounts (After commit)
        for (const order of roomBilledOrders) {
            try {
                await syncFoodOrderToHMSAccounts(order.id);
            } catch (syncErr) {
                console.error(`[HMS-MGMT] Failed to sync settled food order ${order.id}:`, syncErr);
            }
        }

        // 6. Sync balance payment to accounts
        if (balancePaymentId && balanceToPay > 0) {
            try {
                const hostId = getHostId(req);
                const [bRows] = await pool.query('SELECT property_id FROM bookings WHERE id = ?', [bookingId]);
                const propertyId = bRows[0]?.property_id;

                // Calculate how much of this settlement belongs to room revenue vs food already synced
                const foodTotal = roomBilledOrders.reduce((sum, order) => sum + parseFloat(order.total_amount || 0), 0);
                const roomPortion = Math.max(0, balanceToPay - foodTotal);

                if (roomPortion > 0) {
                    let [heads] = await pool.query('SELECT id FROM hms_accounts_heads WHERE (host_id = ? OR is_system = 1) AND name = ?', [hostId, 'Room Revenue']);
                    let headId = heads.length > 0 ? heads[0].id : 1;

                    await pool.query(
                        `INSERT INTO hms_accounts_transactions (host_id, property_id, account_head_id, amount, type, description, reference_type, reference_id, date) 
                         VALUES (?, ?, ?, ?, ?, ?, ?, ?, NOW())`,
                        [hostId, propertyId, headId, roomPortion, 'credit', `Final Settlement (Room Portion) - Booking #${bookingId}`, 'payment', balancePaymentId]
                    );
                }
            } catch (accError) {
                console.error('[HMS-MGMT] Auto-post settlement to accounts failed:', accError);
            }
        }

        res.json(formatResponse(true, 'Bill settled and guest checked out'));
    } catch (error) {
        await connection.rollback();
        console.error('[HMS-MGMT] Settle bill CRASH:', error);
        res.status(500).json(formatResponse(false, 'Failed to settle bill'));
    } finally {
        connection.release();
    }
});

/**
 * Process a manual refund for a booking (Host-driven)
 */
router.post('/bookings/:id/refund', requireHMSAccess, requireHMSPermission('manage_reservations'), async (req, res) => {
    const connection = await pool.getConnection();
    try {
        await connection.beginTransaction();
        const { id } = req.params;
        let { refund_amount, reason, use_policy } = req.body;

        // 1. Verify booking belongs to host
        const [bookings] = await connection.query(`
            SELECT b.*, p.owner_id, p.is_non_refundable as prop_non_refundable
            FROM bookings b
            JOIN properties p ON b.property_id = p.id
            JOIN property_owners po ON p.owner_id = po.id
            WHERE b.id = ? AND po.user_id = ?
        `, [id, req.user.id]);

        if (bookings.length === 0) {
            return res.status(404).json(formatResponse(false, 'Booking not found or access denied'));
        }

        const booking = bookings[0];

        // 2. Calculate refund based on policy if requested or if refund_amount not provided
        if (use_policy || refund_amount === undefined || refund_amount === null) {
            const cancellationTime = booking.cancelled_at || new Date();
            const policyResult = calculateRefundAmount(
                parseFloat(booking.total_amount),
                booking.check_in_date,
                booking.is_non_refundable || booking.prop_non_refundable,
                cancellationTime // I should update helper to accept custom time if needed
            );
            refund_amount = policyResult.refundAmount;
            if (!reason) reason = policyResult.reason;
        }

        if (isNaN(refund_amount) || refund_amount < 0) {
            return res.status(400).json(formatResponse(false, 'Valid refund amount is required'));
        }

        // 2. Check if booking is online (website) vs manual (admin/hms)
        // Only manual bookings can be refunded directly by Host via HMS
        if (booking.booking_source === 'website') {
            return res.status(400).json(formatResponse(false, 'Online bookings must be refunded by Admin. Please request cancellation/refund via the standard process.'));
        }

        // 3. Update booking status and payment status
        const newPaymentStatus = parseFloat(refund_amount) >= parseFloat(booking.total_amount) ? 'refunded' : 'partially_refunded';
        
        await connection.query(
            'UPDATE bookings SET status = "cancelled", payment_status = ?, cancellation_reason = ?, cancelled_at = NOW() WHERE id = ?',
            [newPaymentStatus, reason || 'Manual Refund', id]
        );

        // 3. Find the payment to link this refund to
        const [payments] = await connection.query(
            'SELECT id, payment_method FROM payments WHERE booking_id = ? AND status = "completed" ORDER BY created_at DESC LIMIT 1',
            [id]
        );

        const paymentId = payments.length > 0 ? payments[0].id : null;
        const paymentMethod = payments.length > 0 ? payments[0].payment_method : null;

        // If it's a manual booking that was paid, it MUST have a payment record
        if (!paymentId) {
            return res.status(400).json(formatResponse(false, 'No completed payment found for this booking to refund.'));
        }

        // If the payment method is online, block direct manual refund by the host
        const isOnline = ['bkash', 'sslcommerz', 'nagad'].includes(paymentMethod);
        if (isOnline) {
            return res.status(400).json(formatResponse(
                false, 
                'Online payments (e.g. bKash, SSLCommerz) must be refunded by Admin to process the transaction through the gateway.'
            ));
        }

        // 3. Create refund record (marked as completed since it's manual)
        const refundReference = `HMS-REF-${id}-${Date.now()}`;
        const refundType = parseFloat(refund_amount) >= parseFloat(booking.total_amount) ? 'full' : 'partial';
        
        const [rResult] = await connection.query(`
            INSERT INTO refunds (
                booking_id, payment_id, refund_reference, original_amount, refund_amount, net_refund, 
                refund_reason, refund_type, status, requested_at, approved_at, completed_at
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'completed', NOW(), NOW(), NOW())
        `, [
            id, 
            paymentId,
            refundReference,
            booking.total_amount,
            refund_amount,
            refund_amount,
            reason || 'Manual Refund by Host',
            refundType,
        ]);


        const refundId = rResult.insertId;

        await connection.commit();

        // 4. Sync to HMS accounts (After commit so pool.query can see the record)
        try {
            await syncRefundToHMSAccounts(refundId);
        } catch (syncErr) {
            console.error('[HMS-MGMT] Manual refund sync failed:', syncErr);
        }

        try {
            await sendRefundSms(id, refund_amount, reason || 'Manual Refund by Host');
        } catch (smsErr) {
            console.error('[HMS-MGMT] Failed to send manual refund SMS:', smsErr.message);
        }

        res.json(formatResponse(true, 'Refund processed successfully', { refundId }));
    } catch (error) {
        await connection.rollback();
        console.error('[HMS-MGMT] Manual refund CRASH:', error);
        res.status(500).json(formatResponse(false, 'Failed to process refund', null, error.message));
    } finally {
        connection.release();
    }
});

// --- HMS Reports ---

// 1. Room Revenue Report
router.get('/reports/room-revenue', requireHMSAccess, requireHMSPermission('manage_reservations'), async (req, res) => {
    try {
        const { property_id, room_id, start_date, end_date } = req.query;

        if (!property_id || !start_date || !end_date) {
            return res.status(400).json(formatResponse(false, 'property_id, start_date and end_date are required'));
        }

        // Verify property ownership
        const [propertyCheck] = await pool.query(
            'SELECT p.id FROM properties p JOIN property_owners po ON p.owner_id = po.id WHERE p.id = ? AND po.user_id = ?',
            [property_id, req.user.id]
        );
        if (propertyCheck.length === 0) {
            return res.status(403).json(formatResponse(false, 'Access denied. You do not own this property.'));
        }

        let query = `
            SELECT 
                b.id,
                b.check_in_date as date,
                b.check_in_date,
                b.check_out_date,
                DATEDIFF(b.check_out_date, b.check_in_date) as stay_nights,
                b.booking_reference,
                b.guest_name,
                r.room_number,
                'ROOM CHARGE' as service_name,
                b.total_amount as charge,
                0.00 as vat_amount,
                0.00 as service_charge,
                b.total_amount as total_amount
            FROM bookings b
            JOIN properties p ON b.property_id = p.id
            LEFT JOIN hms_rooms r ON b.hms_room_id = r.id
            WHERE b.property_id = ?
              AND b.check_in_date >= ?
              AND b.check_in_date <= ?
              AND b.status != 'cancelled'
        `;
        const params = [property_id, start_date, end_date];

        if (room_id && room_id !== 'all' && room_id !== '') {
            query += ' AND b.hms_room_id = ?';
            params.push(room_id);
        }

        query += ' ORDER BY b.check_in_date ASC';

        const [rows] = await pool.query(query, params);

        res.json(formatResponse(true, 'Room revenue report retrieved', { transactions: rows }));
    } catch (error) {
        console.error('[HMS-MGMT] Room revenue report error:', error);
        res.status(500).json(formatResponse(false, 'Failed to fetch room revenue report', null, error.message));
    }
});

// 2. Room-wise Revenue Report
router.get('/reports/room-wise-revenue', requireHMSAccess, requireHMSPermission('manage_reservations'), async (req, res) => {
    try {
        const { property_id, start_date, end_date } = req.query;

        if (!property_id || !start_date || !end_date) {
            return res.status(400).json(formatResponse(false, 'property_id, start_date and end_date are required'));
        }

        // Verify property ownership
        const [propertyCheck] = await pool.query(
            'SELECT p.id FROM properties p JOIN property_owners po ON p.owner_id = po.id WHERE p.id = ? AND po.user_id = ?',
            [property_id, req.user.id]
        );
        if (propertyCheck.length === 0) {
            return res.status(403).json(formatResponse(false, 'Access denied. You do not own this property.'));
        }

        const query = `
            SELECT 
                r.id as room_id,
                r.room_number,
                r.room_type,
                COUNT(b.id) as total_bookings,
                COALESCE(SUM(b.total_amount), 0) as total_charge,
                0.00 as total_vat,
                0.00 as total_service_charge,
                COALESCE(SUM(b.total_amount), 0) as total_revenue
            FROM hms_rooms r
            LEFT JOIN bookings b ON b.hms_room_id = r.id
              AND b.check_in_date >= ?
              AND b.check_in_date <= ?
              AND b.status != 'cancelled'
            WHERE r.property_id = ?
            GROUP BY r.id, r.room_number, r.room_type
            ORDER BY r.room_number ASC
        `;

        const [rows] = await pool.query(query, [start_date, end_date, property_id]);

        res.json(formatResponse(true, 'Room-wise revenue report retrieved', { rooms: rows }));
    } catch (error) {
        console.error('[HMS-MGMT] Room-wise revenue report error:', error);
        res.status(500).json(formatResponse(false, 'Failed to fetch room-wise revenue report', null, error.message));
    }
});

module.exports = router;

