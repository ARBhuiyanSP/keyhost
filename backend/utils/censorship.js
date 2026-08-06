const { pool } = require('../config/database');

/**
 * Helper to escape special characters in user input for Regex matching.
 */
function escapeRegExp(string) {
  return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

/**
 * Fetch censorship configurations from system_settings dynamically.
 */
async function getCensorshipSettings() {
  try {
    const [rows] = await pool.execute(
      `SELECT setting_key, setting_value, setting_type 
       FROM system_settings 
       WHERE setting_key IN ('censor_phone_numbers', 'censor_emails', 'censor_links', 'censor_banned_words')`
    );

    const config = {
      censor_phone_numbers: true,
      censor_emails: true,
      censor_links: true,
      censor_banned_words: []
    };

    rows.forEach(row => {
      let val = row.setting_value;
      if (row.setting_type === 'boolean') {
        val = val === 'true';
      } else if (row.setting_type === 'json') {
        try {
          val = JSON.parse(val);
        } catch {
          val = [];
        }
      }
      config[row.setting_key] = val;
    });

    return config;
  } catch (err) {
    console.error('[Censorship] Failed to fetch settings, using secure defaults:', err.message || err);
    return {
      censor_phone_numbers: true,
      censor_emails: true,
      censor_links: true,
      censor_banned_words: []
    };
  }
}

/**
 * Core function to sanitize host-guest messages based on admin configurations.
 * @param {string} text
 * @returns {Promise<string>}
 */
async function censorMessage(text) {
  if (!text || typeof text !== 'string') return text;

  const config = await getCensorshipSettings();
  let sanitized = text;

  // ── 1. Censor Emails ──────────────────────────────────────────
  if (config.censor_emails) {
    const emailRegex = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/gi;
    sanitized = sanitized.replace(emailRegex, '[🚫 EMAIL REDACTED]');
  }

  // ── 2. Censor Phone Numbers (English, Bengali, and Custom structures) ──
  if (config.censor_phone_numbers) {
    // English mobile number structures (e.g. +88017..., 01712345678, 017-1234-5678)
    const enPhoneRegex = /(?:\+?88)?\b01[3-9][\s\.-]?\d{3,4}[\s\.-]?\d{4}\b/g;
    sanitized = sanitized.replace(enPhoneRegex, '[🚫 NUMBER REDACTED]');

    // Bengali mobile number structures (e.g. +৮৮০১৭..., ০১৭১২৩৪৫৬৭৮)
    const bnPhoneRegex = /(?:\+?৮৮)?\b০১[৩-৯][\s\.-]?[০-৯]{3,4}[\s\.-]?[০-৯]{4}\b/g;
    sanitized = sanitized.replace(bnPhoneRegex, '[🚫 NUMBER REDACTED]');

    // Spread-out numbers workaround check (e.g. 0 1 7 1 2 3 4 5 6 7 8 or 0-1-7...)
    // This looks for 8 to 14 numbers spaced out in sequence
    const spreadPhoneRegex = /(?:(?:\d|০|১|২|৩|৪|৫|৬|৭|৮|৯)[\s\.-]?){8,14}/g;
    sanitized = sanitized.replace(spreadPhoneRegex, (match) => {
      // Clean non-digits to verify length
      const digitsOnly = match.replace(/[^\d০-৯]/g, '');
      if (digitsOnly.length >= 8 && digitsOnly.length <= 13) {
        return '[🚫 NUMBER REDACTED]';
      }
      return match;
    });

    // Literal spellings (e.g. "zero one seven...")
    const numberSpellingMap = {
      'zero': '0', 'one': '1', 'two': '2', 'three': '3', 'four': '4',
      'five': '5', 'six': '6', 'seven': '7', 'eight': '8', 'nine': '9',
      '০': '0', '১': '1', '২': '2', '৩': '3', '৪': '4', '৫': '5', '৬': '6', '৭': '7', '৮': '8', '৯': '9'
    };
    
    // Check if spelling keywords are present
    const spellingKeywords = Object.keys(numberSpellingMap).filter(k => k.length > 2); // only words like zero, one, etc.
    const textLower = sanitized.toLowerCase();
    
    const containsSpellings = spellingKeywords.some(word => textLower.includes(word));
    if (containsSpellings) {
      // Temporarily convert words to check sequences
      let temp = textLower;
      Object.entries(numberSpellingMap).forEach(([word, val]) => {
        temp = temp.replace(new RegExp(word, 'g'), val);
      });
      // Look for digit sequences after conversion
      const parsedDigits = temp.replace(/[^\d]/g, '');
      if (parsedDigits.length >= 8 && parsedDigits.length <= 13) {
        sanitized = '[🚫 NUMBER REDACTED]';
      }
    }
  }

  // ── 3. Censor URLs & Hyperlinks ──────────────────────────────
  if (config.censor_links) {
    // Matches http://, https://, ftp://, or www.
    const linkRegex = /(https?:\/\/|ftp:\/\/|www\.)[-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b(?:[-a-zA-Z0-9()@:%_\+.~#?&//=]*)/gi;
    sanitized = sanitized.replace(linkRegex, '[🚫 LINK REDACTED]');

    // Matches standalone domains (e.g. google.com, facebook.com)
    const domainRegex = /\b[a-zA-Z0-9-]+\.(?:com|net|org|edu|gov|mil|biz|info|mobi|name|xyz|co|cc|bd|tk|io)\b/gi;
    sanitized = sanitized.replace(domainRegex, '[🚫 LINK REDACTED]');
  }

  // ── 4. Censor Admin Banned Words ──────────────────────────────
  if (Array.isArray(config.censor_banned_words) && config.censor_banned_words.length > 0) {
    config.censor_banned_words.forEach(word => {
      if (word && typeof word === 'string' && word.trim().length > 0) {
        const escaped = escapeRegExp(word.trim());
        const regex = new RegExp(`\\b${escaped}\\b`, 'gi');
        sanitized = sanitized.replace(regex, '[🚫 REDACTED]');
      }
    });
  }

  return sanitized;
}

module.exports = { censorMessage, getCensorshipSettings };
