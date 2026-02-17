const express = require('express');
const { pool } = require('../config/database');
const {
  hashPassword,
  comparePassword,
  generateToken,
  generateRefreshToken,
  formatResponse
} = require('../utils/helpers');
const {
  validateUserRegistration,
  validateUserLogin
} = require('../middleware/validation');

const router = express.Router();

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
      country || null
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
          email_verified_at, created_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW(), NOW())`,
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
              email_verified_at, is_active, created_at 
       FROM users WHERE id = ?`,
      [userId]
    );

    res.status(201).json(
      formatResponse(true, 'User registered successfully', {
        user: users[0],
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
      `SELECT id, first_name, last_name, email, phone, password, user_type, 
              is_active, last_login_at, login_attempts, locked_until
       FROM users WHERE email = ?`,
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

    console.log('Login process completed successfully.');

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

    // Generate reset token (in a real app, you'd send this via email)
    const resetToken = generateRandomString(32);

    // Store reset token (you'd typically store this with expiration)
    // For now, we'll just return success

    // TODO: Send email with reset link
    // await sendPasswordResetEmail(user.email, resetToken);

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

// Verify email
router.post('/verify-email', async (req, res) => {
  try {
    const { token } = req.body;

    // In a real app, you'd verify the token and update email_verified_at
    // For now, we'll just return success

    res.json(
      formatResponse(true, 'Email verified successfully')
    );

  } catch (error) {
    console.error('Email verification error:', error);
    res.status(500).json(
      formatResponse(false, 'Email verification failed', null, error.message)
    );
  }
});

module.exports = router;
