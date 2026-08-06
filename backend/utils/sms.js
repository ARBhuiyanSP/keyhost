const axios = require('axios');
const { pool } = require('../config/database');
const { sendWhatsAppMessage } = require('./whatsapp');
const {
  sendBookingRequestEmail,
  sendBookingAcceptedEmail,
  sendBookingPaidHostEmail,
  sendBookingPaidGuestEmail,
  sendCheckoutEmail,
  sendRefundGuestEmail,
  sendRefundHostEmail
} = require('./email');
const { sendPushToUser } = require('./pushNotification');

// Helper to format check-in/out dates without timezone shifts
function formatSmsDate(dateInput) {
  if (!dateInput) return '';
  
  let dateStr = dateInput;
  if (dateInput instanceof Date) {
    const year = dateInput.getFullYear();
    const month = String(dateInput.getMonth() + 1).padStart(2, '0');
    const day = String(dateInput.getDate()).padStart(2, '0');
    dateStr = `${year}-${month}-${day}`;
  } else if (typeof dateInput === 'string') {
    dateStr = dateInput.split(' ')[0].split('T')[0];
  } else {
    return '';
  }

  const parts = dateStr.split('-');
  if (parts.length !== 3) {
    return new Date(dateInput).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  }

  const [year, month, day] = parts;
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  return `${months[parseInt(month, 10) - 1]} ${parseInt(day, 10)}, ${year}`;
}

const SMS_SETTING_KEYS = [
  'sms_api_key',
  'sms_secret_key',
  'sms_sender_id',
  'sms_enabled',
  'sms_api_url',
  'sms_gateway_type'
];

const DEFAULT_SMS_API_URL = 'http://217.172.190.215/sendtext';

async function getSmsSettings() {
  const [rows] = await pool.execute(
    `
      SELECT setting_key, setting_value
      FROM system_settings
      WHERE setting_key IN (${SMS_SETTING_KEYS.map(() => '?').join(', ')})
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

    const gatewayType = settings.sms_gateway_type || 'bulk_sms';
    if (gatewayType === 'whatsapp') {
      console.log(`💬 Routing message to WhatsApp...`);
      const result = await sendWhatsAppMessage(to, message);
      return result;
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

async function getSettingValue(key, defaultValue = '') {
  try {
    const [rows] = await pool.execute(
      'SELECT setting_value FROM system_settings WHERE setting_key = ? LIMIT 1',
      [key]
    );
    return rows.length > 0 ? rows[0].setting_value : defaultValue;
  } catch (err) {
    console.error(`Failed to get setting ${key}:`, err);
    return defaultValue;
  }
}

function parseTemplate(template, placeholders = {}) {
  if (!template) return '';
  let result = template;
  for (const [key, value] of Object.entries(placeholders)) {
    const regex = new RegExp(`{${key}}`, 'g');
    result = result.replace(regex, value !== undefined && value !== null ? String(value) : '');
  }
  return result;
}

async function getBookingDetailsForSms(bookingId) {
  const [rows] = await pool.execute(
    `
      SELECT 
        b.id,
        b.booking_reference,
        b.total_amount,
        b.payment_method,
        b.check_in_date,
        b.check_out_date,
        b.guest_name,
        b.guest_phone,
        b.guest_email,
        b.guest_id,
        b.payment_deadline,
        p.title as property_title,
        p.internal_name as property_internal_name,
        p.owner_id,
        o_u.id as host_user_id,
        o_u.first_name as owner_first_name,
        o_u.last_name as owner_last_name,
        o_u.phone as owner_phone,
        o_u.email as owner_email,
        g_u.first_name as guest_first_name,
        g_u.last_name as guest_last_name,
        g_u.phone as guest_user_phone,
        g_u.email as guest_user_email
      FROM bookings b
      JOIN properties p ON b.property_id = p.id
      JOIN property_owners po ON p.owner_id = po.id
      JOIN users o_u ON po.user_id = o_u.id
      LEFT JOIN users g_u ON b.guest_id = g_u.id
      WHERE b.id = ?
      LIMIT 1
    `,
    [bookingId]
  );
  if (rows.length === 0) return null;
  const row = rows[0];
  // host_property_name: use internal_name if set, otherwise fall back to title
  row.host_property_name = (row.property_internal_name && row.property_internal_name.trim())
    ? row.property_internal_name.trim()
    : row.property_title;
  return row;
}

async function sendBookingRequestSms(bookingId, isAutoAccepted = false) {
  try {
    const booking = await getBookingDetailsForSms(bookingId);
    if (!booking) return;

    const hostPhone = booking.owner_phone;
    if (!hostPhone) {
      console.warn(`[SMS] Host phone not found for booking ${booking.booking_reference}`);
      return;
    }

    const hostName = [booking.owner_first_name, booking.owner_last_name].filter(Boolean).join(' ') || 'Host';
    const guestName = booking.guest_name || [booking.guest_first_name, booking.guest_last_name].filter(Boolean).join(' ') || 'Guest';
    const checkInStr = formatSmsDate(booking.check_in_date);

    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
    const bookingUrl = isAutoAccepted 
      ? `${frontendUrl}/property-owner/bookings?search=${booking.booking_reference}`
      : `${frontendUrl}/property-owner/booking-negotiation/${bookingId}`;

    let template;
    if (isAutoAccepted) {
      const defaultTemplate = `[Keyhost] New booking {booking_ref} automatically accepted for {property_name}. Guest: {guest_name}. Check-in: {check_in_date}. View details here: {booking_url}`;
      template = await getSettingValue('sms_template_booking_auto_accepted_host', defaultTemplate);
    } else {
      const defaultTemplate = `[Keyhost] New booking request {booking_ref} for {property_name}. Guest: {guest_name}. Check-in: {check_in_date}. Review & accept here: {booking_url}`;
      template = await getSettingValue('sms_template_booking_request_host', defaultTemplate);
    }

    const message = parseTemplate(template, {
      host_name: hostName,
      guest_name: guestName,
      property_name: booking.host_property_name,
      booking_ref: booking.booking_reference,
      check_in_date: checkInStr,
      booking_url: bookingUrl
    });

    console.log(`[SMS] Sending Booking Request/Auto-Accepted to Host: ${message}`);
    await sendSMS({ to: hostPhone, message });

    // ── Email to Host ──────────────────────────────────────────
    const hostEmail = booking.owner_email;
    if (hostEmail) {
      const frontendUrlForEmail = process.env.FRONTEND_URL || 'http://localhost:3000';
      const emailBookingUrl = isAutoAccepted
        ? `${frontendUrlForEmail}/property-owner/bookings?search=${booking.booking_reference}`
        : `${frontendUrlForEmail}/property-owner/booking-negotiation/${bookingId}`;
      await sendBookingRequestEmail({
        toEmail: hostEmail,
        hostName,
        guestName,
        propertyName: booking.host_property_name,
        bookingRef: booking.booking_reference,
        checkInDate: checkInStr,
        bookingUrl: emailBookingUrl
      });
    }

    // ── Push Notification to Host ───────────────────────────────
    if (booking.host_user_id) {
      const frontendUrlPush = process.env.FRONTEND_URL || 'http://localhost:3000';
      const pushUrl = isAutoAccepted
        ? `${frontendUrlPush}/property-owner/bookings?search=${booking.booking_reference}`
        : `${frontendUrlPush}/property-owner/booking-negotiation/${bookingId}`;
      await sendPushToUser(booking.host_user_id, {
        title: isAutoAccepted ? '✅ New Booking (Auto-Accepted)' : '🔔 New Booking Request',
        body: `${guestName} wants to book ${booking.host_property_name} — Check-in: ${checkInStr}`,
        url: pushUrl,
        tag: `booking-request-${booking.booking_reference}`
      });
    }
  } catch (error) {
    console.error('[SMS] sendBookingRequestSms error:', error);
  }
}

async function sendBookingAcceptedSms(bookingId) {
  try {
    const booking = await getBookingDetailsForSms(bookingId);
    if (!booking) return;

    const guestPhone = booking.guest_phone || booking.guest_user_phone;
    if (!guestPhone) {
      console.warn(`[SMS] Guest phone not found for booking ${booking.booking_reference}`);
      return;
    }

    const guestName = booking.guest_name || [booking.guest_first_name, booking.guest_last_name].filter(Boolean).join(' ') || 'Guest';
    const checkInStr = formatSmsDate(booking.check_in_date);
    
    // Get payment time limit
    const limitSetting = await getSettingValue('payment_time_limit_minutes', '15');
    const paymentTimeLimitMinutes = parseInt(limitSetting) || 15;

    const deadlineDate = booking.payment_deadline ? new Date(booking.payment_deadline) : null;
    const deadlineStr = deadlineDate ? deadlineDate.toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    }) : `${paymentTimeLimitMinutes} minutes`;

    const amountStr = booking.total_amount ? `৳${booking.total_amount}` : '';

    const defaultTemplate = `[Keyhost] Hello {guest_name}, your booking request {booking_ref} for {property_name} has been accepted! Please pay {amount} within {payment_limit} mins (before {deadline}) to confirm your stay.`;
    const template = await getSettingValue('sms_template_booking_accepted_guest', defaultTemplate);

    const message = parseTemplate(template, {
      guest_name: guestName,
      property_name: booking.property_title,
      booking_ref: booking.booking_reference,
      payment_limit: paymentTimeLimitMinutes,
      deadline: deadlineStr,
      check_in_date: checkInStr,
      amount: amountStr
    });

    console.log(`[SMS] Sending Booking Accepted to Guest: ${message}`);
    await sendSMS({ to: guestPhone, message });

    // ── Email to Guest ─────────────────────────────────────────
    const guestEmail = booking.guest_email || booking.guest_user_email;
    if (guestEmail) {
      const frontendUrlForEmail = process.env.FRONTEND_URL || 'http://localhost:3000';
      await sendBookingAcceptedEmail({
        toEmail: guestEmail,
        guestName,
        propertyName: booking.property_title,
        bookingRef: booking.booking_reference,
        checkInDate: checkInStr,
        amount: amountStr,
        deadline: deadlineStr,
        paymentUrl: `${frontendUrlForEmail}/guest/bookings`
      });
    }

    // ── Push Notification to Guest ─────────────────────────────
    if (booking.guest_id) {
      const frontendUrlPush = process.env.FRONTEND_URL || 'http://localhost:3000';
      await sendPushToUser(booking.guest_id, {
        title: '🎉 Booking Accepted!',
        body: `Your booking at ${booking.property_title} was accepted. Pay ${amountStr} to confirm.`,
        url: `${frontendUrlPush}/guest/bookings`,
        tag: `booking-accepted-${booking.booking_reference}`
      });
    }
  } catch (error) {
    console.error('[SMS] sendBookingAcceptedSms error:', error);
  }
}

async function sendBookingPaidSms(bookingId) {
  try {
    const booking = await getBookingDetailsForSms(bookingId);
    if (!booking) return;

    const hostPhone = booking.owner_phone;
    const guestPhone = booking.guest_phone || booking.guest_user_phone;
    const hostName = [booking.owner_first_name, booking.owner_last_name].filter(Boolean).join(' ') || 'Host';
    const guestName = booking.guest_name || [booking.guest_first_name, booking.guest_last_name].filter(Boolean).join(' ') || 'Guest';
    const checkInStr = formatSmsDate(booking.check_in_date);
    const amountStr = booking.total_amount ? `৳${booking.total_amount}` : '';

    const methodRaw = booking.payment_method ? String(booking.payment_method).toLowerCase() : '';
    const viaPaymentMethod = methodRaw ? ` via ${methodRaw === 'sslcommerz' ? 'SSLCommerz' : methodRaw === 'bkash' ? 'bKash' : methodRaw === 'nagad' ? 'Nagad' : methodRaw}` : '';

    const placeholders = {
      host_name: hostName,
      guest_name: guestName,
      // Host messages use internal name; guest messages get property_title via separate templates
      property_name: booking.host_property_name,
      property_name_guest: booking.property_title,
      booking_ref: booking.booking_reference,
      check_in_date: checkInStr,
      amount: amountStr,
      via_payment_method: viaPaymentMethod
    };

    // 1. Send to Host
    if (hostPhone) {
      const defaultHostTemplate = `[Keyhost] Payment Confirmed! Booking {booking_ref} for {property_name} has been paid successfully{via_payment_method}. Guest: {guest_name}. Check-in: {check_in_date}.`;
      const hostTemplate = await getSettingValue('sms_template_booking_paid_host', defaultHostTemplate);
      let hostMsg = parseTemplate(hostTemplate, placeholders);
      
      // Auto-inject if template does not have {via_payment_method} and doesn't mention "via"
      if (viaPaymentMethod && !hostMsg.toLowerCase().includes('via')) {
        if (hostMsg.includes('paid successfully')) {
          hostMsg = hostMsg.replace('paid successfully', `paid successfully${viaPaymentMethod}`);
        } else {
          hostMsg = hostMsg.trim().replace(/\.$/, '') + `${viaPaymentMethod}.`;
        }
      }

      console.log(`[SMS] Sending Booking Paid to Host: ${hostMsg}`);
      await sendSMS({ to: hostPhone, message: hostMsg });
    }

    // 2. Send to Guest
    if (guestPhone) {
      const defaultGuestTemplate = `[Keyhost] Thank you {guest_name}! Payment of {amount}{via_payment_method} for booking {booking_ref} ({property_name}) was successful. Your stay is confirmed. Check-in: {check_in_date}.`;
      const guestTemplate = await getSettingValue('sms_template_booking_paid_guest', defaultGuestTemplate);
      let guestMsg = parseTemplate(guestTemplate, placeholders);
      
      // Auto-inject if template does not have {via_payment_method} and doesn't mention "via"
      if (viaPaymentMethod && !guestMsg.toLowerCase().includes('via')) {
        if (guestMsg.includes('was successful')) {
          guestMsg = guestMsg.replace('was successful', `was successful${viaPaymentMethod}`);
        } else {
          guestMsg = guestMsg.trim().replace(/\.$/, '') + ` (${methodRaw === 'sslcommerz' ? 'SSLCommerz' : methodRaw === 'bkash' ? 'bKash' : methodRaw === 'nagad' ? 'Nagad' : methodRaw} payment).`;
        }
      }

      console.log(`[SMS] Sending Booking Paid to Guest: ${guestMsg}`);
      await sendSMS({ to: guestPhone, message: guestMsg });
    }

    // ── Emails ────────────────────────────────────────────────
    const paymentMethodLabel = methodRaw
      ? (methodRaw === 'sslcommerz' ? 'SSLCommerz' : methodRaw === 'bkash' ? 'bKash' : methodRaw === 'nagad' ? 'Nagad' : methodRaw)
      : '';
    const checkOutStr = formatSmsDate(booking.check_out_date);

    const hostEmail = booking.owner_email;
    if (hostEmail) {
      await sendBookingPaidHostEmail({
        toEmail: hostEmail,
        hostName,
        guestName,
        propertyName: booking.host_property_name,
        bookingRef: booking.booking_reference,
        checkInDate: checkInStr,
        amount: amountStr,
        paymentMethod: paymentMethodLabel
      });
    }

    const guestEmail = booking.guest_email || booking.guest_user_email;
    if (guestEmail) {
      await sendBookingPaidGuestEmail({
        toEmail: guestEmail,
        guestName,
        propertyName: booking.property_title,
        bookingRef: booking.booking_reference,
        checkInDate: checkInStr,
        checkOutDate: checkOutStr,
        amount: amountStr,
        paymentMethod: paymentMethodLabel
      });
    }

    // ── Push Notifications ─────────────────────────────────────
    const frontendUrlPushPaid = process.env.FRONTEND_URL || 'http://localhost:3000';
    if (booking.host_user_id) {
      await sendPushToUser(booking.host_user_id, {
        title: '💰 Payment Received!',
        body: `${guestName} paid ${amountStr} for ${booking.host_property_name}. Check-in: ${checkInStr}`,
        url: `${frontendUrlPushPaid}/property-owner/bookings`,
        tag: `payment-received-${booking.booking_reference}`
      });
    }
    if (booking.guest_id) {
      await sendPushToUser(booking.guest_id, {
        title: '✅ Booking Confirmed!',
        body: `Your stay at ${booking.property_title} is confirmed. Check-in: ${checkInStr}`,
        url: `${frontendUrlPushPaid}/guest/bookings`,
        tag: `booking-confirmed-${booking.booking_reference}`
      });
    }
  } catch (error) {
    console.error('[SMS] sendBookingPaidSms error:', error);
  }
}

async function sendCheckoutSms(bookingId) {
  try {
    const booking = await getBookingDetailsForSms(bookingId);
    if (!booking) return;

    const guestPhone = booking.guest_phone || booking.guest_user_phone;
    if (!guestPhone) {
      console.warn(`[SMS] Guest phone not found for booking ${booking.booking_reference}`);
      return;
    }

    const guestName = booking.guest_name || [booking.guest_first_name, booking.guest_last_name].filter(Boolean).join(' ') || 'Guest';

    const defaultTemplate = `[Keyhost] Hi {guest_name}, thank you for choosing {property_name}. Your checkout for booking {booking_ref} is complete. We hope you had a wonderful stay!`;
    const template = await getSettingValue('sms_template_checkout_guest', defaultTemplate);

    const message = parseTemplate(template, {
      guest_name: guestName,
      property_name: booking.property_title,
      booking_ref: booking.booking_reference
    });

    console.log(`[SMS] Sending Checkout to Guest: ${message}`);
    await sendSMS({ to: guestPhone, message });

    // ── Email to Guest ─────────────────────────────────────────
    const guestEmail = booking.guest_email || booking.guest_user_email;
    if (guestEmail) {
      const frontendUrlForEmail = process.env.FRONTEND_URL || 'http://localhost:3000';
      await sendCheckoutEmail({
        toEmail: guestEmail,
        guestName,
        propertyName: booking.property_title,
        bookingRef: booking.booking_reference,
        reviewUrl: `${frontendUrlForEmail}/guest/bookings`
      });
    }

    // ── Push Notification to Guest ─────────────────────────────
    if (booking.guest_id) {
      const frontendUrlPushCheckout = process.env.FRONTEND_URL || 'http://localhost:3000';
      await sendPushToUser(booking.guest_id, {
        title: '👋 Thank You for Staying!',
        body: `Your checkout from ${booking.property_title} is complete. Hope to see you again!`,
        url: `${frontendUrlPushCheckout}/guest/bookings`,
        tag: `checkout-${booking.booking_reference}`
      });
    }
  } catch (error) {
    console.error('[SMS] sendCheckoutSms error:', error);
  }
}

async function sendRefundSms(bookingId, refundAmount, reason = '') {
  try {
    const booking = await getBookingDetailsForSms(bookingId);
    if (!booking) return;

    const hostPhone = booking.owner_phone;
    const guestPhone = booking.guest_phone || booking.guest_user_phone;
    const hostName = [booking.owner_first_name, booking.owner_last_name].filter(Boolean).join(' ') || 'Host';
    const guestName = booking.guest_name || [booking.guest_first_name, booking.guest_last_name].filter(Boolean).join(' ') || 'Guest';
    const amountStr = refundAmount ? `৳${refundAmount}` : (booking.total_amount ? `৳${booking.total_amount}` : '');

    const placeholders = {
      host_name: hostName,
      guest_name: guestName,
      property_name: booking.host_property_name,
      property_name_guest: booking.property_title,
      booking_ref: booking.booking_reference,
      amount: amountStr,
      reason: reason || 'Booking cancellation refund'
    };

    // 1. Send to Guest
    if (guestPhone) {
      const defaultGuestTemplate = `[Keyhost] Refund processed! Hi {guest_name}, a refund of {amount} for booking {booking_ref} at {property_name} has been credited. Reason: {reason}.`;
      const guestTemplate = await getSettingValue('sms_template_refund_guest', defaultGuestTemplate);
      const guestMsg = parseTemplate(guestTemplate, placeholders);
      console.log(`[SMS] Sending Refund to Guest: ${guestMsg}`);
      await sendSMS({ to: guestPhone, message: guestMsg });
    }

    // 2. Send to Host
    if (hostPhone) {
      const defaultHostTemplate = `[Keyhost] Refund Notification: A refund of {amount} for booking {booking_ref} at {property_name} has been processed. Reason: {reason}.`;
      const hostTemplate = await getSettingValue('sms_template_refund_host', defaultHostTemplate);
      const hostMsg = parseTemplate(hostTemplate, placeholders);
      console.log(`[SMS] Sending Refund to Host: ${hostMsg}`);
      await sendSMS({ to: hostPhone, message: hostMsg });
    }

    // ── Emails ────────────────────────────────────────────────
    const guestEmail = booking.guest_email || booking.guest_user_email;
    if (guestEmail) {
      await sendRefundGuestEmail({
        toEmail: guestEmail,
        guestName,
        propertyName: booking.property_title,
        bookingRef: booking.booking_reference,
        amount: amountStr,
        reason: reason || 'Booking cancellation refund'
      });
    }

    const hostEmail = booking.owner_email;
    if (hostEmail) {
      await sendRefundHostEmail({
        toEmail: hostEmail,
        hostName,
        guestName,
        propertyName: booking.host_property_name,
        bookingRef: booking.booking_reference,
        amount: amountStr,
        reason: reason || 'Booking cancellation refund'
      });
    }

    // ── Push Notifications ─────────────────────────────────────
    const frontendUrlPushRefund = process.env.FRONTEND_URL || 'http://localhost:3000';
    if (booking.guest_id) {
      await sendPushToUser(booking.guest_id, {
        title: '💸 Refund Initiated',
        body: `Refund of ${amountStr} for booking ${booking.booking_reference} has been processed.`,
        url: `${frontendUrlPushRefund}/guest/bookings`,
        tag: `refund-${booking.booking_reference}`
      });
    }
    if (booking.host_user_id) {
      await sendPushToUser(booking.host_user_id, {
        title: 'ℹ️ Refund Processed',
        body: `Refund of ${amountStr} for booking ${booking.booking_reference} at ${booking.host_property_name}.`,
        url: `${frontendUrlPushRefund}/property-owner/bookings`,
        tag: `refund-host-${booking.booking_reference}`
      });
    }
  } catch (error) {
    console.error('[SMS] sendRefundSms error:', error);
  }
}

module.exports = {
  sendSMS,
  sendBookingRequestSms,
  sendBookingAcceptedSms,
  sendBookingPaidSms,
  sendCheckoutSms,
  sendRefundSms
};

