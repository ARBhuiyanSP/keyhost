const express = require('express');
const router = express.Router();
const { pool } = require('../config/database');
const { verifyToken, requirePlatformPermission } = require('../middleware/auth');
const upload = require('../utils/multerCustom');
const { formatResponse } = require('../utils/helpers');
const { compressImage } = require('../utils/imageProcessor');
const path = require('path');
const fs = require('fs');

// Create a new ticket
router.post('/', verifyToken, requirePlatformPermission('support.create_update'), upload.single('attachment'), async (req, res) => {
  try {
    const { subject, category, priority, property_id, message } = req.body;
    const guest_id = req.user.id;

    if (!subject || !message) {
      return res.status(400).json(formatResponse(false, 'Subject and Message are required'));
    }

    // Fix: property_id can be an empty string from frontend
    const finalPropertyId = (property_id && property_id !== "" && property_id !== "null") ? parseInt(property_id) : null;

    let finalFilename = req.file ? req.file.filename : null;
    if (req.file && req.file.mimetype.startsWith('image/')) {
       finalFilename = await compressImage(req.file.path, req.file.destination, 'ticket');
    }
    const attachment_url = finalFilename ? `/uploads/support/${finalFilename}` : null;

    const [result] = await pool.execute(
      'INSERT INTO tickets (guest_id, property_id, subject, category, priority, status) VALUES (?, ?, ?, ?, ?, ?)',
      [guest_id, finalPropertyId, subject, category || 'Other', priority || 'Medium', 'Open']
    );

    const ticket_id = result.insertId;

    // Initial message
    await pool.execute(
      'INSERT INTO ticket_messages (ticket_id, sender_id, sender_role, message, attachment_url) VALUES (?, ?, ?, ?, ?)',
      [ticket_id, guest_id, 'guest', message, attachment_url]
    );

    res.status(201).json(formatResponse(true, 'Ticket created successfully', { ticket_id }));
  } catch (error) {
    console.error('Create ticket error:', error);
    res.status(500).json(formatResponse(false, 'Failed to create ticket', null, error.message));
  }
});

// Get tickets (Role-based filtering)
router.get('/', verifyToken, requirePlatformPermission('support.read'), async (req, res) => {
  try {
    const { status, role } = req.query; // role can be guest/host/admin
    const user_id = req.user.id;
    const user_type = req.user.user_type;

    let query = `
      SELECT t.*, p.title as property_title, u.first_name as guest_name 
      FROM tickets t
      LEFT JOIN properties p ON t.property_id = p.id
      LEFT JOIN users u ON t.guest_id = u.id
    `;
    let queryParams = [];

    if (user_type === 'admin') {
      if (status) {
        query += ' WHERE t.status = ?';
        queryParams.push(status);
      }
    } else if (user_type === 'property_owner') {
      query += ' WHERE (t.host_id = ? OR t.guest_id = ?)';
      queryParams.push(user_id, user_id);
      if (status) {
        query += ' AND t.status = ?';
        queryParams.push(status);
      }
    } else {
      // Guest
      query += ' WHERE t.guest_id = ?';
      queryParams.push(user_id);
      if (status) {
        query += ' AND t.status = ?';
        queryParams.push(status);
      }
    }

    query += ' ORDER BY t.created_at DESC';

    const [tickets] = await pool.execute(query, queryParams);
    res.json(formatResponse(true, 'Tickets retrieved successfully', { tickets }));
  } catch (error) {
    console.error('SERVER SUPPORT LIST ERROR:', error);
    res.status(500).json(formatResponse(false, 'Failed to retrieve tickets', null, error.message));
  }
});

// Get ticket details and messages
router.get('/:id', verifyToken, requirePlatformPermission('support.read'), async (req, res) => {
  try {
    const { id } = req.params;
    const user_id = req.user.id;
    const user_type = req.user.user_type;

    const [tickets] = await pool.execute(`
      SELECT t.*, p.title as property_title, p.owner_id as actual_owner_id
      FROM tickets t
      LEFT JOIN properties p ON t.property_id = p.id
      WHERE t.id = ?
    `, [id]);

    if (tickets.length === 0) {
      return res.status(404).json(formatResponse(false, 'Ticket not found'));
    }

    const ticket = tickets[0];

    // Security check
    const isAuthorized = 
      user_type === 'admin' || 
      ticket.guest_id === user_id || 
      ticket.host_id === user_id;

    if (!isAuthorized) {
      return res.status(403).json(formatResponse(false, 'Access denied'));
    }

    const [messages] = await pool.execute(`
      SELECT tm.*, u.first_name as sender_name, u.profile_image
      FROM ticket_messages tm
      LEFT JOIN users u ON tm.sender_id = u.id
      WHERE tm.ticket_id = ?
      ORDER BY tm.created_at ASC
    `, [id]);

    res.json(formatResponse(true, 'Ticket detail retrieved', { ticket, messages }));
  } catch (error) {
    console.error('SERVER TICKET DETAIL ERROR:', error);
    res.status(500).json(formatResponse(false, 'Failed to retrieve ticket detail', null, error.message));
  }
});

// Reply to a ticket
router.post('/:id/messages', verifyToken, upload.single('attachment'), async (req, res) => {
  try {
    const { id } = req.params;
    const { message } = req.body;
    const user_id = req.user.id;
    const user_type = req.user.user_type; // guest/host/admin

    if (!message && !req.file) {
      return res.status(400).json(formatResponse(false, 'Message or attachment is required'));
    }

    let finalFilename = req.file ? req.file.filename : null;
    if (req.file && req.file.mimetype.startsWith('image/')) {
       finalFilename = await compressImage(req.file.path, req.file.destination, 'ticket');
    }
    const attachment_url = finalFilename ? `/uploads/support/${finalFilename}` : null;

    // Verify access
    const [tickets] = await pool.execute('SELECT guest_id, host_id, status FROM tickets WHERE id = ?', [id]);
    if (tickets.length === 0) return res.status(404).json(formatResponse(false, 'Ticket not found'));
    
    const ticket = tickets[0];
    if (user_type !== 'admin' && ticket.guest_id !== user_id && ticket.host_id !== user_id) {
       return res.status(403).json(formatResponse(false, 'Access denied'));
    }

    // Determine the role for this specific message
    let sender_role = 'guest'; 
    if (user_type === 'admin') {
      sender_role = 'admin';
    } else if (user_id === ticket.host_id) {
      sender_role = 'host';
    } else if (user_id === ticket.guest_id) {
      sender_role = 'guest';
    }

    // Auto-reopen if closed/resolved
    if (ticket.status === 'Closed' || ticket.status === 'Resolved') {
      await pool.execute('UPDATE tickets SET status = "Open" WHERE id = ?', [id]);
    }

    await pool.execute(
      'INSERT INTO ticket_messages (ticket_id, sender_id, sender_role, message, attachment_url) VALUES (?, ?, ?, ?, ?)',
      [id, user_id, sender_role, message || '', attachment_url]
    );

    res.status(201).json(formatResponse(true, 'Message sent successfully'));
  } catch (error) {
    console.error('SERVER REPLY ERROR:', error);
    res.status(500).json(formatResponse(false, 'Failed to send message', null, error.message));
  }
});

// Update ticket status
router.patch('/:id/status', verifyToken, async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    const user_id = req.user.id;
    const user_type = req.user.user_type;

    if (!['Open', 'In Progress', 'Resolved', 'Closed'].includes(status)) {
      return res.status(400).json(formatResponse(false, 'Invalid status'));
    }

    const [tickets] = await pool.execute('SELECT guest_id, host_id FROM tickets WHERE id = ?', [id]);
    if (tickets.length === 0) return res.status(404).json(formatResponse(false, 'Ticket not found'));

    const ticket = tickets[0];

    // Security Authorization
    const isAuthorized = 
      user_type === 'admin' || 
      ticket.guest_id === user_id || 
      ticket.host_id === user_id;

    if (!isAuthorized) {
      return res.status(403).json(formatResponse(false, 'Access denied'));
    }

    // Role-specific constraints
    if (status === 'Closed' && ticket.guest_id !== user_id && user_type !== 'admin') {
      return res.status(403).json(formatResponse(false, 'Only the Guest or Admin can close a ticket permanently'));
    }

    await pool.execute('UPDATE tickets SET status = ? WHERE id = ?', [status, id]);

    res.json(formatResponse(true, `Ticket marked as ${status}`));
  } catch (error) {
    console.error('Update status error:', error);
    res.status(500).json(formatResponse(false, 'Failed to update status', null, error.message));
  }
});

// Assign to Host (Admin only)
router.patch('/:id/assign', verifyToken, async (req, res) => {
  try {
    const { id } = req.params;
    const { host_id } = req.body; // Can be inferred from property if not provided

    if (req.user.user_type !== 'admin') {
      return res.status(403).json(formatResponse(false, 'Only Admin can assign tickets'));
    }

    let finalHostId = host_id;

    if (!finalHostId) {
      // Try to find owner of the property
      const [ticketInfo] = await pool.execute('SELECT property_id FROM tickets WHERE id = ?', [id]);
      if (ticketInfo.length > 0 && ticketInfo[0].property_id) {
        const [propInfo] = await pool.execute(`
          SELECT po.user_id 
          FROM properties p 
          JOIN property_owners po ON p.owner_id = po.id 
          WHERE p.id = ?
        `, [ticketInfo[0].property_id]);
        if (propInfo.length > 0) {
          finalHostId = propInfo[0].user_id;
        }
      }
    }

    if (!finalHostId) {
      return res.status(400).json(formatResponse(false, 'No Host found for this property'));
    }

    await pool.execute('UPDATE tickets SET host_id = ?, status = "Open" WHERE id = ?', [finalHostId, id]);

    res.json(formatResponse(true, 'Ticket assigned to Host successfully'));
  } catch (error) {
    console.error('Assign ticket error:', error);
    res.status(500).json(formatResponse(false, 'Failed to assign ticket', null, error.message));
  }
});

module.exports = router;
