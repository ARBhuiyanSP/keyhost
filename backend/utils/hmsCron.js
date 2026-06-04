const { pool } = require('../config/database');
const { syncHmsAccessForHost } = require('./hms-helper');

const expireHMSSubscriptions = async () => {
  try {
    // 1. Get host_ids that should be expired
    const [expiredRows] = await pool.query(`
      SELECT host_id FROM hms_subscriptions 
      WHERE 
        (status = 'trialing' AND trial_ends_at < NOW()) OR
        (status = 'active' AND subscription_ends_at < NOW())
    `);

    if (expiredRows.length > 0) {
      const hostIds = expiredRows.map(row => row.host_id);
      
      // 2. Perform the update
      const [result] = await pool.query(`
        UPDATE hms_subscriptions 
        SET status = 'expired'
        WHERE host_id IN (?)
      `, [hostIds]);
      
      console.log(`HMS Cron: Expired ${result.affectedRows} HMS subscriptions`);

      // 3. Sync HMS access status to false for all of them
      for (const hostId of hostIds) {
        await syncHmsAccessForHost(hostId, false);
      }
    }
  } catch (error) {
    console.error('Error expiring HMS subscriptions:', error);
  }
};

module.exports = { expireHMSSubscriptions };
