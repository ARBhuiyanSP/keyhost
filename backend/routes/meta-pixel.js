const express = require('express');
const router = express.Router();
const { pool } = require('../config/database');
const axios = require('axios');
const crypto = require('crypto');

// Helper to hash using SHA-256
function hashValue(val) {
  if (!val) return undefined;
  const str = String(val).trim().toLowerCase();
  // If already SHA-256 hashed
  if (/^[a-f0-9]{64}$/i.test(str)) {
    return str;
  }
  return crypto.createHash('sha256').update(str).digest('hex');
}

// POST /api/meta-pixel/event
router.post('/event', async (req, res) => {
  try {
    const { eventName, eventId, eventSourceUrl, userData = {}, customData = {} } = req.body;

    if (!eventName) {
      return res.status(400).json({ success: false, message: 'Event name is required' });
    }

    // 1. Fetch Meta Pixel settings from Database
    const [rows] = await pool.execute(
      `SELECT setting_key, setting_value FROM system_settings 
       WHERE setting_key IN ('facebook_pixel_id', 'meta_access_token', 'meta_test_event_code', 'meta_capi_enabled', 'meta_advanced_matching')`
    );

    const settings = {};
    rows.forEach(row => {
      settings[row.setting_key] = row.setting_value;
    });

    const capiEnabled = settings.meta_capi_enabled === 'true';
    const pixelId = settings.facebook_pixel_id;
    const accessToken = settings.meta_access_token;
    const testCode = settings.meta_test_event_code;
    const advancedMatching = settings.meta_advanced_matching !== 'false';

    // If CAPI is disabled or config is missing, return early (silent success or skip)
    if (!capiEnabled || !pixelId || !accessToken) {
      return res.json({ 
        success: true, 
        message: 'Conversions API disabled or not fully configured. Skipped.' 
      });
    }

    // 2. Prepare user data payload (hashed)
    const clientIp = req.ip || req.headers['x-forwarded-for'] || req.socket.remoteAddress;
    const clientUserAgent = req.headers['user-agent'];

    const hashedUserData = {
      client_ip_address: clientIp,
      client_user_agent: clientUserAgent,
    };

    if (advancedMatching) {
      if (userData.email) hashedUserData.em = hashValue(userData.email);
      if (userData.phone) hashedUserData.ph = hashValue(userData.phone);
      if (userData.firstName) hashedUserData.fn = hashValue(userData.firstName);
      if (userData.lastName) hashedUserData.ln = hashValue(userData.lastName);
      if (userData.city) hashedUserData.ct = hashValue(userData.city);
      if (userData.state) hashedUserData.st = hashValue(userData.state);
      if (userData.zip) hashedUserData.zp = hashValue(userData.zip);
      if (userData.country) hashedUserData.country = hashValue(userData.country);
      if (userData.externalId) hashedUserData.external_id = hashValue(userData.externalId);
    }

    // 3. Prepare the Meta event payload
    const eventPayload = {
      event_name: eventName,
      event_time: Math.floor(Date.now() / 1000),
      event_id: eventId || `evt_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      event_source_url: eventSourceUrl || req.headers.referer || '',
      action_source: 'website',
      user_data: hashedUserData,
      custom_data: customData
    };

    const requestBody = {
      data: [eventPayload]
    };

    // If test event code is provided in settings, attach it
    if (testCode) {
      requestBody.test_event_code = testCode;
    }

    // 4. Send request to Meta graph API
    const metaUrl = `https://graph.facebook.com/v18.0/${pixelId}/events?access_token=${accessToken}`;
    
    console.log(`[CAPI] Sending event '${eventName}' to Meta...`);
    const response = await axios.post(metaUrl, requestBody);

    res.json({ 
      success: true, 
      message: `Event '${eventName}' sent successfully via CAPI`, 
      fbTraceId: response.headers['x-fb-trace-id'] 
    });

  } catch (err) {
    console.error('[CAPI] Error sending event to Meta:', err.response?.data || err.message || err);
    // Return 200/success anyway to avoid breaking frontend/checkout flow if CAPI fails
    res.json({ 
      success: false, 
      message: 'Failed to send event to Meta Conversions API',
      error: err.message 
    });
  }
});

module.exports = router;
