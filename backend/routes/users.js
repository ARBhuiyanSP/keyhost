const express = require('express');
const { pool } = require('../config/database');
const {
  formatResponse,
  hashPassword,
  comparePassword
} = require('../utils/helpers');
const {
  validateId,
  validatePropertyId
} = require('../middleware/validation');

const router = express.Router();
const { syncHmsAccessForHost } = require('../utils/hms-helper');

const { processBase64Image } = require('../utils/imageProcessor');

// Get user profile
router.get('/profile', async (req, res) => {
  try {
    const [users] = await pool.execute(`
      SELECT 
        u.id, u.first_name, u.last_name, u.email, u.phone, u.user_type,
        u.email_verified_at, u.phone_verified_at, u.is_active,
        u.profile_image, u.date_of_birth, u.gender, u.address,
        u.city, u.state, u.country, u.postal_code, u.language,
        u.timezone, u.email_notifications, u.sms_notifications,
        u.auto_accept_bookings, u.bio,
        u.nationality, u.nid_number, u.passport_number,
        u.nid_document_url, u.passport_document_url,
        u.last_login_at, u.created_at, u.updated_at,
        COALESCE(u.platform_permissions, rdp.permissions) as platform_permissions,
        rdp.display_name as role_display_name
      FROM users u
      LEFT JOIN role_default_permissions rdp ON rdp.role = u.user_type
      WHERE u.id = ?
    `, [req.user.id]);

    if (users.length === 0) {
      return res.status(404).json(
        formatResponse(false, 'User not found')
      );
    }

    const user = users[0];
    if (user.platform_permissions) {
      if (typeof user.platform_permissions === 'string') {
        try {
          user.platform_permissions = JSON.parse(user.platform_permissions);
        } catch (e) {
          user.platform_permissions = null;
        }
      }
    }

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
      
      const [hmsSub] = await pool.execute(`
        SELECT status, plan_type, trial_started_at, trial_ends_at, subscription_ends_at, package_id, is_trial_used
        FROM hms_subscriptions
        WHERE host_id = ?
      `, [req.user.id]);
      
      let finalStatus = hmsSub.length > 0 ? hmsSub[0].status : 'inactive';
      let subscription = hmsSub.length > 0 ? hmsSub[0] : null;

      // Check for expiration
      if (subscription && (finalStatus === 'active' || finalStatus === 'trialing')) {
          const now = new Date();
          const endDate = finalStatus === 'trialing' ? new Date(subscription.trial_ends_at) : new Date(subscription.subscription_ends_at);
          
          if (endDate < now) {
              finalStatus = 'expired';
              await pool.execute('UPDATE hms_subscriptions SET status = "expired" WHERE host_id = ?', [req.user.id]);
              await syncHmsAccessForHost(req.user.id, false);
          }
      }
      
      // Check if user has any property (qualifies for HMS if they have an active subscription)
      const [hotelProps] = await pool.execute(`
        SELECT COUNT(*) as count 
        FROM properties p
        JOIN property_owners po ON p.owner_id = po.id
        WHERE po.user_id = ?
      `, [req.user.id]);
      
      user.has_hotel_property = hotelProps[0].count > 0;
      user.hms_status = finalStatus;
      user.hms_subscription = subscription;
    }

    if (user.user_type === 'staff') {
      try {
        const [staffProfile] = await pool.execute('SELECT permissions FROM hms_employees WHERE user_id = ?', [user.id]);
        let permissions = staffProfile.length > 0 ? staffProfile[0].permissions : {};
        if (typeof permissions === 'string') {
          try { permissions = JSON.parse(permissions); } catch (e) { permissions = {}; }
        }
        user.permissions = permissions;

        // Fetch host's platform permissions
        if (user.host_id) {
          const [hostUser] = await pool.execute('SELECT platform_permissions FROM users WHERE id = ?', [user.host_id]);
          if (hostUser.length > 0) {
            let hostPerms = hostUser[0].platform_permissions;
            if (typeof hostPerms === 'string') {
              try { hostPerms = JSON.parse(hostPerms); } catch (e) { hostPerms = null; }
            }
            user.host_platform_permissions = hostPerms;
          }
        }
      } catch (err) {
        console.error('Failed to append permissions for staff in profile:', err);
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
      sms_notifications,
      auto_accept_bookings,
      email,
      bio,
      nationality,
      nid_number,
      passport_number,
      nid_document_url,
      passport_document_url
    } = req.body;

    if (email) {
      const [existing] = await pool.execute(
        'SELECT id FROM users WHERE email = ? AND id != ?',
        [email, req.user.id]
      );
      if (existing.length > 0) {
        return res.status(400).json(formatResponse(false, 'Email is already in use by another account'));
      }
    }

    // Process base64 document images if provided
    let processedNidDoc = nid_document_url;
    if (nid_document_url && nid_document_url.startsWith('data:')) {
      processedNidDoc = await processBase64Image(nid_document_url, `nid-${req.user.id}`, 'documents');
    }

    let processedPassportDoc = passport_document_url;
    if (passport_document_url && passport_document_url.startsWith('data:')) {
      processedPassportDoc = await processBase64Image(passport_document_url, `passport-${req.user.id}`, 'documents');
    }

    const updateFields = [];
    const updateValues = [];

    // Build update query
    const allowedFields = {
      first_name, last_name, email, phone, date_of_birth, gender,
      address, city, state, country, postal_code, language,
      timezone, email_notifications, sms_notifications, auto_accept_bookings,
      bio, nationality, nid_number, passport_number,
      nid_document_url: processedNidDoc,
      passport_document_url: processedPassportDoc
    };

    Object.keys(allowedFields).forEach(key => {
      if (allowedFields[key] !== undefined) {
        // Convert empty strings to null for nullable database columns
        let value = allowedFields[key];
        if (value === '' && ['date_of_birth', 'gender', 'nationality', 'nid_number', 'passport_number', 'nid_document_url', 'passport_document_url'].includes(key)) {
          value = null;
        }
        updateFields.push(`${key} = ?`);
        updateValues.push(value);
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
        auto_accept_bookings, bio,
        nationality, nid_number, passport_number,
        nid_document_url, passport_document_url,
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
router.post('/favorites/:propertyId', validatePropertyId, async (req, res) => {
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
router.delete('/favorites/:propertyId', validatePropertyId, async (req, res) => {
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

// Get sidebar/menu notification counts dynamically for logged-in user
router.get('/menu-notifications', async (req, res) => {
  try {
    const userId = req.user.id;
    const userType = req.user.user_type; // 'admin', 'property_owner', 'guest', 'staff'
    
    let counts = {
      unreadMessages: 0,
      pendingBookings: 0,
      supportTickets: 0,
      guestPendingBookings: 0
    };

    // 1. Unread messages (applicable to all users)
    try {
      const [msgResult] = await pool.execute(`
        SELECT COUNT(*) as count 
        FROM messages m
        JOIN conversations c ON m.conversation_id = c.id
        WHERE m.sender_id != ? AND m.is_read = 0 AND (c.guest_id = ? OR c.host_id = ?)
      `, [userId, userId, userId]);
      counts.unreadMessages = msgResult[0]?.count || 0;
    } catch (err) {
      console.error('Error fetching unreadMessages count:', err.message);
    }

    // 1b. Guest pending bookings (applicable to all users when acting as a guest)
    try {
      const [guestBookingResult] = await pool.execute(`
        SELECT COUNT(*) as count 
        FROM bookings 
        WHERE guest_id = ? AND status IN ('pending', 'request_accepted')
      `, [userId]);
      counts.guestPendingBookings = guestBookingResult[0]?.count || 0;
    } catch (err) {
      console.error('Error fetching guestPendingBookings count:', err.message);
    }

    // 2. Role-specific counts
    if (userType === 'admin') {
      // Admin pending bookings
      try {
        const [bookingResult] = await pool.execute(`
          SELECT COUNT(*) as count FROM bookings WHERE status = 'pending'
        `);
        counts.pendingBookings = bookingResult[0]?.count || 0;
      } catch (err) {
        console.error('Error fetching admin pendingBookings count:', err.message);
      }

      // Admin pending verifications
      try {
        const [verifResult] = await pool.execute(`
          SELECT COUNT(*) as count FROM property_owners WHERE is_verified = 0
        `);
        counts.pendingVerifications = verifResult[0]?.count || 0;
      } catch (err) {
        console.error('Error fetching admin pendingVerifications count:', err.message);
      }

      // Admin pending security deposits
      try {
        const [securityDepositResult] = await pool.execute(`
          SELECT COUNT(*) as count 
          FROM bookings 
          WHERE security_deposit > 0 
            AND status = 'checked_out' 
            AND security_deposit_status IN ('pending', 'claim_requested')
        `);
        counts.pendingSecurityDeposits = securityDepositResult[0]?.count || 0;
      } catch (err) {
        console.error('Error fetching admin pendingSecurityDeposits count:', err.message);
      }

      // Admin unread contact messages
      try {
        const [contactResult] = await pool.execute(`
          SELECT COUNT(*) as count FROM contact_messages WHERE status = 'unread'
        `);
        counts.unreadContacts = contactResult[0]?.count || 0;
      } catch (err) {
        console.error('Error fetching admin unreadContacts count:', err.message);
      }

      // Admin pending refunds
      try {
        const [refundResult] = await pool.execute(`
          SELECT COUNT(*) as count FROM refunds WHERE status = 'pending'
        `);
        counts.pendingRefunds = refundResult[0]?.count || 0;
      } catch (err) {
        console.error('Error fetching admin pendingRefunds count:', err.message);
      }

      // Admin active support tickets
      try {
        const [ticketResult] = await pool.execute(`
          SELECT COUNT(*) as count FROM tickets WHERE status IN ('Open', 'In Progress')
        `);
        counts.supportTickets = ticketResult[0]?.count || 0;
      } catch (err) {
        console.error('Error fetching admin supportTickets count:', err.message);
      }

    } else if (userType === 'property_owner') {
      // Host pending bookings
      try {
        const [bookingResult] = await pool.execute(`
          SELECT COUNT(*) as count 
          FROM bookings b
          JOIN properties p ON b.property_id = p.id
          JOIN property_owners po ON p.owner_id = po.id
          WHERE po.user_id = ? AND b.status = 'pending'
        `, [userId]);
        counts.pendingBookings = bookingResult[0]?.count || 0;
      } catch (err) {
        console.error('Error fetching host pendingBookings count:', err.message);
      }

      // Host active support tickets
      try {
        const [ticketResult] = await pool.execute(`
          SELECT COUNT(*) as count 
          FROM tickets 
          WHERE (host_id = ? OR guest_id = ?) AND status IN ('Open', 'In Progress')
        `, [userId, userId]);
        counts.supportTickets = ticketResult[0]?.count || 0;
      } catch (err) {
        console.error('Error fetching host supportTickets count:', err.message);
      }

    } else if (userType === 'staff') {
      const hostUserId = req.user.host_id || userId;
      
      // Staff pending bookings
      try {
        const [bookingResult] = await pool.execute(`
          SELECT COUNT(*) as count 
          FROM bookings b
          JOIN properties p ON b.property_id = p.id
          JOIN property_owners po ON p.owner_id = po.id
          WHERE po.user_id = ? AND b.status = 'pending'
        `, [hostUserId]);
        counts.pendingBookings = bookingResult[0]?.count || 0;
      } catch (err) {
        console.error('Error fetching staff pendingBookings count:', err.message);
      }

      // Staff support tickets
      try {
        const [ticketResult] = await pool.execute(`
          SELECT COUNT(*) as count 
          FROM tickets 
          WHERE (host_id = ? OR guest_id = ?) AND status IN ('Open', 'In Progress')
        `, [hostUserId, hostUserId]);
        counts.supportTickets = ticketResult[0]?.count || 0;
      } catch (err) {
        console.error('Error fetching staff supportTickets count:', err.message);
      }

    } else { // Guest
      // Guest pending payments or pending booking requests
      try {
        const [bookingResult] = await pool.execute(`
          SELECT COUNT(*) as count 
          FROM bookings 
          WHERE guest_id = ? AND status IN ('pending', 'request_accepted')
        `, [userId]);
        counts.pendingBookings = bookingResult[0]?.count || 0;
      } catch (err) {
        console.error('Error fetching guest pendingBookings count:', err.message);
      }

      // Guest active support tickets
      try {
        const [ticketResult] = await pool.execute(`
          SELECT COUNT(*) as count FROM tickets WHERE guest_id = ? AND status IN ('Open', 'In Progress')
        `, [userId]);
        counts.supportTickets = ticketResult[0]?.count || 0;
      } catch (err) {
        console.error('Error fetching guest supportTickets count:', err.message);
      }
    }

    res.json(
      formatResponse(true, 'Menu notifications retrieved successfully', counts)
    );

  } catch (error) {
    console.error('Get menu notifications error:', error);
    res.status(500).json(
      formatResponse(false, 'Failed to retrieve menu notifications', null, error.message)
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

// Become a host (switch role from guest to property_owner)
router.put('/become-host', async (req, res) => {
  try {
    if (req.user.user_type === 'admin') {
      return res.status(400).json(
        formatResponse(false, 'Admins cannot become hosts')
      );
    }

    // Update user type to property_owner
    await pool.execute(
      'UPDATE users SET user_type = "property_owner", updated_at = NOW() WHERE id = ?',
      [req.user.id]
    );

    // Also create a property_owners record for them if one doesn't exist
    await pool.execute(
      `INSERT INTO property_owners (user_id, created_at) 
       SELECT ?, NOW() 
       FROM DUAL
       WHERE NOT EXISTS (
         SELECT 1 FROM property_owners WHERE user_id = ?
       )`,
      [req.user.id, req.user.id]
    );

    // Get updated user
    const [users] = await pool.execute(`
      SELECT 
        id, first_name, last_name, email, phone, user_type,
        email_verified_at, phone_verified_at, is_active,
        profile_image, date_of_birth, gender, address,
        city, state, country, postal_code, language,
        timezone, email_notifications, sms_notifications,
        auto_accept_bookings,
        last_login_at, created_at, updated_at
      FROM users 
      WHERE id = ?
    `, [req.user.id]);

    res.json(
      formatResponse(true, 'Successfully converted to property owner. You can now start hosting.', { user: users[0] })
    );

  } catch (error) {
    console.error('Become host error:', error);
    res.status(500).json(
      formatResponse(false, 'Failed to become a host', null, error.message)
    );
  }
});

module.exports = router;
