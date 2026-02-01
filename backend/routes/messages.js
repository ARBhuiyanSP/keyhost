const express = require('express');
const { pool } = require('../config/database');
const { formatResponse } = require('../utils/helpers');
const { validateId } = require('../middleware/validation');
const { verifyToken } = require('../middleware/auth');

const router = express.Router();

// Apply auth middleware to all routes
router.use(verifyToken);

/**
 * @route GET /api/messages
 * @desc Get all conversations for the authenticated user
 */
router.get('/', async (req, res) => {
    try {
        const userId = req.user.id;

        // Get conversations where user is guest or host
        // Join with other user details and property details
        // Also get latest message content and time
        const query = `
            SELECT 
                c.id, 
                c.guest_id, 
                c.host_id, 
                c.property_id, 
                c.last_message_at,
                c.created_at,
                
                -- Other user details
                CASE 
                    WHEN c.guest_id = ? THEN h.first_name 
                    ELSE g.first_name 
                END as other_user_first_name,
                CASE 
                    WHEN c.guest_id = ? THEN h.last_name 
                    ELSE g.last_name 
                END as other_user_last_name,
                CASE 
                    WHEN c.guest_id = ? THEN h.profile_image 
                    ELSE g.profile_image 
                END as other_user_image,
                
                -- Property details
                p.title as property_title,
                pi.image_url as property_image,
                
                -- Latest message preview (we could optimize this with a separate query or window function, 
                -- but for simplicity we might just fetch the last message via subquery or join)
                (SELECT content FROM messages WHERE conversation_id = c.id ORDER BY created_at DESC LIMIT 1) as last_message_content,
                (SELECT is_read FROM messages WHERE conversation_id = c.id AND sender_id != ? ORDER BY created_at DESC LIMIT 1) as last_message_is_read_by_me,
                (SELECT sender_id FROM messages WHERE conversation_id = c.id ORDER BY created_at DESC LIMIT 1) as last_message_sender_id

            FROM conversations c
            LEFT JOIN users g ON c.guest_id = g.id
            LEFT JOIN users h ON c.host_id = h.id
            LEFT JOIN properties p ON c.property_id = p.id
            LEFT JOIN property_images pi ON p.id = pi.property_id AND pi.image_type = 'main' AND pi.is_active = 1
            WHERE c.guest_id = ? OR c.host_id = ?
            ORDER BY c.last_message_at DESC
        `;

        const [conversations] = await pool.execute(query, [
            userId, userId, userId, // For CASE statements
            userId, // For is_read check
            userId, userId // For WHERE clause
        ]);

        res.json(formatResponse(true, 'Conversations retrieved', { conversations }));

    } catch (error) {
        console.error('Get conversations error:', error);
        res.status(500).json(formatResponse(false, 'Failed to retrieve conversations', null, error.message));
    }
});

/**
 * @route GET /api/messages/:id
 * @desc Get messages for a specific conversation
 */
router.get('/:id', validateId, async (req, res) => {
    try {
        const conversationId = req.params.id;
        const userId = req.user.id;

        // Verify user is part of the conversation
        // Verify user is part of the conversation and get details
        const query = `
            SELECT 
                c.*,
                p.title as property_title,
                p.address as property_address,
                p.city as property_city,
                p.base_price,
                pi.image_url as property_image,
                
                CASE 
                    WHEN c.guest_id = ? THEN h.first_name 
                    ELSE g.first_name 
                END as other_user_first_name,
                CASE 
                    WHEN c.guest_id = ? THEN h.last_name 
                    ELSE g.last_name 
                END as other_user_last_name,
                CASE 
                    WHEN c.guest_id = ? THEN h.profile_image 
                    ELSE g.profile_image 
                END as other_user_image,
                CASE 
                    WHEN c.guest_id = ? THEN h.id 
                    ELSE g.id 
                END as other_user_id

            FROM conversations c
            LEFT JOIN users g ON c.guest_id = g.id
            LEFT JOIN users h ON c.host_id = h.id
            LEFT JOIN properties p ON c.property_id = p.id
            LEFT JOIN property_images pi ON p.id = pi.property_id AND pi.image_type = 'main' AND pi.is_active = 1
            WHERE c.id = ? AND (c.guest_id = ? OR c.host_id = ?)
        `;

        const [conversation] = await pool.execute(query, [
            userId, userId, userId, userId, // For CASE statements
            conversationId, userId, userId  // For WHERE clause
        ]);

        if (conversation.length === 0) {
            return res.status(404).json(formatResponse(false, 'Conversation not found or access denied'));
        }

        // Get messages
        const [messages] = await pool.execute(`
            SELECT 
                m.id, 
                m.content, 
                m.sender_id, 
                m.created_at, 
                m.is_read,
                u.first_name as sender_name,
                u.profile_image as sender_image
            FROM messages m
            JOIN users u ON m.sender_id = u.id
            WHERE m.conversation_id = ?
            ORDER BY m.created_at ASC
        `, [conversationId]);

        // Mark unread messages as read
        await pool.execute(
            'UPDATE messages SET is_read = 1 WHERE conversation_id = ? AND sender_id != ? AND is_read = 0',
            [conversationId, userId]
        );

        res.json(formatResponse(true, 'Messages retrieved', {
            conversation: conversation[0],
            messages
        }));

    } catch (error) {
        console.error('Get messages error:', error);
        res.status(500).json(formatResponse(false, 'Failed to retrieve messages', null, error.message));
    }
});

/**
 * @route POST /api/messages/start
 * @desc Start a new conversation or get existing one
 */
router.post('/start', async (req, res) => {
    try {
        const { property_id, message } = req.body;
        const guestId = req.user.id;

        if (!property_id || !message) {
            return res.status(400).json(formatResponse(false, 'Property ID and message are required'));
        }

        // Get host ID from property
        const [properties] = await pool.execute(`
            SELECT p.owner_id, po.user_id 
            FROM properties p 
            JOIN property_owners po ON p.owner_id = po.id 
            WHERE p.id = ?
        `, [property_id]);

        if (properties.length === 0) {
            return res.status(404).json(formatResponse(false, 'Property not found'));
        }

        const hostId = properties[0].user_id;

        // Check if conversation already exists
        const [existingConv] = await pool.execute(
            'SELECT id FROM conversations WHERE guest_id = ? AND host_id = ? AND property_id = ?',
            [guestId, hostId, property_id]
        );

        let conversationId;

        if (existingConv.length > 0) {
            conversationId = existingConv[0].id;
            // Update last_message_at
            await pool.execute('UPDATE conversations SET last_message_at = NOW() WHERE id = ?', [conversationId]);
        } else {
            // Create new conversation
            const [result] = await pool.execute(
                'INSERT INTO conversations (guest_id, host_id, property_id, last_message_at) VALUES (?, ?, ?, NOW())',
                [guestId, hostId, property_id]
            );
            conversationId = result.insertId;
        }

        // Add message
        await pool.execute(
            'INSERT INTO messages (conversation_id, sender_id, content) VALUES (?, ?, ?)',
            [conversationId, guestId, message]
        );

        res.status(201).json(formatResponse(true, 'Message sent successfully', { conversationId }));

    } catch (error) {
        console.error('Start conversation error:', error);
        res.status(500).json(formatResponse(false, 'Failed to send message', null, error.message));
    }
});

/**
 * @route POST /api/messages/:id/reply
 * @desc Reply to an existing conversation
 */
router.post('/:id/reply', validateId, async (req, res) => {
    try {
        const conversationId = req.params.id;
        const { message } = req.body;
        const userId = req.user.id;

        if (!message) {
            return res.status(400).json(formatResponse(false, 'Message content is required'));
        }

        // Verify user participates in this conversation
        const [conversation] = await pool.execute(
            'SELECT id FROM conversations WHERE id = ? AND (guest_id = ? OR host_id = ?)',
            [conversationId, userId, userId]
        );

        if (conversation.length === 0) {
            return res.status(403).json(formatResponse(false, 'Access denied or conversation not found'));
        }

        // Insert message
        const [result] = await pool.execute(
            'INSERT INTO messages (conversation_id, sender_id, content) VALUES (?, ?, ?)',
            [conversationId, userId, message]
        );

        // Update conversation timestamp
        await pool.execute('UPDATE conversations SET last_message_at = NOW() WHERE id = ?', [conversationId]);

        // Return the new message object
        const newMessage = {
            id: result.insertId,
            conversation_id: conversationId,
            sender_id: userId,
            content: message,
            created_at: new Date(),
            is_read: false
        };

        res.status(201).json(formatResponse(true, 'Reply sent', { message: newMessage }));

    } catch (error) {
        console.error('Reply error:', error);
        res.status(500).json(formatResponse(false, 'Failed to send reply', null, error.message));
    }
});

module.exports = router;
// Force restart 6
// Force restart 5
// Force restart 4
