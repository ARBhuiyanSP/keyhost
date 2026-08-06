/**
 * Utility to check if a message has restricted content based on public settings.
 * Runs on the client-side to show early warnings before submission.
 * @param {string} text
 * @param {object} settings - The settings object from useSettingsStore()
 * @returns {{ hasRestricted: boolean, reason: string }}
 */
export function checkMessageCensorship(text, settings = {}) {
  if (!text || typeof text !== 'string') {
    return { hasRestricted: false, reason: '' };
  }

  // 1. Check Phone Numbers
  const censorPhone = settings.censor_phone_numbers !== false; // default true
  if (censorPhone) {
    const enPhoneRegex = /(?:\+?88)?\b01[3-9][\s\.-]?\d{3,4}[\s\.-]?\d{4}\b/g;
    const bnPhoneRegex = /(?:\+?৮৮)?\b০১[৩-৯][\s\.-]?[০-৯]{3,4}[\s\.-]?[০-৯]{4}\b/g;
    const spreadPhoneRegex = /(?:(?:\d|০|১|২|৩|৪|৫|৬|৭|৮|৯)[\s\.-]?){8,14}/g;

    const hasEnPhone = enPhoneRegex.test(text);
    const hasBnPhone = bnPhoneRegex.test(text);
    
    let hasSpreadPhone = false;
    const matches = text.match(spreadPhoneRegex) || [];
    for (const match of matches) {
      const digitsOnly = match.replace(/[^\d০-৯]/g, '');
      if (digitsOnly.length >= 8 && digitsOnly.length <= 13) {
        hasSpreadPhone = true;
        break;
      }
    }

    if (hasEnPhone || hasBnPhone || hasSpreadPhone) {
      return {
        hasRestricted: true,
        reason: 'Sharing phone numbers is restricted to protect platform security.'
      };
    }
  }

  // 2. Check Email Addresses
  const censorEmail = settings.censor_emails !== false;
  if (censorEmail) {
    const emailRegex = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/gi;
    if (emailRegex.test(text)) {
      return {
        hasRestricted: true,
        reason: 'Sharing email addresses is restricted to protect platform security.'
      };
    }
  }

  // 3. Check Website Links
  const censorLinks = settings.censor_links !== false;
  if (censorLinks) {
    const linkRegex = /(https?:\/\/|ftp:\/\/|www\.)[-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b(?:[-a-zA-Z0-9()@:%_\+.~#?&//=]*)/gi;
    const domainRegex = /\b[a-zA-Z0-9-]+\.(?:com|net|org|edu|gov|mil|biz|info|mobi|name|xyz|co|cc|bd|tk|io)\b/gi;
    if (linkRegex.test(text) || domainRegex.test(text)) {
      return {
        hasRestricted: true,
        reason: 'Sharing links and URLs is restricted to protect platform security.'
      };
    }
  }

  // 4. Check Banned Words
  const bannedWords = settings.censor_banned_words;
  if (Array.isArray(bannedWords) && bannedWords.length > 0) {
    for (const word of bannedWords) {
      if (word && typeof word === 'string' && word.trim().length > 0) {
        const escaped = word.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
        const regex = new RegExp(`\\b${escaped}\\b`, 'gi');
        if (regex.test(text)) {
          return {
            hasRestricted: true,
            reason: `The term "${word}" is restricted on this platform.`
          };
        }
      }
    }
  }

  return { hasRestricted: false, reason: '' };
}
