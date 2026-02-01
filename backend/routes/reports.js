const express = require('express');
const { pool } = require('../config/database');
const { formatResponse, generatePagination } = require('../utils/helpers');
const { validateId, validatePagination } = require('../middleware/validation');
const { verifyToken, requireAdmin, optionalAuth } = require('../middleware/auth');

const router = express.Router();

// Submit a report
router.post('/', optionalAuth, async (req, res) => {
    try {
        const { property_id, reason, detail } = req.body;
        const user_id = req.user ? req.user.id : null;

        if (!property_id || !reason) {
            return res.status(400).json(formatResponse(false, 'Property ID and reason are required'));
        }

        // Check if property exists
        const [property] = await pool.execute('SELECT id FROM properties WHERE id = ?', [property_id]);
        if (property.length === 0) {
            return res.status(404).json(formatResponse(false, 'Property not found'));
        }

        await pool.execute(
            'INSERT INTO property_reports (property_id, user_id, reason, detail, status, created_at) VALUES (?, ?, ?, ?, "pending", NOW())',
            [property_id, user_id, reason, detail]
        );

        res.status(201).json(formatResponse(true, 'Report submitted successfully'));
    } catch (error) {
        console.error('Submit report error:', error);
        res.status(500).json(formatResponse(false, 'Failed to submit report', null, error.message));
    }
});

// Admin: Get all reports
router.get('/', verifyToken, requireAdmin, validatePagination, async (req, res) => {
    try {
        const { page = 1, limit = 10, status } = req.query;
        const offset = (page - 1) * limit;

        let whereConditions = [];
        let queryParams = [];

        if (status) {
            whereConditions.push('r.status = ?');
            queryParams.push(status);
        }

        const whereClause = whereConditions.length > 0 ? `WHERE ${whereConditions.join(' AND ')}` : '';

        const [countResult] = await pool.execute(`
      SELECT COUNT(*) as total FROM property_reports r ${whereClause}
    `, queryParams);
        const total = countResult[0].total;

        const [reports] = await pool.query(`
      SELECT r.*, p.title as property_title, u.first_name, u.last_name, u.email
      FROM property_reports r
      JOIN properties p ON r.property_id = p.id
      LEFT JOIN users u ON r.user_id = u.id
      ${whereClause}
      ORDER BY r.created_at DESC
      LIMIT ? OFFSET ?
    `, [...queryParams, parseInt(limit), parseInt(offset)]);

        const pagination = generatePagination(parseInt(page), parseInt(limit), total);

        res.json(formatResponse(true, 'Reports retrieved successfully', { reports, pagination }));
    } catch (error) {
        console.error('Get reports error:', error);
        res.status(500).json(formatResponse(false, 'Failed to retrieve reports', null, error.message));
    }
});

// Admin: Update report status
router.patch('/:id/status', verifyToken, requireAdmin, validateId, async (req, res) => {
    try {
        const { id } = req.params;
        const { status } = req.body;
        const allowedStatuses = ['pending', 'investigating', 'resolved', 'dismissed'];

        if (!allowedStatuses.includes(status)) {
            return res.status(400).json(formatResponse(false, 'Invalid status'));
        }

        const [result] = await pool.execute(
            'UPDATE property_reports SET status = ?, updated_at = NOW() WHERE id = ?',
            [status, id]
        );

        if (result.affectedRows === 0) {
            return res.status(404).json(formatResponse(false, 'Report not found'));
        }

        res.json(formatResponse(true, 'Report status updated successfully'));
    } catch (error) {
        console.error('Update report status error:', error);
        res.status(500).json(formatResponse(false, 'Failed to update report status', null, error.message));
    }
});

module.exports = router;
