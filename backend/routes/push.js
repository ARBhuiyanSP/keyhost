const express = require('express');
const router = express.Router();
const { pool } = require('../config/database');
const { verifyToken } = require('../middleware/auth');

// GET /api/push/vapid-public-key  — return VAPID public key to frontend
router.get('/vapid-public-key', (req, res) => {
  const key = process.env.VAPID_PUBLIC_KEY;
  if (!key) {
    return res.status(500).json({ success: false, message: 'VAPID public key not configured' });
  }
  res.json({ success: true, publicKey: key });
});

// POST /api/push/subscribe  — save user's push subscription
router.post('/subscribe', verifyToken, async (req, res) => {
  try {
    const userId = req.user.id;
    const { endpoint, keys, userAgent } = req.body;

    if (!endpoint || !keys?.p256dh || !keys?.auth) {
      return res.status(400).json({ success: false, message: 'Invalid subscription object' });
    }

    // Upsert: insert or update existing subscription for same endpoint
    await pool.execute(
      `INSERT INTO push_subscriptions (user_id, endpoint, p256dh_key, auth_key, user_agent)
       VALUES (?, ?, ?, ?, ?)
       ON DUPLICATE KEY UPDATE
         user_id    = VALUES(user_id),
         p256dh_key = VALUES(p256dh_key),
         auth_key   = VALUES(auth_key),
         user_agent = VALUES(user_agent),
         updated_at = NOW()`,
      [userId, endpoint, keys.p256dh, keys.auth, userAgent || null]
    );

    console.log(`[Push] Subscribed user ${userId}`);
    res.json({ success: true, message: 'Subscribed to push notifications' });
  } catch (err) {
    console.error('[Push] Subscribe error:', err.message || err);
    res.status(500).json({ success: false, message: 'Failed to save subscription' });
  }
});

// DELETE /api/push/unsubscribe  — remove user's push subscription
router.delete('/unsubscribe', verifyToken, async (req, res) => {
  try {
    const userId = req.user.id;
    const { endpoint } = req.body;

    if (endpoint) {
      await pool.execute(
        'DELETE FROM push_subscriptions WHERE user_id = ? AND endpoint = ?',
        [userId, endpoint]
      );
    } else {
      // Remove all subscriptions for this user
      await pool.execute('DELETE FROM push_subscriptions WHERE user_id = ?', [userId]);
    }

    console.log(`[Push] Unsubscribed user ${userId}`);
    res.json({ success: true, message: 'Unsubscribed from push notifications' });
  } catch (err) {
    console.error('[Push] Unsubscribe error:', err.message || err);
    res.status(500).json({ success: false, message: 'Failed to remove subscription' });
  }
});

// GET /api/push/status  — check if current user has an active subscription
router.get('/status', verifyToken, async (req, res) => {
  try {
    const userId = req.user.id;
    const [rows] = await pool.execute(
      'SELECT COUNT(*) as count FROM push_subscriptions WHERE user_id = ?',
      [userId]
    );
    res.json({ success: true, subscribed: rows[0].count > 0 });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to check status' });
  }
});

module.exports = router;
