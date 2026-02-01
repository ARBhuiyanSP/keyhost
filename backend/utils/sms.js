const axios = require('axios');
const { pool } = require('../config/database');

const SMS_SETTING_KEYS = [
  'sms_api_key',
  'sms_secret_key',
  'sms_sender_id',
  'sms_enabled',
  'sms_api_url'
];

const DEFAULT_SMS_API_URL = 'http://217.172.190.215/sendtext';

async function getSmsSettings() {
  const [rows] = await pool.execute(
    `
      SELECT setting_key, setting_value
      FROM system_settings
      WHERE setting_key IN (?, ?, ?, ?, ?)
    `,
    SMS_SETTING_KEYS
  );

  const settings = {};
  rows.forEach(row => {
    settings[row.setting_key] = row.setting_value;
  });

  return settings;
}

async function sendSMS({ to, message }) {
  try {
    console.log(`📱 sendSMS called with:`, { to: to ? to.slice(0, 3) + '***' + to.slice(-4) : 'MISSING', messageLength: message?.length || 0 });

    if (!to || !message) {
      const errorMsg = `Missing phone number or message content. Phone: ${to ? 'provided' : 'missing'}, Message: ${message ? 'provided' : 'missing'}`;
      console.error(`❌ ${errorMsg}`);
      throw new Error(errorMsg);
    }

    console.log(`📋 Fetching SMS settings from database...`);
    const settings = await getSmsSettings();
    console.log(`📋 SMS settings loaded:`, {
      sms_enabled: settings.sms_enabled,
      has_api_key: !!settings.sms_api_key,
      has_secret_key: !!settings.sms_secret_key,
      has_sender_id: !!settings.sms_sender_id,
      api_url: settings.sms_api_url || DEFAULT_SMS_API_URL
    });

    const isEnabled = (settings.sms_enabled ?? 'true').toString().toLowerCase() !== 'false';
    if (!isEnabled) {
      console.log('⚠️ SMS sending disabled via settings');
      return { success: false, skipped: true, reason: 'disabled' };
    }

    const apiKey = settings.sms_api_key;
    const secretKey = settings.sms_secret_key;
    const senderId = settings.sms_sender_id;
    const apiUrl = settings.sms_api_url || DEFAULT_SMS_API_URL;

    if (!apiKey || !secretKey || !senderId) {
      const missingFields = [];
      if (!apiKey) missingFields.push('sms_api_key');
      if (!secretKey) missingFields.push('sms_secret_key');
      if (!senderId) missingFields.push('sms_sender_id');
      const errorMsg = `SMS credentials not configured. Missing: ${missingFields.join(', ')}`;
      console.error(`❌ ${errorMsg}`);
      throw new Error(errorMsg);
    }

    const sanitizedTo = String(to).replace(/\s+/g, '');
    const encodedMessage = encodeURIComponent(message);

    const url = `${apiUrl}?apikey=${encodeURIComponent(apiKey)}&secretkey=${encodeURIComponent(secretKey)}&callerID=${encodeURIComponent(senderId)}&toUser=${encodeURIComponent(sanitizedTo)}&messageContent=${encodedMessage}`;

    console.log(`📤 Sending SMS to ${sanitizedTo.slice(0, 3)}***${sanitizedTo.slice(-4)} via URL: ${apiUrl.replace(/\?.*/, '')}...`);
    console.log(`📝 Message preview: ${message.substring(0, 50)}...`);

    const response = await axios.get(url, { timeout: 10000 });
    const body = response.data;

    console.log(`📥 SMS API Response:`, { status: response.status, data: body });

    // Check if response indicates success (adjust based on your SMS API response format)
    if (response.status === 200 && body) {
      console.log(`✅ SMS sent successfully to ${sanitizedTo.slice(0, 3)}***${sanitizedTo.slice(-4)}:`, { response: body });
      return { success: true, response: body };
    } else {
      const errorMsg = `SMS API error: ${JSON.stringify(body)}`;
      console.error(`❌ ${errorMsg}`);
      throw new Error(errorMsg);
    }
  } catch (error) {
    console.error(`❌ SMS send error:`, error.message || error);
    if (error.response) {
      console.error(`❌ SMS API HTTP Error:`, {
        status: error.response.status,
        statusText: error.response.statusText,
        data: error.response.data
      });
    }
    if (error.stack) {
      console.error(`❌ SMS Error Stack:`, error.stack);
    }
    return { success: false, error: error.message || error };
  }
}

module.exports = {
  sendSMS
};

