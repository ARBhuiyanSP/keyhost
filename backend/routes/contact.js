const express = require('express');
const { pool } = require('../config/database');
const { formatResponse } = require('../utils/helpers');

const router = express.Router();

// Submit a new contact message
router.post('/', async (req, res) => {
    try {
        const { name, email, subject, message } = req.body;

        if (!name || !email || !subject || !message) {
            return res.status(400).json(
                formatResponse(false, 'All fields are required')
            );
        }

        // Insert into database
        const [result] = await pool.execute(
            'INSERT INTO contact_messages (name, email, subject, message) VALUES (?, ?, ?, ?)',
            [name, email, subject, message]
        );

        res.status(201).json(
            formatResponse(true, 'Message sent successfully', { id: result.insertId })
        );

        // Optionally, send an email here if nodemailer is configured.
        
    } catch (error) {
        console.error('Submit contact message error:', error);
        res.status(500).json(
            formatResponse(false, 'Failed to send message', null, error.message)
        );
    }
});

// Admin: Get all contact messages
router.get('/', async (req, res) => {
    try {
        const { page = 1, limit = 20, status } = req.query;
        const offset = (page - 1) * limit;

        let query = 'SELECT * FROM contact_messages';
        const queryParams = [];

        if (status) {
            query += ' WHERE status = ?';
            queryParams.push(status);
        }

        query += ' ORDER BY created_at DESC LIMIT ? OFFSET ?';
        queryParams.push(parseInt(limit), parseInt(offset));

        const [messages] = await pool.execute(query, queryParams);

        // Count total
        let countQuery = 'SELECT COUNT(*) as total FROM contact_messages';
        const countParams = [];
        if (status) {
            countQuery += ' WHERE status = ?';
            countParams.push(status);
        }
        const [countResult] = await pool.execute(countQuery, countParams);

        res.json(
            formatResponse(true, 'Contact messages retrieved successfully', {
                messages,
                pagination: {
                    total: countResult[0].total,
                    page: parseInt(page),
                    limit: parseInt(limit),
                    totalPages: Math.ceil(countResult[0].total / limit)
                }
            })
        );
    } catch (error) {
        console.error('Get contact messages error:', error);
        res.status(500).json(
            formatResponse(false, 'Failed to retrieve messages', null, error.message)
        );
    }
});

// Admin: Mark message as read/replied
router.patch('/:id/status', async (req, res) => {
    try {
        const { id } = req.params;
        const { status } = req.body;

        if (!status || !['unread', 'read', 'replied'].includes(status)) {
            return res.status(400).json(
                formatResponse(false, 'Invalid status. Must be unread, read, or replied.')
            );
        }

        const [result] = await pool.execute(
            'UPDATE contact_messages SET status = ? WHERE id = ?',
            [status, id]
        );

        if (result.affectedRows === 0) {
            return res.status(404).json(
                formatResponse(false, 'Message not found')
            );
        }

        res.json(
            formatResponse(true, 'Message status updated successfully')
        );
    } catch (error) {
        console.error('Update contact message status error:', error);
        res.status(500).json(
            formatResponse(false, 'Failed to update message status', null, error.message)
        );
    }
});

module.exports = router;
