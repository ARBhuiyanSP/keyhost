const { pool } = require('../config/database');
const { syncHmsAccessForHost } = require('./hms-helper');
const { sendWhatsAppMessage } = require('./whatsapp');

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

const checkMaintenanceAlerts = async () => {
  try {
    console.log('HMS Maintenance Cron: Checking pending notifications for today...');
    
    // Get all notifications for today that are not sent
    const [notifications] = await pool.query(`
      SELECT n.id, n.task_id, n.host_id, t.task_type, t.next_due_date, p.title as property_title, u.phone, u.first_name 
      FROM hms_maintenance_notifications n
      JOIN hms_maintenance_tasks t ON n.task_id = t.id
      JOIN properties p ON t.property_id = p.id
      JOIN users u ON n.host_id = u.id
      WHERE n.notification_date <= CURDATE() AND n.is_sent = 0
    `);

    if (notifications.length === 0) {
      console.log('HMS Maintenance Cron: No pending alerts found.');
      return;
    }

    for (const notif of notifications) {
      const { id, task_type, next_due_date, property_title, phone, first_name } = notif;
      
      const formattedDate = new Date(next_due_date).toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric'
      });

      const message = `Hi ${first_name || 'Host'},\nThis is an automated reminder from Keyhost Homes.\nYour scheduled maintenance task [${task_type}] for property/room [${property_title}] is due on ${formattedDate}.\n\nPlease check your HMS Maintenance panel for details.`;
      
      console.log(`HMS Maintenance Cron: Sending WhatsApp notification to host phone ${phone}...`);
      
      let sentSuccess = false;
      if (phone) {
        const result = await sendWhatsAppMessage(phone, message);
        if (result && result.success) {
          sentSuccess = true;
          console.log(`HMS Maintenance Cron: WhatsApp sent successfully to ${phone}`);
        } else {
          console.error(`HMS Maintenance Cron: Failed to send WhatsApp to ${phone}:`, result?.error || 'Unknown error');
        }
      }

      // Mark as sent in database
      await pool.query('UPDATE hms_maintenance_notifications SET is_sent = 1, sent_at = NOW() WHERE id = ?', [id]);
    }
  } catch (error) {
    console.error('Error running checkMaintenanceAlerts cron:', error);
  }
};

module.exports = { expireHMSSubscriptions, checkMaintenanceAlerts };
