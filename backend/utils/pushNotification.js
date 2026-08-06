const webpush = require('web-push');
const { pool } = require('../config/database');

// Configure VAPID details once at module load
webpush.setVapidDetails(
  process.env.VAPID_EMAIL || 'mailto:support@keyhosthomes.com',
  process.env.VAPID_PUBLIC_KEY,
  process.env.VAPID_PRIVATE_KEY
);

/**
 * Send a push notification to all subscriptions for a given user.
 * @param {number} userId
 * @param {{ title: string, body: string, url?: string, icon?: string, tag?: string }} payload
 */
async function sendPushToUser(userId, payload) {
  if (!userId) return;

  try {
    const [subscriptions] = await pool.execute(
      'SELECT id, endpoint, p256dh_key, auth_key FROM push_subscriptions WHERE user_id = ?',
      [userId]
    );

    if (subscriptions.length === 0) {
      console.log(`[Push] No subscriptions found for user ${userId}`);
      return;
    }

    const notificationPayload = JSON.stringify({
      title: payload.title || 'Keyhost Homes',
      body: payload.body || '',
      icon: payload.icon || '/logo192.png',
      badge: '/logo192.png',
      url: payload.url || '/',
      tag: payload.tag || 'keyhost-notification',
      timestamp: Date.now()
    });

    const results = await Promise.allSettled(
      subscriptions.map(async (sub) => {
        const pushSubscription = {
          endpoint: sub.endpoint,
          keys: {
            p256dh: sub.p256dh_key,
            auth: sub.auth_key
          }
        };

        try {
          await webpush.sendNotification(pushSubscription, notificationPayload);
          console.log(`[Push] ✅ Sent to user ${userId} (sub ${sub.id})`);
        } catch (err) {
          // Subscription expired or invalid — remove it
          if (err.statusCode === 410 || err.statusCode === 404) {
            console.log(`[Push] Removing expired subscription ${sub.id}`);
            await pool.execute('DELETE FROM push_subscriptions WHERE id = ?', [sub.id]);
          } else {
            console.error(`[Push] ❌ Failed for sub ${sub.id}:`, err.message);
          }
        }
      })
    );

    const sent = results.filter(r => r.status === 'fulfilled').length;
    console.log(`[Push] Sent ${sent}/${subscriptions.length} notifications to user ${userId}`);
  } catch (err) {
    console.error('[Push] sendPushToUser error:', err.message || err);
  }
}

/**
 * Send push notification to multiple users at once.
 * @param {number[]} userIds
 * @param {object} payload
 */
async function sendPushToUsers(userIds, payload) {
  await Promise.allSettled(userIds.map(uid => sendPushToUser(uid, payload)));
}

module.exports = { sendPushToUser, sendPushToUsers };
