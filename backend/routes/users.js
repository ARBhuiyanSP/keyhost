const express = require('express');
const { pool } = require('../config/database');
const {
  formatResponse,
  hashPassword,
  comparePassword
} = require('../utils/helpers');
const {
  validateId
} = require('../middleware/validation');

const router = express.Router();

// Get user profile
router.get('/profile', async (req, res) => {
  try {
    const [users] = await pool.execute(`
      SELECT 
        id, first_name, last_name, email, phone, user_type,
        email_verified_at, phone_verified_at, is_active,
        profile_image, date_of_birth, gender, address,
        city, state, country, postal_code, language,
        timezone, email_notifications, sms_notifications,
        last_login_at, created_at, updated_at
      FROM users 
      WHERE id = ?
    `, [req.user.id]);

    if (users.length === 0) {
      return res.status(404).json(
        formatResponse(false, 'User not found')
      );
    }

    const user = users[0];

    // Get additional info based on user type
    if (user.user_type === 'property_owner') {
      const [owners] = await pool.execute(`
        SELECT business_name, business_license, tax_id,
               bank_account_number, bank_name, bank_routing_number,
               commission_rate, is_verified, verification_documents
        FROM property_owners 
        WHERE user_id = ?
      `, [req.user.id]);

      if (owners.length > 0) {
        user.property_owner_info = owners[0];
      }
    }

    res.json(
      formatResponse(true, 'Profile retrieved successfully', { user })
    );

  } catch (error) {
    console.error('Get profile error:', error);
    res.status(500).json(
      formatResponse(false, 'Failed to retrieve profile', null, error.message)
    );
  }
});

// Update user profile
router.put('/profile', async (req, res) => {
  try {
    const {
      first_name,
      last_name,
      phone,
      date_of_birth,
      gender,
      address,
      city,
      state,
      country,
      postal_code,
      language,
      timezone,
      email_notifications,
      sms_notifications
    } = req.body;

    const updateFields = [];
    const updateValues = [];

    // Build update query
    const allowedFields = {
      first_name, last_name, phone, date_of_birth, gender,
      address, city, state, country, postal_code, language,
      timezone, email_notifications, sms_notifications
    };

    Object.keys(allowedFields).forEach(key => {
      if (allowedFields[key] !== undefined) {
        updateFields.push(`${key} = ?`);
        updateValues.push(allowedFields[key]);
      }
    });

    if (updateFields.length === 0) {
      return res.status(400).json(
        formatResponse(false, 'No valid fields to update')
      );
    }

    updateValues.push(req.user.id);

    await pool.execute(
      `UPDATE users SET ${updateFields.join(', ')}, updated_at = NOW() WHERE id = ?`,
      updateValues
    );

    // Get updated user
    const [users] = await pool.execute(`
      SELECT 
        id, first_name, last_name, email, phone, user_type,
        email_verified_at, phone_verified_at, is_active,
        profile_image, date_of_birth, gender, address,
        city, state, country, postal_code, language,
        timezone, email_notifications, sms_notifications,
        last_login_at, created_at, updated_at
      FROM users 
      WHERE id = ?
    `, [req.user.id]);

    res.json(
      formatResponse(true, 'Profile updated successfully', { user: users[0] })
    );

  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json(
      formatResponse(false, 'Failed to update profile', null, error.message)
    );
  }
});

// Change password
router.put('/change-password', async (req, res) => {
  try {
    const { current_password, new_password } = req.body;

    if (!current_password || !new_password) {
      return res.status(400).json(
        formatResponse(false, 'Current password and new password are required')
      );
    }

    if (new_password.length < 6) {
      return res.status(400).json(
        formatResponse(false, 'New password must be at least 6 characters long')
      );
    }

    // Get current password
    const [users] = await pool.execute(
      'SELECT password FROM users WHERE id = ?',
      [req.user.id]
    );

    if (users.length === 0) {
      return res.status(404).json(
        formatResponse(false, 'User not found')
      );
    }

    // Verify current password
    const isCurrentPasswordValid = await comparePassword(current_password, users[0].password);

    if (!isCurrentPasswordValid) {
      return res.status(400).json(
        formatResponse(false, 'Current password is incorrect')
      );
    }

    // Hash new password
    const hashedNewPassword = await hashPassword(new_password);

    // Update password
    await pool.execute(
      'UPDATE users SET password = ?, updated_at = NOW() WHERE id = ?',
      [hashedNewPassword, req.user.id]
    );

    res.json(
      formatResponse(true, 'Password changed successfully')
    );

  } catch (error) {
    console.error('Change password error:', error);
    res.status(500).json(
      formatResponse(false, 'Failed to change password', null, error.message)
    );
  }
});

// Get user's favorites
router.get('/favorites', async (req, res) => {
  try {
    const [favorites] = await pool.execute(`
      SELECT 
        f.id, f.created_at,
        p.id as property_id, p.title, p.description, p.base_price,
        p.city, p.property_type, p.max_guests, p.average_rating,
        pi.image_url as main_image
      FROM favorites f
      JOIN properties p ON f.property_id = p.id
      LEFT JOIN property_images pi ON p.id = pi.property_id AND pi.image_type = 'main' AND pi.is_active = 1
      WHERE f.user_id = ? AND p.status = 'active'
      ORDER BY f.created_at DESC
    `, [req.user.id]);

    res.json(
      formatResponse(true, 'Favorites retrieved successfully', { favorites })
    );

  } catch (error) {
    console.error('Get favorites error:', error);
    res.status(500).json(
      formatResponse(false, 'Failed to retrieve favorites', null, error.message)
    );
  }
});

// Add property to favorites
router.post('/favorites/:propertyId', validateId, async (req, res) => {
  try {
    const { propertyId } = req.params;

    // Check if property exists
    const [properties] = await pool.execute(
      'SELECT id FROM properties WHERE id = ? AND status = "active"',
      [propertyId]
    );

    if (properties.length === 0) {
      return res.status(404).json(
        formatResponse(false, 'Property not found')
      );
    }

    // Check if already in favorites
    const [existing] = await pool.execute(
      'SELECT id FROM favorites WHERE user_id = ? AND property_id = ?',
      [req.user.id, propertyId]
    );

    if (existing.length > 0) {
      return res.status(409).json(
        formatResponse(false, 'Property already in favorites')
      );
    }

    // Add to favorites
    await pool.execute(
      'INSERT INTO favorites (user_id, property_id, created_at) VALUES (?, ?, NOW())',
      [req.user.id, propertyId]
    );

    res.status(201).json(
      formatResponse(true, 'Property added to favorites')
    );

  } catch (error) {
    console.error('Add favorite error:', error);
    res.status(500).json(
      formatResponse(false, 'Failed to add to favorites', null, error.message)
    );
  }
});

// Remove property from favorites
router.delete('/favorites/:propertyId', validateId, async (req, res) => {
  try {
    const { propertyId } = req.params;

    const [result] = await pool.execute(
      'DELETE FROM favorites WHERE user_id = ? AND property_id = ?',
      [req.user.id, propertyId]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json(
        formatResponse(false, 'Property not found in favorites')
      );
    }

    res.json(
      formatResponse(true, 'Property removed from favorites')
    );

  } catch (error) {
    console.error('Remove favorite error:', error);
    res.status(500).json(
      formatResponse(false, 'Failed to remove from favorites', null, error.message)
    );
  }
});

// Get user's notifications
router.get('/notifications', async (req, res) => {
  try {
    const [notifications] = await pool.execute(`
      SELECT id, type, title, message, data, is_read, created_at
      FROM notifications
      WHERE user_id = ?
      ORDER BY created_at DESC
      LIMIT 50
    `, [req.user.id]);

    res.json(
      formatResponse(true, 'Notifications retrieved successfully', { notifications })
    );

  } catch (error) {
    console.error('Get notifications error:', error);
    res.status(500).json(
      formatResponse(false, 'Failed to retrieve notifications', null, error.message)
    );
  }
});

// Mark notification as read
router.patch('/notifications/:id/read', validateId, async (req, res) => {
  try {
    const { id } = req.params;

    const [result] = await pool.execute(
      'UPDATE notifications SET is_read = 1 WHERE id = ? AND user_id = ?',
      [id, req.user.id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json(
        formatResponse(false, 'Notification not found')
      );
    }

    res.json(
      formatResponse(true, 'Notification marked as read')
    );

  } catch (error) {
    console.error('Mark notification read error:', error);
    res.status(500).json(
      formatResponse(false, 'Failed to mark notification as read', null, error.message)
    );
  }
});

// Mark all notifications as read
router.patch('/notifications/read-all', async (req, res) => {
  try {
    await pool.execute(
      'UPDATE notifications SET is_read = 1 WHERE user_id = ? AND is_read = 0',
      [req.user.id]
    );

    res.json(
      formatResponse(true, 'All notifications marked as read')
    );

  } catch (error) {
    console.error('Mark all notifications read error:', error);
    res.status(500).json(
      formatResponse(false, 'Failed to mark all notifications as read', null, error.message)
    );
  }
});

module.exports = router;
