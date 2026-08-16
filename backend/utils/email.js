const nodemailer = require('nodemailer');
const { pool } = require('../config/database');

// ─────────────────────────────────────────────
// Core sendEmail — sends a plain/html email
// ─────────────────────────────────────────────
const sendEmail = async (options) => {
    try {
        const [settings] = await pool.execute(
            `SELECT setting_key, setting_value FROM system_settings WHERE setting_key IN (
        'smtp_host', 'smtp_port', 'smtp_encryption', 'smtp_username', 'smtp_password', 'mail_from_address', 'mail_from_name'
      )`
        );

        const config = {};
        settings.forEach(s => {
            config[s.setting_key] = s.setting_value;
        });

        const host = config.smtp_host || 'smtp.gmail.com';
        const port = config.smtp_port ? parseInt(config.smtp_port) : 465;
        const secure = config.smtp_encryption === 'ssl' || port === 465;

        const user = config.smtp_username || 'arbhuiyan.pits@gmail.com';
        const pass = config.smtp_password || 'zgnd avpj klry ygpt';

        const fromAddress = config.mail_from_address || user;
        const fromName = config.mail_from_name || 'Keyhost Homes';

        const transporter = nodemailer.createTransport({
            host,
            port,
            secure,
            auth: { user, pass }
        });

        const mailOptions = {
            from: `"${fromName}" <${fromAddress}>`,
            to: options.email,
            subject: options.subject,
            text: options.message,
            html: options.htmlMessage || options.message
        };

        await transporter.sendMail(mailOptions);
        console.log('✉️ Email sent successfully to', options.email);
        return true;
    } catch (error) {
        console.error('❌ Email sending failed:', error.message || error);
        throw error;
    }
};

// ─────────────────────────────────────────────
// HTML Email Base Template (branded wrapper)
// ─────────────────────────────────────────────
function buildEmailHtml({ title, greeting, bodyHtml, footerNote = '' }) {
    return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
  <title>${title}</title>
</head>
<body style="margin:0;padding:0;background:#f4f6f9;font-family:'Segoe UI',Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f4f6f9;padding:32px 0;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;background:#ffffff;border-radius:12px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,0.07);">

          <!-- Header -->
          <tr>
            <td style="background:#004e59;padding:28px 32px;text-align:center;">
              <h1 style="margin:0;color:#ffffff;font-size:22px;font-weight:800;letter-spacing:1px;">🏠 Keyhost Homes</h1>
              <p style="margin:6px 0 0;color:#a8d8dc;font-size:13px;letter-spacing:0.5px;">Smart Property Management</p>
            </td>
          </tr>

          <!-- Body -->
          <tr>
            <td style="padding:32px 36px;">
              <p style="margin:0 0 16px;font-size:16px;color:#1a2933;font-weight:600;">${greeting}</p>
              ${bodyHtml}
              ${footerNote ? `<p style="margin:24px 0 0;font-size:13px;color:#7a8b96;border-top:1px solid #eef0f3;padding-top:18px;">${footerNote}</p>` : ''}
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="background:#f8fafb;padding:20px 36px;text-align:center;border-top:1px solid #eef0f3;">
              <p style="margin:0;font-size:12px;color:#9aa5ae;">
                This is an automated email from <strong>Keyhost Homes</strong>. Please do not reply to this email.<br/>
                For support, visit your dashboard or contact us through the app.
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}

// Shared info-row builder for booking detail tables
function infoRow(label, value) {
    return `
  <tr>
    <td style="padding:8px 12px;font-size:13px;color:#5a6a74;font-weight:600;background:#f8fafb;border-radius:6px;width:40%;">${label}</td>
    <td style="padding:8px 12px;font-size:13px;color:#1a2933;font-weight:700;">${value}</td>
  </tr>`;
}

function bookingTable(rows) {
    return `
  <table width="100%" cellpadding="0" cellspacing="6" style="margin:16px 0;border-collapse:separate;border-spacing:0 6px;">
    ${rows}
  </table>`;
}

function ctaButton(label, url) {
    return `
  <div style="text-align:center;margin:28px 0 8px;">
    <a href="${url}" style="display:inline-block;background:#004e59;color:#ffffff;font-size:14px;font-weight:700;padding:14px 32px;border-radius:8px;text-decoration:none;letter-spacing:0.3px;">${label}</a>
  </div>`;
}

function alertBox(text, color = '#e8f5e9', borderColor = '#2e7d32', textColor = '#1b5e20') {
    return `
  <div style="background:${color};border-left:4px solid ${borderColor};border-radius:6px;padding:14px 18px;margin:18px 0;">
    <p style="margin:0;font-size:14px;color:${textColor};font-weight:600;">${text}</p>
  </div>`;
}


// ─────────────────────────────────────────────
// 1. Booking Request — to HOST
// ─────────────────────────────────────────────
async function sendBookingRequestEmail({ toEmail, hostName, guestName, propertyName, bookingRef, checkInDate, bookingUrl }) {
    if (!toEmail) return;
    try {
        const subject = `New Booking Request – ${bookingRef} | ${propertyName}`;
        const bodyHtml = `
      <p style="margin:0 0 12px;font-size:14px;color:#3d4f5c;line-height:1.6;">
        You have received a new booking request. Please review and respond as soon as possible.
      </p>
      ${bookingTable(
            infoRow('Booking Ref', bookingRef) +
            infoRow('Guest', guestName) +
            infoRow('Property', propertyName) +
            infoRow('Check-in Date', checkInDate)
        )}
      ${alertBox('⏳ Action Required: Please accept or reject this booking request.', '#fff8e1', '#f9a825', '#5d4037')}
      ${ctaButton('📋 Review Booking Request', bookingUrl)}
    `;
        const htmlMessage = buildEmailHtml({
            title: `New Booking Request – ${bookingRef}`,
            greeting: `Hello ${hostName},`,
            bodyHtml,
            footerNote: 'If you did not expect this request, you can log in to your dashboard to review it.'
        });

        await sendEmail({ email: toEmail, subject, message: `New booking request ${bookingRef} from ${guestName}. Check-in: ${checkInDate}. Review: ${bookingUrl}`, htmlMessage });
        console.log(`✉️ [Email] Booking request sent to host: ${toEmail}`);
    } catch (err) {
        console.error('[Email] sendBookingRequestEmail error:', err.message || err);
    }
}


// ─────────────────────────────────────────────
// 2. Booking Accepted — to GUEST
// ─────────────────────────────────────────────
async function sendBookingAcceptedEmail({ toEmail, guestName, propertyName, bookingRef, checkInDate, amount, deadline, paymentUrl }) {
    if (!toEmail) return;
    try {
        const subject = `Your Booking is Accepted! Pay to Confirm – ${bookingRef}`;
        const bodyHtml = `
      <p style="margin:0 0 12px;font-size:14px;color:#3d4f5c;line-height:1.6;">
        Great news! The host has accepted your booking request. Please complete your payment to confirm your stay.
      </p>
      ${bookingTable(
            infoRow('Booking Ref', bookingRef) +
            infoRow('Property', propertyName) +
            infoRow('Check-in Date', checkInDate) +
            infoRow('Amount Due', amount) +
            infoRow('Pay Before', deadline)
        )}
      ${alertBox('⚠️ Please pay before the deadline to secure your booking. Unpaid bookings will be cancelled automatically.', '#fff3e0', '#e65100', '#bf360c')}
      ${paymentUrl ? ctaButton('💳 Pay Now & Confirm Booking', paymentUrl) : ''}
    `;
        const htmlMessage = buildEmailHtml({
            title: `Booking Accepted – ${bookingRef}`,
            greeting: `Hello ${guestName},`,
            bodyHtml,
            footerNote: 'If you have any issues with payment, please contact the host via your messages.'
        });

        await sendEmail({ email: toEmail, subject, message: `Your booking ${bookingRef} at ${propertyName} has been accepted. Please pay ${amount} before ${deadline} to confirm.`, htmlMessage });
        console.log(`✉️ [Email] Booking accepted sent to guest: ${toEmail}`);
    } catch (err) {
        console.error('[Email] sendBookingAcceptedEmail error:', err.message || err);
    }
}


// ─────────────────────────────────────────────
// 3a. Payment Confirmed — to HOST
// ─────────────────────────────────────────────
async function sendBookingPaidHostEmail({ toEmail, hostName, guestName, propertyName, bookingRef, checkInDate, amount, paymentMethod, transactionId }) {
    if (!toEmail) return;
    try {
        const subject = `Payment Received – ${bookingRef} | ${propertyName}`;
        const bodyHtml = `
      <p style="margin:0 0 12px;font-size:14px;color:#3d4f5c;line-height:1.6;">
        Payment has been received and the booking is now confirmed. Please prepare for the guest's arrival.
      </p>
      ${bookingTable(
            infoRow('Booking Ref', bookingRef) +
            infoRow('Guest', guestName) +
            infoRow('Property', propertyName) +
            infoRow('Check-in Date', checkInDate) +
            infoRow('Amount Paid', amount) +
            (paymentMethod ? infoRow('Payment Method', paymentMethod) : '') +
            (transactionId ? infoRow('Transaction ID', transactionId) : '')
        )}
      ${alertBox('✅ Booking is fully confirmed. The guest is expecting their check-in.', '#e8f5e9', '#2e7d32', '#1b5e20')}
    `;
        const htmlMessage = buildEmailHtml({
            title: `Payment Received – ${bookingRef}`,
            greeting: `Hello ${hostName},`,
            bodyHtml
        });

        await sendEmail({ email: toEmail, subject, message: `Payment confirmed for booking ${bookingRef}. Guest: ${guestName}. Amount: ${amount}. Check-in: ${checkInDate}.${transactionId ? ` TrxID: ${transactionId}` : ''}`, htmlMessage });
        console.log(`✉️ [Email] Payment confirmed sent to host: ${toEmail} (TrxID: ${transactionId || 'N/A'})`);
    } catch (err) {
        console.error('[Email] sendBookingPaidHostEmail error:', err.message || err);
    }
}


// ─────────────────────────────────────────────
// 3b. Payment Confirmed — to GUEST
// ─────────────────────────────────────────────
async function sendBookingPaidGuestEmail({ toEmail, guestName, propertyName, bookingRef, checkInDate, checkOutDate, amount, paymentMethod, transactionId }) {
    if (!toEmail) return;
    try {
        const subject = `Booking Confirmed! – ${bookingRef} | ${propertyName}`;
        const bodyHtml = `
      <p style="margin:0 0 12px;font-size:14px;color:#3d4f5c;line-height:1.6;">
        Your payment was successful and your booking is now confirmed. We look forward to welcoming you!
      </p>
      ${bookingTable(
            infoRow('Booking Ref', bookingRef) +
            infoRow('Property', propertyName) +
            infoRow('Check-in', checkInDate) +
            (checkOutDate ? infoRow('Check-out', checkOutDate) : '') +
            infoRow('Amount Paid', amount) +
            (paymentMethod ? infoRow('Payment Method', paymentMethod) : '') +
            (transactionId ? infoRow('Transaction ID', transactionId) : '')
        )}
      ${alertBox('🎉 Your stay is confirmed! Please save your booking reference for check-in.', '#e8f5e9', '#2e7d32', '#1b5e20')}
    `;
        const htmlMessage = buildEmailHtml({
            title: `Booking Confirmed – ${bookingRef}`,
            greeting: `Hello ${guestName},`,
            bodyHtml,
            footerNote: 'If you have any questions before your stay, please contact the host through your messages dashboard.'
        });

        await sendEmail({ email: toEmail, subject, message: `Your booking ${bookingRef} at ${propertyName} is confirmed. Amount paid: ${amount}. Check-in: ${checkInDate}.${transactionId ? ` TrxID: ${transactionId}` : ''}`, htmlMessage });
        console.log(`✉️ [Email] Payment confirmed sent to guest: ${toEmail} (TrxID: ${transactionId || 'N/A'})`);
    } catch (err) {
        console.error('[Email] sendBookingPaidGuestEmail error:', err.message || err);
    }
}


// ─────────────────────────────────────────────
// 4. Checkout Complete — to GUEST
// ─────────────────────────────────────────────
async function sendCheckoutEmail({ toEmail, guestName, propertyName, bookingRef, reviewUrl }) {
    if (!toEmail) return;
    try {
        const subject = `Thank You for Staying at ${propertyName}! – ${bookingRef}`;
        const bodyHtml = `
      <p style="margin:0 0 12px;font-size:14px;color:#3d4f5c;line-height:1.6;">
        Thank you for choosing <strong>${propertyName}</strong>. We hope you had a wonderful experience and we'd love to have you again!
      </p>
      ${bookingTable(infoRow('Booking Ref', bookingRef) + infoRow('Property', propertyName))}
      <p style="margin:16px 0 8px;font-size:14px;color:#3d4f5c;line-height:1.6;">
        Your feedback helps us improve. Would you like to leave a review for your stay?
      </p>
      ${reviewUrl ? ctaButton('⭐ Leave a Review', reviewUrl) : ''}
    `;
        const htmlMessage = buildEmailHtml({
            title: `Checkout Complete – ${bookingRef}`,
            greeting: `Hello ${guestName},`,
            bodyHtml,
            footerNote: 'We hope to see you again soon at Keyhost Homes!'
        });

        await sendEmail({ email: toEmail, subject, message: `Thank you for staying at ${propertyName} (Booking: ${bookingRef}). We hope you had a great stay!`, htmlMessage });
        console.log(`✉️ [Email] Checkout email sent to guest: ${toEmail}`);
    } catch (err) {
        console.error('[Email] sendCheckoutEmail error:', err.message || err);
    }
}


// ─────────────────────────────────────────────
// 5a. Refund Processed — to GUEST
// ─────────────────────────────────────────────
async function sendRefundGuestEmail({ toEmail, guestName, propertyName, bookingRef, amount, reason }) {
    if (!toEmail) return;
    try {
        const subject = `Your Refund is On the Way – ${bookingRef}`;
        const bodyHtml = `
      <p style="margin:0 0 12px;font-size:14px;color:#3d4f5c;line-height:1.6;">
        A refund has been processed for your booking. Please allow a few business days for the amount to reflect in your account.
      </p>
      ${bookingTable(
            infoRow('Booking Ref', bookingRef) +
            infoRow('Property', propertyName) +
            infoRow('Refund Amount', amount) +
            infoRow('Reason', reason)
        )}
      ${alertBox('💸 Your refund has been initiated. Processing time may vary depending on your payment method.', '#e3f2fd', '#1565c0', '#0d47a1')}
    `;
        const htmlMessage = buildEmailHtml({
            title: `Refund Processed – ${bookingRef}`,
            greeting: `Hello ${guestName},`,
            bodyHtml,
            footerNote: 'If you have not received your refund within 5 business days, please contact our support team.'
        });

        await sendEmail({ email: toEmail, subject, message: `Refund of ${amount} processed for booking ${bookingRef} at ${propertyName}. Reason: ${reason}.`, htmlMessage });
        console.log(`✉️ [Email] Refund email sent to guest: ${toEmail}`);
    } catch (err) {
        console.error('[Email] sendRefundGuestEmail error:', err.message || err);
    }
}


// ─────────────────────────────────────────────
// 5b. Refund Processed — to HOST
// ─────────────────────────────────────────────
async function sendRefundHostEmail({ toEmail, hostName, guestName, propertyName, bookingRef, amount, reason }) {
    if (!toEmail) return;
    try {
        const subject = `Refund Processed – ${bookingRef} | ${propertyName}`;
        const bodyHtml = `
      <p style="margin:0 0 12px;font-size:14px;color:#3d4f5c;line-height:1.6;">
        A refund has been processed for the following booking at your property.
      </p>
      ${bookingTable(
            infoRow('Booking Ref', bookingRef) +
            infoRow('Guest', guestName) +
            infoRow('Property', propertyName) +
            infoRow('Refund Amount', amount) +
            infoRow('Reason', reason)
        )}
      ${alertBox('ℹ️ This refund notification is for your records. No action is required on your part.', '#f3f4f6', '#6b7280', '#374151')}
    `;
        const htmlMessage = buildEmailHtml({
            title: `Refund Processed – ${bookingRef}`,
            greeting: `Hello ${hostName},`,
            bodyHtml
        });

        await sendEmail({ email: toEmail, subject, message: `Refund of ${amount} processed for booking ${bookingRef}. Guest: ${guestName}. Reason: ${reason}.`, htmlMessage });
        console.log(`✉️ [Email] Refund email sent to host: ${toEmail}`);
    } catch (err) {
        console.error('[Email] sendRefundHostEmail error:', err.message || err);
    }
}


module.exports = {
    sendEmail,
    sendBookingRequestEmail,
    sendBookingAcceptedEmail,
    sendBookingPaidHostEmail,
    sendBookingPaidGuestEmail,
    sendCheckoutEmail,
    sendRefundGuestEmail,
    sendRefundHostEmail
};
