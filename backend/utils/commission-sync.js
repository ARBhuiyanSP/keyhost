/**
 * commission-sync.js
 * Recalculates commission for a booking after each payment completes.
 * Rule: Online bookings (have admin_earnings) -> commission = rate% of total paid.
 * HMS walk-in bookings (no admin_earnings) -> commission = 0.
 * Cash payments -> gateway_fee = 0 (already stored correctly).
 */
const { pool } = require('../config/database');

async function syncCommissionForBooking(bookingId) {
  try {
    const [aeRows] = await pool.execute(
      `SELECT ae.id, ae.commission_rate FROM admin_earnings ae WHERE ae.booking_id = ? AND ae.status = 'active' LIMIT 1`,
      [bookingId]
    );
    if (aeRows.length === 0) return; // HMS walk-in, no commission

    const [payRows] = await pool.execute(
      `SELECT COALESCE(SUM(cr_amount), 0) as total_paid FROM payments WHERE booking_id = ? AND status = 'completed' AND transaction_type IN ('guest_payment', 'payment') AND cr_amount > 0`,
      [bookingId]
    );
    const totalPaid = parseFloat(payRows[0].total_paid || 0);
    const commissionRate = parseFloat(aeRows[0].commission_rate || 10);
    const newCommission = Math.round(totalPaid * commissionRate / 100 * 100) / 100;
    const newOwnerEarnings = Math.round((totalPaid - newCommission) * 100) / 100;

    await pool.execute(
      `UPDATE bookings SET admin_commission_amount = ?, property_owner_earnings = ?, updated_at = NOW() WHERE id = ?`,
      [newCommission, newOwnerEarnings, bookingId]
    );
    await pool.execute(
      `UPDATE admin_earnings SET commission_amount = ?, net_commission = ?, booking_total = ?, updated_at = NOW() WHERE booking_id = ? AND status = 'active'`,
      [newCommission, newCommission, totalPaid, bookingId]
    );
    console.log(`Commission synced for booking ${bookingId}: total_paid=${totalPaid}, commission=${newCommission}`);
  } catch (err) {
    console.error(`Commission sync failed for booking ${bookingId}:`, err.message);
  }
}

module.exports = { syncCommissionForBooking };
