const express = require('express');
const { pool } = require('../config/database');
const {
  hashPassword,
  comparePassword,
  generateToken,
  generateRefreshToken,
  formatResponse,
  generateRandomString
} = require('../utils/helpers');
const {
  validateUserRegistration,
  validateUserLogin
} = require('../middleware/validation');
const jwt = require('jsonwebtoken');
const { verifyToken } = require('../middleware/auth');
const { sendEmail } = require('../utils/email');

const router = express.Router();

const defaultHostPermissions = {
  can_list_properties: true,
  can_use_hms: true,
  can_use_pms: true,
  can_view_earnings: true,
  can_view_analytics: true,
  can_manage_reviews: true,
  can_use_calendar: true,
  can_manage_staff: true
};

const defaultGuestPermissions = {
  can_make_bookings: true,
  can_view_booking_history: true,
  can_request_refunds: true,
  can_leave_reviews: true,
  can_use_rewards: true,
  can_view_favorites: true,
  can_access_messages: true
};

// Register new user
router.post('/register', validateUserRegistration, async (req, res) => {
  try {
    // Log incoming request body for debugging (after validation)
    console.log('=== REGISTRATION START ===');
    console.log('Request body after validation:', JSON.stringify(req.body, null, 2));
    console.log('Request body keys:', Object.keys(req.body));
    console.log('Request body values:', Object.keys(req.body).map(key => ({
      key,
      value: key === 'password' ? '***' : req.body[key],
      type: typeof req.body[key],
      isUndefined: req.body[key] === undefined
    })));

    // Sanitize and extract all fields - handle missing fields properly
    // Required fields - throw error if missing
    const first_name = req.body.first_name ? String(req.body.first_name).trim() : null;
    const last_name = req.body.last_name ? String(req.body.last_name).trim() : null;
    const email = req.body.email ? String(req.body.email).trim().toLowerCase() : null;
    const phone = req.body.phone ? String(req.body.phone).trim() : null;
    const password = req.body.password ? String(req.body.password) : null;

    // Optional fields - safely convert to null if not present
    const user_type = req.body.user_type ? String(req.body.user_type) : 'guest';
    const date_of_birth = (req.body.date_of_birth && String(req.body.date_of_birth).trim()) || null;
    const gender = (req.body.gender && String(req.body.gender).trim()) || null;
    const address = (req.body.address && String(req.body.address).trim()) || null;
    const city = (req.body.city && String(req.body.city).trim()) || null;
    const state = (req.body.state && String(req.body.state).trim()) || null;
    const country = (req.body.country && String(req.body.country).trim()) || null;

    // Log sanitized values
    console.log('Sanitized values:', {
      first_name: first_name || 'NULL',
      last_name: last_name || 'NULL',
      email: email || 'NULL',
      phone: phone ? '***' : 'NULL',
      password: password ? '***' : 'NULL',
      user_type,
      date_of_birth: date_of_birth || 'NULL',
      gender: gender || 'NULL',
      address: address || 'NULL',
      city: city || 'NULL',
      state: state || 'NULL',
      country: country || 'NULL'
    });

    // Validate required fields - explicit check for each
    if (!first_name || first_name.length === 0) {
      return res.status(400).json(
        formatResponse(false, 'First name is required')
      );
    }
    if (!last_name || last_name.length === 0) {
      return res.status(400).json(
        formatResponse(false, 'Last name is required')
      );
    }
    if (!email || email.length === 0) {
      return res.status(400).json(
        formatResponse(false, 'Email is required')
      );
    }
    if (!phone || phone.length === 0) {
      return res.status(400).json(
        formatResponse(false, 'Phone number is required')
      );
    }
    if (!password || password.length === 0) {
      return res.status(400).json(
        formatResponse(false, 'Password is required')
      );
    }

    // Check if user already exists
    const [existingUsers] = await pool.execute(
      'SELECT id FROM users WHERE email = ? OR phone = ?',
      [email, phone]
    );

    if (existingUsers.length > 0) {
      return res.status(409).json(
        formatResponse(false, 'User with this email or phone already exists')
      );
    }

    // Hash password
    const hashedPassword = await hashPassword(password);

    // Verify hashedPassword is not undefined
    if (!hashedPassword || hashedPassword === undefined) {
      console.error('Password hashing failed');
      return res.status(500).json(
        formatResponse(false, 'Registration failed: Password hashing failed')
      );
    }

    // Create user
    // Final check: Ensure no undefined values are passed (MySQL2 requires null, not undefined)
    // Convert all values to their final form, ensuring no undefined - use explicit null conversion
    // Use helper function to safely convert undefined to null
    const safeValue = (val, defaultValue = null) => {
      if (val === undefined || val === null || val === 'undefined' || val === 'null') {
        return defaultValue;
      }
      return String(val).trim() || defaultValue;
    };

    // Ensure required fields are not null
    if (!first_name || first_name === null || first_name === 'null') {
      return res.status(400).json(formatResponse(false, 'First name cannot be null'));
    }
    if (!last_name || last_name === null || last_name === 'null') {
      return res.status(400).json(formatResponse(false, 'Last name cannot be null'));
    }
    if (!email || email === null || email === 'null') {
      return res.status(400).json(formatResponse(false, 'Email cannot be null'));
    }
    if (!phone || phone === null || phone === 'null') {
      return res.status(400).json(formatResponse(false, 'Phone cannot be null'));
    }
    if (!hashedPassword || hashedPassword === null || hashedPassword === 'null') {
      return res.status(400).json(formatResponse(false, 'Password hash cannot be null'));
    }

    const platformPerms = user_type === 'property_owner' 
      ? JSON.stringify(defaultHostPermissions) 
      : (user_type === 'guest' ? JSON.stringify(defaultGuestPermissions) : null);

    const insertParams = [
      first_name,
      last_name,
      email,
      phone,
      hashedPassword,
      user_type || 'guest',
      date_of_birth || null,
      gender || null,
      address || null,
      city || null,
      state || null,
      country || null,
      platformPerms
    ];

    // Log final insert params (without sensitive data)
    console.log('Final insert params check:', insertParams.map((p, i) => {
      const paramNames = ['first_name', 'last_name', 'email', 'phone', 'password', 'user_type',
        'date_of_birth', 'gender', 'address', 'city', 'state', 'country'];
      if (i === 4) return `${paramNames[i]}: ${p ? '***' : p}`;
      return `${paramNames[i]}: ${p} (type: ${typeof p})`;
    }));

    // Verify no undefined values before database insert
    const undefinedIndex = insertParams.findIndex(param => param === undefined || param === 'undefined');
    if (undefinedIndex !== -1) {
      const paramNames = ['first_name', 'last_name', 'email', 'phone', 'password', 'user_type',
        'date_of_birth', 'gender', 'address', 'city', 'state', 'country'];
      console.error('Registration error: Undefined value detected at index', undefinedIndex,
        'for parameter:', paramNames[undefinedIndex]);
      console.error('All insert params:', insertParams.map((p, i) => ({
        param: paramNames[i],
        value: i === 4 ? '***' : p,
        type: typeof p,
        isUndefined: p === undefined
      })));
      console.error('Original values:', {
        first_name: typeof first_name, last_name: typeof last_name,
        email: typeof email, phone: typeof phone,
        user_type: typeof user_type, date_of_birth: typeof date_of_birth,
        gender: typeof gender, address: typeof address,
        city: typeof city, state: typeof state, country: typeof country,
        hashedPassword: hashedPassword ? '***' : typeof hashedPassword
      });
      return res.status(500).json(
        formatResponse(false, 'Registration failed: Invalid data format', null,
          `Undefined value for parameter: ${paramNames[undefinedIndex]}`)
      );
    }

    // Final verification - log all params before insert
    console.log('About to insert with params:', insertParams.map((p, i) => {
      const names = ['first_name', 'last_name', 'email', 'phone', 'password', 'user_type',
        'date_of_birth', 'gender', 'address', 'city', 'state', 'country'];
      return `${names[i]}: ${i === 4 ? '***' : (p === null ? 'NULL' : String(p).substring(0, 20))} (${typeof p})`;
    }));

    // Verify again - no undefined allowed
    const finalCheck = insertParams.every((p, i) => {
      if (p === undefined) {
        console.error(`FINAL CHECK FAILED: Parameter ${i} is undefined`);
        return false;
      }
      return true;
    });

    if (!finalCheck) {
      return res.status(500).json(
        formatResponse(false, 'Registration failed: Data validation error', null, 'One or more parameters are undefined')
      );
    }

    let result;
    try {
      [result] = await pool.execute(
        `INSERT INTO users (
          first_name, last_name, email, phone, password, user_type,
          date_of_birth, gender, address, city, state, country,
          email_verified_at, created_at, platform_permissions
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW(), NOW(), ?)`,
        insertParams
      );
    } catch (dbError) {
      console.error('Database insert error:', dbError);
      console.error('Error details:', {
        message: dbError.message,
        code: dbError.code,
        sqlState: dbError.sqlState,
        insertParams: insertParams.map((p, i) => ({
          index: i,
          name: ['first_name', 'last_name', 'email', 'phone', 'password', 'user_type',
            'date_of_birth', 'gender', 'address', 'city', 'state', 'country'][i],
          value: i === 4 ? '***' : p,
          type: typeof p,
          isUndefined: p === undefined
        }))
      });
      throw dbError;
    }

    const userId = result.insertId;

    // If user is property owner, create property owner record
    if (user_type === 'property_owner') {
      await pool.execute(
        'INSERT INTO property_owners (user_id, created_at) VALUES (?, NOW())',
        [userId]
      );
    }

    // Generate tokens
    const token = generateToken(userId, user_type);
    const refreshToken = generateRefreshToken(userId);

    // Verify tokens are generated
    if (!token || !refreshToken) {
      console.error('Token generation failed:', { userId, user_type, token, refreshToken });
      return res.status(500).json(
        formatResponse(false, 'Registration failed: Token generation failed')
      );
    }

    // Store refresh token in database
    // Ensure userId, token, and refreshToken are not undefined
    const sessionParams = [
      userId ?? null,
      token ?? null,
      refreshToken ?? null
    ];

    // Verify no undefined values
    if (sessionParams.some(param => param === undefined)) {
      console.error('Registration error: Undefined values in session params:', sessionParams);
      return res.status(500).json(
        formatResponse(false, 'Registration failed: Invalid session data')
      );
    }

    await pool.execute(
      `INSERT INTO user_sessions (user_id, session_token, refresh_token, expires_at, created_at) 
       VALUES (?, ?, ?, DATE_ADD(NOW(), INTERVAL 30 DAY), NOW())`,
      sessionParams
    );

    // Get user data (without password)
    const [users] = await pool.execute(
      `SELECT id, first_name, last_name, email, phone, user_type, 
              email_verified_at, is_active, created_at, platform_permissions
       FROM users WHERE id = ?`,
      [userId]
    );

    const registeredUser = users[0];
    if (registeredUser.platform_permissions && typeof registeredUser.platform_permissions === 'string') {
      try {
        registeredUser.platform_permissions = JSON.parse(registeredUser.platform_permissions);
      } catch (e) {
        registeredUser.platform_permissions = null;
      }
    }

    res.status(201).json(
      formatResponse(true, 'User registered successfully', {
        user: registeredUser,
        token,
        refreshToken
      })
    );

  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json(
      formatResponse(false, 'Registration failed', null, error.message)
    );
  }
});

const { OAuth2Client } = require('google-auth-library');

// Google Sign-In
router.post('/google', async (req, res) => {
  try {
    const { token } = req.body;

    // Fetch Google Client ID from database settings
    const [settingsResult] = await pool.execute(
      'SELECT setting_value FROM system_settings WHERE setting_key = ?',
      ['google_client_id']
    );

    const dbClientId = settingsResult.length > 0 ? settingsResult[0].setting_value : null;
    const googleClientId = (dbClientId || process.env.GOOGLE_CLIENT_ID)?.trim();

    if (!googleClientId) {
      console.error('GOOGLE AUTH FAILED: Client ID missing');
      return res.status(500).json(
        formatResponse(false, 'Google Client ID is not configured on the server')
      );
    }

    console.log('Verifying Google token with Client ID:', googleClientId.substring(0, 10) + '...');
    const googleClient = new OAuth2Client(googleClientId);

    // Verify Google Token
    let ticket;
    try {
      ticket = await googleClient.verifyIdToken({
        idToken: token,
        audience: googleClientId,
      });
    } catch (verifyError) {
      console.error('Google token verification error:', verifyError.message);
      return res.status(401).json(
        formatResponse(false, 'Invalid Google token', null, verifyError.message)
      );
    }

    const payload = ticket.getPayload();
    const { sub: google_id, email: rawEmail, given_name, family_name, picture } = payload;
    const email = rawEmail ? String(rawEmail).toLowerCase() : null;

    // Check if user exists by google_id or email
    const [existingUsers] = await pool.execute(
      `SELECT u.*, COALESCE(u.platform_permissions, rdp.permissions) as platform_permissions
       FROM users u
       LEFT JOIN role_default_permissions rdp ON rdp.role = u.user_type
       WHERE u.google_id = ? OR u.email = ?`,
      [google_id, email]
    );

    let user;
    let userId;

    if (existingUsers.length > 0) {
      user = existingUsers[0];
      userId = user.id;

      // Update google_id and photo if they logged in with email before
      if (!user.google_id) {
        await pool.execute(
          'UPDATE users SET google_id = ?, profile_image = COALESCE(profile_image, ?), email_verified_at = COALESCE(email_verified_at, NOW()) WHERE id = ?',
          [google_id, picture, userId]
        );
      }

      // Check if locked
      if (user.locked_until && new Date() < new Date(user.locked_until)) {
        return res.status(423).json(
          formatResponse(false, 'Account is temporarily locked. Please try again later.')
        );
      }
      if (!user.is_active) {
        return res.status(403).json(
          formatResponse(false, 'Account is deactivated. Please contact support.')
        );
      }

      // Update login info
      await pool.execute(
        'UPDATE users SET login_attempts = 0, locked_until = NULL, last_login_at = NOW() WHERE id = ?',
        [userId]
      );

    } else {
      // Create new user record
      const defaultPassword = await hashPassword(generateRandomString(16)); // Random unseen password

      const dummyPhone = `G-${Date.now()}`;

      const insertParams = [
        given_name || 'Google',
        family_name || 'User',
        email,
        picture || null,
        google_id,
        defaultPassword,
        'guest', // default user type
        dummyPhone
      ];

      const [result] = await pool.execute(
        `INSERT INTO users (
          first_name, last_name, email, profile_image, google_id, password, user_type,
          email_verified_at, created_at, phone
        ) VALUES (?, ?, ?, ?, ?, ?, ?, NOW(), NOW(), ?)`,
        insertParams
      );

      userId = result.insertId;

      const [newUsers] = await pool.execute(
        `SELECT u.id, u.first_name, u.last_name, u.email, u.phone, u.user_type, u.host_id, u.profile_image, u.is_active,
                COALESCE(u.platform_permissions, rdp.permissions) as platform_permissions
         FROM users u
         LEFT JOIN role_default_permissions rdp ON rdp.role = u.user_type
         WHERE u.id = ?`,
        [userId]
      );
      user = newUsers[0];
    }

    if (user.platform_permissions) {
      if (typeof user.platform_permissions === 'string') {
        try {
          user.platform_permissions = JSON.parse(user.platform_permissions);
        } catch (e) {
          user.platform_permissions = null;
        }
      }
    }

    // Generate our system's JWTS
    const jwtToken = generateToken(userId, user.user_type);
    const refreshToken = generateRefreshToken(userId);

    // Save session
    await pool.execute(
      `INSERT INTO user_sessions (user_id, session_token, refresh_token, expires_at, created_at) 
       VALUES (?, ?, ?, DATE_ADD(NOW(), INTERVAL 30 DAY), NOW())`,
      [userId, jwtToken, refreshToken]
    );

    // Strip password from response
    delete user.password;
    delete user.login_attempts;
    delete user.locked_until;

    res.status(200).json(
      formatResponse(true, 'Google login successful', {
        user,
        token: jwtToken,
        refreshToken
      })
    );

  } catch (error) {
    console.error('Google Auth Error:', error);
    res.status(500).json(
      formatResponse(false, 'Google authentication failed', null, error.message)
    );
  }
});

// Login user
router.post('/login', validateUserLogin, async (req, res) => {
  try {
    const { email, password } = req.body;

    console.log(`Login attempt for email: ${email}`);

    // Check critical environment variables
    if (!process.env.JWT_SECRET) {
      console.error('FATAL ERROR: JWT_SECRET is not defined in environment variables!');
      return res.status(500).json(
        formatResponse(false, 'Server configuration error: JWT_SECRET missing')
      );
    }

    // Find user
    const [users] = await pool.execute(
      `SELECT u.id, u.first_name, u.last_name, u.email, u.phone, u.password, u.user_type, u.host_id,
              u.is_active, u.last_login_at, u.login_attempts, u.locked_until,
              COALESCE(u.platform_permissions, rdp.permissions) as platform_permissions
       FROM users u
       LEFT JOIN role_default_permissions rdp ON rdp.role = u.user_type
       WHERE u.email = ?`,
      [email]
    );

    if (users.length === 0) {
      console.log(`Login failed: User not found for email ${email}`);
      return res.status(401).json(
        formatResponse(false, 'Invalid email or password')
      );
    }

    const user = users[0];

    // Check if account is locked
    if (user.locked_until && new Date() < new Date(user.locked_until)) {
      return res.status(423).json(
        formatResponse(false, 'Account is temporarily locked. Please try again later.')
      );
    }

    // Check if account is active
    if (!user.is_active) {
      return res.status(403).json(
        formatResponse(false, 'Account is deactivated. Please contact support.')
      );
    }

    // Verify password
    const isPasswordValid = await comparePassword(password, user.password);

    if (!isPasswordValid) {
      console.log(`Login failed: Invalid password for user ${user.id}`);
      // Increment login attempts
      const newAttempts = user.login_attempts + 1;
      const lockUntil = newAttempts >= 5 ? new Date(Date.now() + 30 * 60 * 1000) : null; // Lock for 30 minutes

      await pool.execute(
        'UPDATE users SET login_attempts = ?, locked_until = ? WHERE id = ?',
        [newAttempts, lockUntil, user.id]
      );

      return res.status(401).json(
        formatResponse(false, 'Invalid email or password')
      );
    }

    // Reset login attempts on successful login
    await pool.execute(
      'UPDATE users SET login_attempts = 0, locked_until = NULL, last_login_at = NOW() WHERE id = ?',
      [user.id]
    );

    console.log(`User ${user.id} logged in. Generating tokens...`);

    // Generate tokens
    const token = generateToken(user.id, user.user_type);
    const refreshToken = generateRefreshToken(user.id);

    console.log('Tokens generated. Saving session...');

    // Store refresh token in database
    try {
      await pool.execute(
        `INSERT INTO user_sessions (user_id, session_token, refresh_token, expires_at, created_at) 
         VALUES (?, ?, ?, DATE_ADD(NOW(), INTERVAL 30 DAY), NOW())`,
        [user.id, token, refreshToken]
      );
    } catch (dbError) {
      console.error('Session save error:', dbError);
      // Check if table exists error
      if (dbError.code === 'ER_NO_SUCH_TABLE') {
        return res.status(500).json(
          formatResponse(false, 'Database error: user_sessions table missing', null, dbError.message)
        );
      }
      throw dbError;
    }

    // Remove password from response
    delete user.password;
    delete user.login_attempts;
    delete user.locked_until;

    if (user.platform_permissions) {
      if (typeof user.platform_permissions === 'string') {
        try {
          user.platform_permissions = JSON.parse(user.platform_permissions);
        } catch (e) {
          user.platform_permissions = null;
        }
      }
    }

    console.log('Login process completed successfully.');

    if (user.user_type === 'property_owner' || user.user_type === 'staff') {
      try {
        const hostId = user.user_type === 'staff' ? user.host_id : user.id;
        if (hostId) {
          const [hmsSub] = await pool.execute('SELECT status FROM hms_subscriptions WHERE host_id = ?', [hostId]);
          user.hms_status = hmsSub.length > 0 ? hmsSub[0].status : 'inactive';
          
          if (user.user_type === 'staff') {
            const [staffProfile] = await pool.execute('SELECT permissions FROM hms_employees WHERE user_id = ?', [user.id]);
            let permissions = staffProfile.length > 0 ? staffProfile[0].permissions : {};
            if (typeof permissions === 'string') {
              try {
                permissions = JSON.parse(permissions);
              } catch (e) {
                permissions = {};
              }
            }
            user.permissions = permissions;

            // Fetch host's platform permissions
            const [hostProfile] = await pool.execute('SELECT platform_permissions FROM users WHERE id = ?', [user.host_id]);
            let hostPlatformPerms = hostProfile.length > 0 ? hostProfile[0].platform_permissions : null;
            if (typeof hostPlatformPerms === 'string') {
              try { hostPlatformPerms = JSON.parse(hostPlatformPerms); } catch (e) { hostPlatformPerms = null; }
            }
            user.platform_permissions = hostPlatformPerms;
          }
        } else {
          user.hms_status = 'inactive';
        }
      } catch (err) {
        console.error('Failed to append HMS status at login:', err);
        user.hms_status = 'inactive';
      }
    }

    res.json(
      formatResponse(true, 'Login successful', {
        user,
        token,
        refreshToken
      })
    );

  } catch (error) {
    console.error('Login error details:', error);
    res.status(500).json(
      formatResponse(false, 'Login failed: ' + error.message, null, process.env.NODE_ENV === 'development' ? error.stack : undefined)
    );
  }
});

// Refresh token
router.post('/refresh', async (req, res) => {
  try {
    const { refreshToken } = req.body;

    if (!refreshToken) {
      return res.status(401).json(
        formatResponse(false, 'Refresh token is required')
      );
    }

    // Verify refresh token
    const decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET);

    // Check if session exists and is valid
    const [sessions] = await pool.execute(
      `SELECT us.*, u.user_type, u.is_active 
       FROM user_sessions us 
       JOIN users u ON us.user_id = u.id 
       WHERE us.refresh_token = ? AND us.is_active = 1 AND us.expires_at > NOW()`,
      [refreshToken]
    );

    if (sessions.length === 0) {
      return res.status(401).json(
        formatResponse(false, 'Invalid or expired refresh token')
      );
    }

    const session = sessions[0];

    if (!session.is_active) {
      return res.status(403).json(
        formatResponse(false, 'User account is deactivated')
      );
    }

    // Generate new tokens
    const newToken = generateToken(session.user_id, session.user_type);
    const newRefreshToken = generateRefreshToken(session.user_id);

    // Update session with new tokens
    await pool.execute(
      `UPDATE user_sessions 
       SET session_token = ?, refresh_token = ?, expires_at = DATE_ADD(NOW(), INTERVAL 30 DAY), updated_at = NOW()
       WHERE id = ?`,
      [newToken, newRefreshToken, session.id]
    );

    res.json(
      formatResponse(true, 'Token refreshed successfully', {
        token: newToken,
        refreshToken: newRefreshToken
      })
    );

  } catch (error) {
    console.error('Token refresh error:', error);
    res.status(401).json(
      formatResponse(false, 'Token refresh failed', null, error.message)
    );
  }
});

// Logout
router.post('/logout', async (req, res) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');

    if (token) {
      // Deactivate session
      await pool.execute(
        'UPDATE user_sessions SET is_active = 0, updated_at = NOW() WHERE session_token = ?',
        [token]
      );
    }

    res.json(
      formatResponse(true, 'Logout successful')
    );

  } catch (error) {
    console.error('Logout error:', error);
    res.status(500).json(
      formatResponse(false, 'Logout failed', null, error.message)
    );
  }
});

// Forgot password
router.post('/forgot-password', async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json(
        formatResponse(false, 'Email is required')
      );
    }

    // Check if user exists
    const [users] = await pool.execute(
      'SELECT id, first_name, email FROM users WHERE email = ? AND is_active = 1',
      [email]
    );

    if (users.length === 0) {
      // Don't reveal if email exists or not
      return res.json(
        formatResponse(true, 'If the email exists, a password reset link has been sent')
      );
    }

    const user = users[0];

    // Generate reset token
    const resetToken = generateRandomString(32);

    // Store reset token 
    await pool.execute(
      'INSERT INTO password_resets (email, token, created_at) VALUES (?, ?, NOW())',
      [user.email, resetToken]
    );

    // Try to get frontend URL from headers or use default localhost
    const frontendUrl = req.headers.origin || process.env.FRONTEND_URL || 'http://localhost:3000';
    const resetUrl = `${frontendUrl}/reset-password/${resetToken}`;

    const message = `Halo ${user.first_name},\n\nYou requested a password reset. Please click on the following link or paste it in your browser to reset your password:\n\n${resetUrl}\n\nThis link will expire in 1 hour. If you did not request this, please ignore this email.`;

    // Send email with reset link
    try {
      await sendEmail({
        email: user.email,
        subject: 'Password Reset Request - Keyhost Homes',
        message
      });
    } catch (emailError) {
      console.error('Failed to send reset email:', emailError);
      return res.status(500).json(
        formatResponse(false, 'There was an error sending the reset email. Try again later.')
      );
    }

    res.json(
      formatResponse(true, 'If the email exists, a password reset link has been sent')
    );

  } catch (error) {
    console.error('Forgot password error:', error);
    res.status(500).json(
      formatResponse(false, 'Password reset request failed', null, error.message)
    );
  }
});

// Reset password
router.post('/reset-password', async (req, res) => {
  try {
    const { token, password } = req.body;

    if (!token || !password) {
      return res.status(400).json(
        formatResponse(false, 'Token and new password are required')
      );
    }

    // Verify token (Valid for 1 hour)
    const [validTokens] = await pool.execute(
      `SELECT email FROM password_resets 
       WHERE token = ? AND created_at >= NOW() - INTERVAL 1 HOUR 
       ORDER BY created_at DESC LIMIT 1`,
      [token]
    );

    if (validTokens.length === 0) {
      return res.status(400).json(
        formatResponse(false, 'Password reset token is invalid or has expired')
      );
    }

    const email = validTokens[0].email;

    // Hash new password
    const hashedPassword = await hashPassword(password);

    // Update user's password
    await pool.execute(
      'UPDATE users SET password = ? WHERE email = ?',
      [hashedPassword, email]
    );

    // Clear all reset tokens for this user
    await pool.execute(
      'DELETE FROM password_resets WHERE email = ?',
      [email]
    );

    res.json(
      formatResponse(true, 'Password has been successfully updated')
    );

  } catch (error) {
    console.error('Reset password error:', error);
    res.status(500).json(
      formatResponse(false, 'Password reset failed', null, error.message)
    );
  }
});

// Send email verification link
router.post('/send-verification-email', verifyToken, async (req, res) => {
  try {
    const userId = req.user.id;
    const email = req.user.email;

    // Generate verification token (signed JWT) valid for 24h
    const token = jwt.sign(
      { userId, email },
      process.env.JWT_SECRET,
      { expiresIn: '24h' }
    );

    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
    const verifyUrl = `${frontendUrl}/verify-email?token=${token}`;

    const message = `Hello ${req.user.first_name},\n\nPlease click on the following link to verify your email address:\n\n${verifyUrl}\n\nThis link will expire in 24 hours. If you did not request this verification, please ignore this email.`;

    await sendEmail({
      email,
      subject: 'Verify Your Email Address - Keyhost Homes',
      message
    });

    res.json(formatResponse(true, 'Verification email sent successfully'));
  } catch (error) {
    console.error('Send verification email error:', error);
    res.status(500).json(formatResponse(false, 'Failed to send verification email', null, error.message));
  }
});

// Verify email
router.post('/verify-email', async (req, res) => {
  try {
    const { token } = req.body;

    if (!token) {
      return res.status(400).json(formatResponse(false, 'Token is required'));
    }

    // Verify JWT token
    let decoded;
    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET);
    } catch (err) {
      return res.status(400).json(formatResponse(false, 'Invalid or expired verification token'));
    }

    // Update email_verified_at
    await pool.execute(
      'UPDATE users SET email_verified_at = NOW() WHERE id = ?',
      [decoded.userId]
    );

    // Fetch updated user to return
    const [users] = await pool.execute(
      'SELECT id, first_name, last_name, email, phone, user_type, email_verified_at, phone_verified_at, is_active FROM users WHERE id = ?',
      [decoded.userId]
    );

    res.json(formatResponse(true, 'Email verified successfully', { user: users[0] }));
  } catch (error) {
    console.error('Email verification error:', error);
    res.status(500).json(formatResponse(false, 'Email verification failed', null, error.message));
  }
});

// Send SMS OTP verification
router.post('/send-verification-otp', verifyToken, async (req, res) => {
  try {
    const userId = req.user.id;
    const phone = req.user.phone;

    if (!phone) {
      return res.status(400).json(formatResponse(false, 'No phone number linked to this account'));
    }

    // Generate a 6-digit numeric OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    
    // Set expiration to 5 minutes from now
    const expiresAt = new Date(Date.now() + 5 * 60 * 1000);

    // Save to users table
    await pool.execute(
      'UPDATE users SET phone_verification_otp = ?, phone_verification_expires_at = ? WHERE id = ?',
      [otp, expiresAt, userId]
    );

    // Send OTP via SMS
    const { sendSMS } = require('../utils/sms');
    const message = `Your Keyhost Homes verification code is ${otp}. Valid for 5 minutes.`;

    try {
      await sendSMS({ to: phone, message });
    } catch (smsError) {
      console.error('Failed to send SMS OTP:', smsError);
    }

    res.json(formatResponse(true, 'Verification code sent via SMS successfully'));
  } catch (error) {
    console.error('Send verification OTP error:', error);
    res.status(500).json(formatResponse(false, 'Failed to send verification code', null, error.message));
  }
});

// Verify phone using OTP
router.post('/verify-phone', verifyToken, async (req, res) => {
  try {
    const userId = req.user.id;
    const { otp } = req.body;

    if (!otp) {
      return res.status(400).json(formatResponse(false, 'Verification code (OTP) is required'));
    }

    // Check if OTP matches and is not expired
    const [users] = await pool.execute(
      'SELECT phone_verification_otp, phone_verification_expires_at FROM users WHERE id = ?',
      [userId]
    );

    if (users.length === 0) {
      return res.status(404).json(formatResponse(false, 'User not found'));
    }

    const user = users[0];
    
    if (!user.phone_verification_otp || user.phone_verification_otp !== otp) {
      return res.status(400).json(formatResponse(false, 'Invalid verification code'));
    }

    const now = new Date();
    const expiresAt = new Date(user.phone_verification_expires_at);

    if (now > expiresAt) {
      return res.status(400).json(formatResponse(false, 'Verification code has expired'));
    }

    // Update phone_verified_at and clear OTP columns
    await pool.execute(
      'UPDATE users SET phone_verified_at = NOW(), phone_verification_otp = NULL, phone_verification_expires_at = NULL WHERE id = ?',
      [userId]
    );

    // Fetch updated user to return
    const [updatedUsers] = await pool.execute(
      'SELECT id, first_name, last_name, email, phone, user_type, email_verified_at, phone_verified_at, is_active FROM users WHERE id = ?',
      [userId]
    );

    res.json(formatResponse(true, 'Phone number verified successfully', { user: updatedUsers[0] }));
  } catch (error) {
    console.error('Phone verification error:', error);
    res.status(500).json(formatResponse(false, 'Phone verification failed', null, error.message));
  }
});

module.exports = router;
