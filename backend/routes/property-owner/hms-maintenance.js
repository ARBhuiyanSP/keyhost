const express = require('express');
const { pool } = require('../../config/database');
const { formatResponse } = require('../../utils/helpers');
const { verifyToken, requireHMSAccess } = require('../../middleware/auth');

const router = express.Router();

router.use(verifyToken);
router.use(requireHMSAccess);

const getHostId = (req) => {
    return req.user.user_type === 'staff' ? req.user.host_id : req.user.id;
};

// 1. Get all maintenance tasks
router.get('/', async (req, res) => {
    try {
        const hostId = getHostId(req);
        const { property_id, room_id, status, task_type, start_date, end_date } = req.query;

        let query = `
            SELECT t.*, p.title as property_title, r.room_number 
            FROM hms_maintenance_tasks t
            JOIN properties p ON t.property_id = p.id
            LEFT JOIN hms_rooms r ON t.room_id = r.id
            WHERE t.host_id = ?
        `;
        const params = [hostId];

        if (property_id) {
            query += ' AND t.property_id = ?';
            params.push(property_id);
        }
        if (room_id) {
            query += ' AND t.room_id = ?';
            params.push(room_id);
        }
        if (status) {
            query += ' AND t.status = ?';
            params.push(status);
        }
        if (task_type) {
            query += ' AND t.task_type = ?';
            params.push(task_type);
        }
        if (start_date) {
            query += ' AND t.start_date >= ?';
            params.push(start_date);
        }
        if (end_date) {
            query += ' AND t.end_date <= ?';
            params.push(end_date);
        }

        query += ' ORDER BY t.start_date DESC, t.id DESC';

        const [rows] = await pool.query(query, params);
        res.json(formatResponse(true, 'Maintenance tasks retrieved successfully', { tasks: rows }));
    } catch (error) {
        console.error('[HMS Maintenance] Get tasks error:', error);
        res.status(500).json(formatResponse(false, 'Failed to retrieve tasks', null, error.message));
    }
});

// 2. Create a new maintenance task
router.post('/', async (req, res) => {
    try {
        const hostId = getHostId(req);
        const {
            property_id,
            room_id,
            task_type,
            description,
            cost,
            status,
            start_date,
            end_date,
            is_recurring,
            recurrence_interval,
            lock_room
        } = req.body;

        if (!property_id || !task_type || !start_date || !end_date) {
            return res.status(400).json(formatResponse(false, 'Required fields missing: property_id, task_type, start_date, end_date'));
        }

        // Verify property belongs to host
        const [propertyCheck] = await pool.query('SELECT id FROM properties WHERE id = ? AND owner_id = (SELECT id FROM property_owners WHERE user_id = ?)', [property_id, hostId]);
        if (propertyCheck.length === 0) {
            return res.status(403).json(formatResponse(false, 'Access denied for this property'));
        }

        let nextDueDate = null;
        if (is_recurring && recurrence_interval > 0) {
            const start = new Date(end_date);
            start.setDate(start.getDate() + parseInt(recurrence_interval));
            nextDueDate = start.toISOString().split('T')[0];
        }

        const creatorId = req.user.id;

        const [result] = await pool.query(`
            INSERT INTO hms_maintenance_tasks 
            (host_id, property_id, room_id, task_type, description, cost, status, start_date, end_date, is_recurring, recurrence_interval, next_due_date, created_by)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `, [
            hostId,
            property_id,
            room_id || null,
            task_type,
            description || '',
            cost || 0.00,
            status || 'scheduled',
            start_date,
            end_date,
            is_recurring ? 1 : 0,
            recurrence_interval || 0,
            nextDueDate,
            creatorId
        ]);

        const taskId = result.insertId;

        // If locking room, update hms_rooms status to maintenance
        if (room_id && lock_room && (status === 'in_progress' || status === 'scheduled')) {
            await pool.query(`
                UPDATE hms_rooms r
                JOIN properties p ON r.property_id = p.id
                JOIN property_owners po ON p.owner_id = po.id
                SET r.status = "maintenance"
                WHERE r.id = ? AND po.user_id = ?
            `, [room_id, hostId]);
        }

        // Queue notifications
        if (is_recurring && nextDueDate) {
            const notificationDate = new Date(nextDueDate);
            notificationDate.setDate(notificationDate.getDate() - 3); // 3 days alert
            const notificationDateStr = notificationDate.toISOString().split('T')[0];

            await pool.query(`
                INSERT INTO hms_maintenance_notifications (task_id, host_id, notification_date)
                VALUES (?, ?, ?)
            `, [taskId, hostId, notificationDateStr]);
        }

        // If status is completed and cost > 0, post to accounts ledger
        if (status === 'completed' && cost > 0) {
            const connection = await pool.getConnection();
            try {
                await connection.beginTransaction();

                const [heads] = await connection.query(
                    'SELECT id FROM hms_accounts_heads WHERE (host_id = ? OR is_system = 1) AND name = ?',
                    [hostId, 'Repairs & Maintenance']
                );
                let headId;
                if (heads.length === 0) {
                    const [hResult] = await connection.query(
                        'INSERT INTO hms_accounts_heads (host_id, name, type) VALUES (?, ?, ?)',
                        [hostId, 'Repairs & Maintenance', 'expense']
                    );
                    headId = hResult.insertId;
                } else {
                    headId = heads[0].id;
                }

                const voucherNo = `PAY${Date.now().toString().slice(-6)}`;
                const remarks = `Auto-generated from completed maintenance task #${taskId} (${task_type})`;
                const transactionDate = end_date || start_date || new Date().toISOString().split('T')[0];

                const [vResult] = await connection.query(
                    'INSERT INTO hms_accounts_vouchers (host_id, property_id, voucher_no, type, date, total_amount, remarks, created_by) VALUES (?, ?, ?, "payment", ?, ?, ?, ?)',
                    [hostId, property_id, voucherNo, transactionDate, cost, remarks, creatorId]
                );
                const voucherId = vResult.insertId;

                await connection.query(
                    'INSERT INTO hms_accounts_transactions (host_id, property_id, account_head_id, amount, type, description, reference_type, reference_id, date) VALUES (?, ?, ?, ?, "debit", ?, "voucher", ?, ?)',
                    [hostId, property_id, headId, cost, remarks, voucherId, transactionDate]
                );

                await connection.commit();
            } catch (err) {
                await connection.rollback();
                console.error('Failed to post voucher for completed maintenance task creation:', err);
            } finally {
                connection.release();
            }
        }

        res.status(201).json(formatResponse(true, 'Maintenance task created successfully', { id: taskId }));
    } catch (error) {
        console.error('[HMS Maintenance] Create task error:', error);
        res.status(500).json(formatResponse(false, 'Failed to create task', null, error.message));
    }
});


// --- Service Types CRUD ---

// Get all service types for the host (includes auto-seeding default types)
router.get('/types', async (req, res) => {
    try {
        const hostId = getHostId(req);
        const [rows] = await pool.query('SELECT * FROM hms_maintenance_types WHERE host_id = ? ORDER BY name ASC', [hostId]);
        
        if (rows.length === 0) {
            // Seed default types
            const defaultTypes = [
                { name: 'Pest Control', description: 'Regular pest control and bug spraying.' },
                { name: 'AC Servicing & Repair', description: 'AC cleaning, gas refilling, and repairs.' },
                { name: 'Plumbing & Pipe Fixing', description: 'Plumbing checks, leaks repairs, and pipe fixing.' },
                { name: 'Painting & Touch-up', description: 'Painting touch-ups, wall repair, and refinishing.' },
                { name: 'Electrical & Wire Check', description: 'Electrical switch, wiring, and appliance inspections.' },
                { name: 'General Quality Inspection', description: 'Routine room quality and cleanliness inspection.' }
            ];

            const insertPromises = defaultTypes.map(t => 
                pool.query('INSERT INTO hms_maintenance_types (host_id, name, description) VALUES (?, ?, ?)', [hostId, t.name, t.description])
            );
            await Promise.all(insertPromises);

            // Fetch again
            const [newRows] = await pool.query('SELECT * FROM hms_maintenance_types WHERE host_id = ? ORDER BY name ASC', [hostId]);
            return res.json(formatResponse(true, 'Default service types seeded and retrieved successfully', { types: newRows }));
        }

        res.json(formatResponse(true, 'Service types retrieved successfully', { types: rows }));
    } catch (error) {
        console.error('[HMS Maintenance] Get types error:', error);
        res.status(500).json(formatResponse(false, 'Failed to retrieve service types', null, error.message));
    }
});

// Create a new service type
router.post('/types', async (req, res) => {
    try {
        const hostId = getHostId(req);
        const { name, description } = req.body;

        if (!name || !name.trim()) {
            return res.status(400).json(formatResponse(false, 'Service type name is required'));
        }

        // Check if name already exists for this host
        const [existing] = await pool.query('SELECT id FROM hms_maintenance_types WHERE host_id = ? AND name = ?', [hostId, name.trim()]);
        if (existing.length > 0) {
            return res.status(400).json(formatResponse(false, 'A service type with this name already exists'));
        }

        const [result] = await pool.query(
            'INSERT INTO hms_maintenance_types (host_id, name, description) VALUES (?, ?, ?)',
            [hostId, name.trim(), description || '']
        );

        res.status(201).json(formatResponse(true, 'Service type created successfully', { id: result.insertId }));
    } catch (error) {
        console.error('[HMS Maintenance] Create type error:', error);
        res.status(500).json(formatResponse(false, 'Failed to create service type', null, error.message));
    }
});

// Update a service type
router.put('/types/:id', async (req, res) => {
    try {
        const hostId = getHostId(req);
        const { id } = req.params;
        const { name, description } = req.body;

        if (!name || !name.trim()) {
            return res.status(400).json(formatResponse(false, 'Service type name is required'));
        }

        // Verify ownership
        const [existing] = await pool.query('SELECT id FROM hms_maintenance_types WHERE id = ? AND host_id = ?', [id, hostId]);
        if (existing.length === 0) {
            return res.status(404).json(formatResponse(false, 'Service type not found'));
        }

        // Check duplicate name for other types
        const [duplicate] = await pool.query(
            'SELECT id FROM hms_maintenance_types WHERE host_id = ? AND name = ? AND id != ?',
            [hostId, name.trim(), id]
        );
        if (duplicate.length > 0) {
            return res.status(400).json(formatResponse(false, 'Another service type with this name already exists'));
        }

        await pool.query(
            'UPDATE hms_maintenance_types SET name = ?, description = ? WHERE id = ? AND host_id = ?',
            [name.trim(), description || '', id, hostId]
        );

        res.json(formatResponse(true, 'Service type updated successfully'));
    } catch (error) {
        console.error('[HMS Maintenance] Update type error:', error);
        res.status(500).json(formatResponse(false, 'Failed to update service type', null, error.message));
    }
});

// Delete a service type
router.delete('/types/:id', async (req, res) => {
    try {
        const hostId = getHostId(req);
        const { id } = req.params;

        const [existing] = await pool.query('SELECT id FROM hms_maintenance_types WHERE id = ? AND host_id = ?', [id, hostId]);
        if (existing.length === 0) {
            return res.status(404).json(formatResponse(false, 'Service type not found'));
        }

        await pool.query('DELETE FROM hms_maintenance_types WHERE id = ? AND host_id = ?', [id, hostId]);
        res.json(formatResponse(true, 'Service type deleted successfully'));
    } catch (error) {
        console.error('[HMS Maintenance] Delete type error:', error);
        res.status(500).json(formatResponse(false, 'Failed to delete service type', null, error.message));
    }
});

// 3. Update/Edit a maintenance task (including status updates & expense posting)
router.put('/:id', async (req, res) => {
    try {
        const hostId = getHostId(req);
        const { id } = req.params;
        const {
            property_id,
            room_id,
            task_type,
            description,
            cost,
            status,
            start_date,
            end_date,
            is_recurring,
            recurrence_interval,
            lock_room
        } = req.body;

        // Verify task exists and belongs to host
        const [task] = await pool.query('SELECT * FROM hms_maintenance_tasks WHERE id = ? AND host_id = ?', [id, hostId]);
        if (task.length === 0) {
            return res.status(404).json(formatResponse(false, 'Maintenance task not found'));
        }

        const oldStatus = task[0].status;
        const finalCost = cost !== undefined ? cost : task[0].cost;
        const finalType = task_type || task[0].task_type;
        const finalPropertyId = property_id || task[0].property_id;
        const finalRoomId = room_id !== undefined ? room_id : task[0].room_id;

        let nextDueDate = task[0].next_due_date;
        if (is_recurring && recurrence_interval > 0) {
            const start = new Date(end_date || task[0].end_date);
            start.setDate(start.getDate() + parseInt(recurrence_interval));
            nextDueDate = start.toISOString().split('T')[0];
        }

        await pool.query(`
            UPDATE hms_maintenance_tasks 
            SET property_id = ?, room_id = ?, task_type = ?, description = ?, cost = ?, status = ?, start_date = ?, end_date = ?, is_recurring = ?, recurrence_interval = ?, next_due_date = ?
            WHERE id = ? AND host_id = ?
        `, [
            finalPropertyId,
            finalRoomId || null,
            finalType,
            description !== undefined ? description : task[0].description,
            finalCost,
            status || task[0].status,
            start_date || task[0].start_date,
            end_date || task[0].end_date,
            is_recurring !== undefined ? (is_recurring ? 1 : 0) : task[0].is_recurring,
            recurrence_interval !== undefined ? recurrence_interval : task[0].recurrence_interval,
            nextDueDate,
            id,
            hostId
        ]);

        // Manage room status lock based on state
        if (finalRoomId) {
            if (status === 'completed' || status === 'cancelled') {
                await pool.query(`
                    UPDATE hms_rooms r
                    JOIN properties p ON r.property_id = p.id
                    JOIN property_owners po ON p.owner_id = po.id
                    SET r.status = "available"
                    WHERE r.id = ? AND po.user_id = ?
                `, [finalRoomId, hostId]);
            } else if (lock_room && (status === 'in_progress' || status === 'scheduled')) {
                await pool.query(`
                    UPDATE hms_rooms r
                    JOIN properties p ON r.property_id = p.id
                    JOIN property_owners po ON p.owner_id = po.id
                    SET r.status = "maintenance"
                    WHERE r.id = ? AND po.user_id = ?
                `, [finalRoomId, hostId]);
            }
        }

        // Trigger automated expense hitting if task is newly completed
        if (status === 'completed' && oldStatus !== 'completed' && finalCost > 0) {
            const connection = await pool.getConnection();
            try {
                await connection.beginTransaction();

                const [heads] = await connection.query(
                    'SELECT id FROM hms_accounts_heads WHERE (host_id = ? OR is_system = 1) AND name = ?',
                    [hostId, 'Repairs & Maintenance']
                );
                let headId;
                if (heads.length === 0) {
                    const [hResult] = await connection.query(
                        'INSERT INTO hms_accounts_heads (host_id, name, type) VALUES (?, ?, ?)',
                        [hostId, 'Repairs & Maintenance', 'expense']
                    );
                    headId = hResult.insertId;
                } else {
                    headId = heads[0].id;
                }

                const voucherNo = `PAY${Date.now().toString().slice(-6)}`;
                const remarks = `Auto-generated from completed maintenance task #${id} (${finalType})`;
                const creatorId = req.user.id;
                const transactionDate = end_date || task[0].end_date || start_date || task[0].start_date || new Date().toISOString().split('T')[0];

                const [vResult] = await connection.query(
                    'INSERT INTO hms_accounts_vouchers (host_id, property_id, voucher_no, type, date, total_amount, remarks, created_by) VALUES (?, ?, ?, "payment", ?, ?, ?, ?)',
                    [hostId, finalPropertyId, voucherNo, transactionDate, finalCost, remarks, creatorId]
                );
                const voucherId = vResult.insertId;

                await connection.query(
                    'INSERT INTO hms_accounts_transactions (host_id, property_id, account_head_id, amount, type, description, reference_type, reference_id, date) VALUES (?, ?, ?, ?, "debit", ?, "voucher", ?, ?)',
                    [hostId, finalPropertyId, headId, finalCost, remarks, voucherId, transactionDate]
                );

                await connection.commit();
            } catch (err) {
                await connection.rollback();
                console.error('Failed to post voucher for maintenance task completion:', err);
            } finally {
                connection.release();
            }
        }

        // Update notifications queue
        if (is_recurring && nextDueDate) {
            await pool.query('DELETE FROM hms_maintenance_notifications WHERE task_id = ?', [id]);
            const notificationDate = new Date(nextDueDate);
            notificationDate.setDate(notificationDate.getDate() - 3); // 3 days alert
            const notificationDateStr = notificationDate.toISOString().split('T')[0];

            await pool.query(`
                INSERT INTO hms_maintenance_notifications (task_id, host_id, notification_date)
                VALUES (?, ?, ?)
            `, [id, hostId, notificationDateStr]);
        }

        res.json(formatResponse(true, 'Maintenance task updated successfully'));
    } catch (error) {
        console.error('[HMS Maintenance] Update task error:', error);
        res.status(500).json(formatResponse(false, 'Failed to update task', null, error.message));
    }
});

// 4. Delete a maintenance task
router.delete('/:id', async (req, res) => {
    try {
        const hostId = getHostId(req);
        const { id } = req.params;

        const [task] = await pool.query('SELECT * FROM hms_maintenance_tasks WHERE id = ? AND host_id = ?', [id, hostId]);
        if (task.length === 0) {
            return res.status(404).json(formatResponse(false, 'Maintenance task not found'));
        }

        const roomId = task[0].room_id;
        const status = task[0].status;

        // Delete associated vouchers and transactions from accounts ledger
        const [vouchers] = await pool.query(
            'SELECT id FROM hms_accounts_vouchers WHERE host_id = ? AND remarks LIKE ?',
            [hostId, `Auto-generated from completed maintenance task #${id}%`]
        );

        if (vouchers.length > 0) {
            const voucherIds = vouchers.map(v => v.id);
            await pool.query(
                'DELETE FROM hms_accounts_transactions WHERE host_id = ? AND reference_type = "voucher" AND reference_id IN (?)',
                [hostId, voucherIds]
            );
            await pool.query(
                'DELETE FROM hms_accounts_vouchers WHERE host_id = ? AND id IN (?)',
                [hostId, voucherIds]
            );
        }

        await pool.query('DELETE FROM hms_maintenance_tasks WHERE id = ? AND host_id = ?', [id, hostId]);

        // If the task was active and locking the room, revert room status
        if (roomId && (status === 'in_progress' || status === 'scheduled')) {
            await pool.query(`
                UPDATE hms_rooms r
                JOIN properties p ON r.property_id = p.id
                JOIN property_owners po ON p.owner_id = po.id
                SET r.status = "available"
                WHERE r.id = ? AND po.user_id = ?
            `, [roomId, hostId]);
        }

        res.json(formatResponse(true, 'Maintenance task deleted successfully'));
    } catch (error) {
        console.error('[HMS Maintenance] Delete task error:', error);
        res.status(500).json(formatResponse(false, 'Failed to delete task', null, error.message));
    }
});

module.exports = router;
