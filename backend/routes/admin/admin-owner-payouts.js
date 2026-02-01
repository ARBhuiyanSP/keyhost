const express = require('express');
const { pool } = require('../../config/database');
const { formatResponse, generatePagination } = require('../../utils/helpers');
const { validatePagination } = require('../../middleware/validation');

const router = express.Router();

// =============================================
// GET OWNER BALANCES SUMMARY
// =============================================
router.get('/balances', async (req, res) => {
  try {
    const { owner_id } = req.query;

    let whereClause = '';
    const queryParams = [];

    if (owner_id) {
      whereClause = 'WHERE ob.property_owner_id = ?';
      queryParams.push(owner_id);
    }

    const [balances] = await pool.execute(`
      SELECT 
        ob.*,
        po.business_name,
        u.first_name,
        u.last_name,
        u.email,
        COUNT(p.id) as total_properties
      FROM owner_balances ob
      JOIN property_owners po ON ob.property_owner_id = po.id
      JOIN users u ON po.user_id = u.id
      LEFT JOIN properties p ON po.id = p.owner_id AND p.status = 'active'
      ${whereClause}
      GROUP BY ob.id
      ORDER BY ob.current_balance DESC
    `, queryParams);

    res.json(formatResponse(true, 'Owner balances retrieved successfully', {
      balances
    }));

  } catch (error) {
    console.error('Get owner balances error:', error);
    res.status(500).json(
      formatResponse(false, 'Failed to retrieve owner balances', null, error.message)
    );
  }
});

// =============================================
// GET OWNER BALANCE DETAILS
// =============================================
router.get('/balances/:ownerId', async (req, res) => {
  try {
    const { ownerId } = req.params;

    // Get balance summary
    const [balanceRows] = await pool.execute(`
      SELECT 
        ob.*,
        po.business_name,
        u.first_name,
        u.last_name,
        u.email
      FROM owner_balances ob
      JOIN property_owners po ON ob.property_owner_id = po.id
      JOIN users u ON po.user_id = u.id
      WHERE ob.property_owner_id = ?
    `, [ownerId]);

    if (balanceRows.length === 0) {
      return res.status(404).json(
        formatResponse(false, 'Owner balance not found')
      );
    }

    // Get recent earnings breakdown
    const [earningsBreakdown] = await pool.execute(`
      SELECT 
        b.id as booking_id,
        b.booking_reference,
        b.total_amount,
        b.property_owner_earnings,
        ae.commission_amount,
        ae.payment_status as commission_status,
        b.payment_status as booking_payment_status,
        b.created_at,
        p.title as property_title
      FROM bookings b
      JOIN properties p ON b.property_id = p.id
      LEFT JOIN admin_earnings ae ON b.id = ae.booking_id
      WHERE p.owner_id = ? AND b.payment_status = 'paid'
      ORDER BY b.created_at DESC
      LIMIT 20
    `, [ownerId]);

    // Get recent payouts
    const [recentPayouts] = await pool.execute(`
      SELECT 
        op.*,
        COUNT(opi.id) as items_count
      FROM owner_payouts op
      LEFT JOIN owner_payout_items opi ON op.id = opi.payout_id
      WHERE op.property_owner_id = ?
      GROUP BY op.id
      ORDER BY op.created_at DESC
      LIMIT 10
    `, [ownerId]);

    res.json(formatResponse(true, 'Owner balance details retrieved successfully', {
      balance: balanceRows[0],
      earningsBreakdown,
      recentPayouts
    }));

  } catch (error) {
    console.error('Get owner balance details error:', error);
    res.status(500).json(
      formatResponse(false, 'Failed to retrieve owner balance details', null, error.message)
    );
  }
});

// =============================================
// CREATE OWNER PAYOUT
// =============================================
router.post('/payouts', async (req, res) => {
  try {
    const {
      property_owner_id,
      start_date,
      end_date,
      payment_method,
      bank_name,
      account_number,
      routing_number,
      mobile_number,
      notes
    } = req.body;

    if (!property_owner_id || !start_date || !end_date || !payment_method) {
      return res.status(400).json(
        formatResponse(false, 'Property owner ID, start date, end date, and payment method are required')
      );
    }

    // Get eligible bookings for payout
    const [eligibleBookings] = await pool.execute(`
      SELECT 
        b.id as booking_id,
        b.booking_reference,
        b.total_amount,
        b.property_owner_earnings,
        ae.commission_amount,
        ae.payment_status as commission_status
      FROM bookings b
      JOIN properties p ON b.property_id = p.id
      LEFT JOIN admin_earnings ae ON b.id = ae.booking_id
      WHERE p.owner_id = ? 
        AND b.payment_status = 'paid'
        AND DATE(b.created_at) BETWEEN ? AND ?
        AND b.id NOT IN (
          SELECT booking_id FROM owner_payout_items opi
          JOIN owner_payouts op ON opi.payout_id = op.id
          WHERE op.property_owner_id = ? AND op.payment_status != 'failed'
        )
    `, [property_owner_id, start_date, end_date, property_owner_id]);

    if (eligibleBookings.length === 0) {
      return res.status(400).json(
        formatResponse(false, 'No eligible bookings found for the specified period')
      );
    }

    // Calculate totals
    const totalEarnings = eligibleBookings.reduce((sum, booking) => sum + parseFloat(booking.property_owner_earnings), 0);
    const totalCommissionPaid = eligibleBookings.reduce((sum, booking) => 
      sum + (booking.commission_status === 'paid' ? parseFloat(booking.commission_amount) : 0), 0);
    const netPayout = totalEarnings - totalCommissionPaid;

    if (netPayout <= 0) {
      return res.status(400).json(
        formatResponse(false, 'No payout amount available (earnings minus commission paid)')
      );
    }

    // Generate payout reference
    const payout_reference = `PAYOUT-${Date.now()}-${property_owner_id}`;

    // Create payout record
    const [payoutResult] = await pool.execute(`
      INSERT INTO owner_payouts (
        property_owner_id, payout_reference, start_date, end_date,
        total_earnings, total_commission_paid, net_payout,
        payment_method, bank_name, account_number, routing_number, mobile_number, notes
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `, [
      property_owner_id, payout_reference, start_date, end_date,
      totalEarnings, totalCommissionPaid, netPayout,
      payment_method, bank_name || null, account_number || null, routing_number || null, mobile_number || null, notes || null
    ]);

    const payoutId = payoutResult.insertId;

    // Create payout items
    for (const booking of eligibleBookings) {
      await pool.execute(`
        INSERT INTO owner_payout_items (
          payout_id, booking_id, booking_total, admin_commission, owner_earnings, commission_paid_to_admin
        ) VALUES (?, ?, ?, ?, ?, ?)
      `, [
        payoutId, booking.booking_id, booking.total_amount, booking.commission_amount,
        booking.property_owner_earnings, booking.commission_status === 'paid'
      ]);
    }

    // Update owner balance
    await pool.execute(`
      UPDATE owner_balances 
      SET total_payouts = total_payouts + ?,
          current_balance = current_balance - ?,
          last_updated = NOW()
      WHERE property_owner_id = ?
    `, [netPayout, netPayout, property_owner_id]);

    res.status(201).json(formatResponse(true, 'Owner payout created successfully', {
      payout_id: payoutId,
      payout_reference,
      total_earnings: totalEarnings,
      total_commission_paid: totalCommissionPaid,
      net_payout: netPayout,
      items_count: eligibleBookings.length
    }));

  } catch (error) {
    console.error('Create owner payout error:', error);
    res.status(500).json(
      formatResponse(false, 'Failed to create owner payout', null, error.message)
    );
  }
});

// =============================================
// GET OWNER PAYOUTS
// =============================================
router.get('/payouts', validatePagination, async (req, res) => {
  try {
    const { page = 1, limit = 20, owner_id, payment_status } = req.query;
    const offset = (page - 1) * limit;

    let whereConditions = [];
    const queryParams = [];

    if (owner_id) {
      whereConditions.push('op.property_owner_id = ?');
      queryParams.push(owner_id);
    }

    if (payment_status) {
      whereConditions.push('op.payment_status = ?');
      queryParams.push(payment_status);
    }

    const whereClause = whereConditions.length > 0 ? `WHERE ${whereConditions.join(' AND ')}` : '';

    const [payouts] = await pool.execute(`
      SELECT 
        op.*,
        po.business_name,
        u.first_name,
        u.last_name,
        COUNT(opi.id) as items_count
      FROM owner_payouts op
      JOIN property_owners po ON op.property_owner_id = po.id
      JOIN users u ON po.user_id = u.id
      LEFT JOIN owner_payout_items opi ON op.id = opi.payout_id
      ${whereClause}
      GROUP BY op.id
      ORDER BY op.created_at DESC
      LIMIT ? OFFSET ?
    `, [...queryParams, parseInt(limit), parseInt(offset)]);

    const [countResult] = await pool.execute(`
      SELECT COUNT(*) as total
      FROM owner_payouts op
      ${whereClause}
    `, queryParams);

    const total = countResult[0].total;
    const pagination = generatePagination(page, limit, total);

    res.json(formatResponse(true, 'Owner payouts retrieved successfully', {
      payouts,
      pagination
    }));

  } catch (error) {
    console.error('Get owner payouts error:', error);
    res.status(500).json(
      formatResponse(false, 'Failed to retrieve owner payouts', null, error.message)
    );
  }
});

// =============================================
// UPDATE PAYOUT STATUS
// =============================================
router.patch('/payouts/:id/status', async (req, res) => {
  try {
    const { id } = req.params;
    const { payment_status, payment_reference, notes } = req.body;

    if (!payment_status || !['pending', 'processing', 'completed', 'failed'].includes(payment_status)) {
      return res.status(400).json(
        formatResponse(false, 'Invalid payment status')
      );
    }

    const updateData = {
      payment_status,
      updated_at: new Date()
    };

    if (payment_reference) updateData.payment_reference = payment_reference;
    if (notes) updateData.notes = notes;
    if (payment_status === 'completed') updateData.payment_date = new Date();

    const [result] = await pool.execute(`
      UPDATE owner_payouts 
      SET payment_status = ?, payment_reference = ?, payment_date = ?, notes = ?, updated_at = ?
      WHERE id = ?
    `, [
      updateData.payment_status,
      updateData.payment_reference || null,
      updateData.payment_date || null,
      updateData.notes || null,
      updateData.updated_at,
      id
    ]);

    if (result.affectedRows === 0) {
      return res.status(404).json(
        formatResponse(false, 'Payout not found')
      );
    }

    res.json(formatResponse(true, 'Payout status updated successfully'));

  } catch (error) {
    console.error('Update payout status error:', error);
    res.status(500).json(
      formatResponse(false, 'Failed to update payout status', null, error.message)
    );
  }
});

// =============================================
// GET PAYOUT DETAILS
// =============================================
router.get('/payouts/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const [payoutRows] = await pool.execute(`
      SELECT 
        op.*,
        po.business_name,
        u.first_name,
        u.last_name,
        u.email
      FROM owner_payouts op
      JOIN property_owners po ON op.property_owner_id = po.id
      JOIN users u ON po.user_id = u.id
      WHERE op.id = ?
    `, [id]);

    if (payoutRows.length === 0) {
      return res.status(404).json(
        formatResponse(false, 'Payout not found')
      );
    }

    const [items] = await pool.execute(`
      SELECT 
        opi.*,
        b.booking_reference,
        b.guest_name,
        p.title as property_title
      FROM owner_payout_items opi
      JOIN bookings b ON opi.booking_id = b.id
      JOIN properties p ON b.property_id = p.id
      WHERE opi.payout_id = ?
      ORDER BY opi.created_at ASC
    `, [id]);

    res.json(formatResponse(true, 'Payout details retrieved successfully', {
      payout: payoutRows[0],
      items
    }));

  } catch (error) {
    console.error('Get payout details error:', error);
    res.status(500).json(
      formatResponse(false, 'Failed to retrieve payout details', null, error.message)
    );
  }
});

module.exports = router;

