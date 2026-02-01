const express = require('express');
const { pool } = require('../config/database');
const { formatResponse } = require('../utils/helpers');

const router = express.Router();

// Get public settings (for non-admin users) - No authentication required
router.get('/public', async (req, res) => {
  try {
    const [settings] = await pool.execute(`
      SELECT setting_key, setting_value, setting_type
      FROM system_settings
      WHERE is_public = TRUE
      ORDER BY setting_key
    `);

    // Convert array to object for easier frontend usage
    const settingsObj = {};
    settings.forEach(setting => {
      let value = setting.setting_value;
      
      // Convert value based on type
      if (setting.setting_type === 'number') {
        value = parseFloat(value);
      } else if (setting.setting_type === 'boolean') {
        value = value === 'true';
      } else if (setting.setting_type === 'json') {
        try {
          value = JSON.parse(value);
        } catch (e) {
          value = value;
        }
      }
      
      settingsObj[setting.setting_key] = value;
    });

    res.json(
      formatResponse(true, 'Public settings retrieved successfully', settingsObj)
    );

  } catch (error) {
    console.error('Get public settings error:', error);
    res.status(500).json(
      formatResponse(false, 'Failed to retrieve public settings', null, error.message)
    );
  }
});

module.exports = router;




