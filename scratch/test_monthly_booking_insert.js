const { pool } = require('../backend/config/database');

async function main() {
  try {
    const property_id = 77;
    const guest_id = 89; // Global Soft Park
    const check_in_date = '2026-06-14';
    const check_out_date = '2026-07-14';
    const check_in_time = '15:00';
    const check_out_time = '11:00';
    const number_of_guests = 1;
    const number_of_children = 0;
    const number_of_infants = 0;
    const special_requests = 'Test Monthly Booking';
    const coupon_code = null;
    const custom_price = null;
    const booking_type = 'monthly';

    // Get property details
    const [properties] = await pool.execute(`
      SELECT 
        p.*, 
        po.id as owner_id,
        po.user_id as owner_user_id
      FROM properties p
      JOIN property_owners po ON p.owner_id = po.id
      WHERE p.id = ? AND p.status = 'active'
    `, [property_id]);

    const property = properties[0];
    const nights = Math.ceil((new Date(check_out_date) - new Date(check_in_date)) / (1000 * 60 * 60 * 24));
    const isMonthly = booking_type === 'monthly';

    console.log(`Property Title: ${property.title}`);
    console.log(`Nights: ${nights}`);
    console.log(`Is Monthly: ${isMonthly}`);

    // Calculate pricing
    let pricing, finalTotal, totalDiscount = 0, discountAmount = 0, hostDiscount = 0;
    let monthsCount = null, extraDays = null, monthlyRateUsed = null, advanceAmount = null;
    let cleaningFee = 0;
    let securityDeposit = 0;
    let extraGuestFee = 0;
    let serviceFee = 0;
    let taxAmount = 0;

    if (isMonthly) {
      const monthlyRate = parseFloat(property.monthly_rent_amount);
      monthsCount = Math.floor(nights / 30);
      extraDays = nights % 30;
      monthlyRateUsed = monthlyRate;

      const monthlySubtotal = monthsCount * monthlyRate;
      const proratedAmount = extraDays * (monthlyRate / 30);
      securityDeposit = parseFloat(property.monthly_security_deposit) || 0;
      advanceAmount = parseFloat(property.monthly_advance_amount) || 0;

      finalTotal = monthlySubtotal + proratedAmount + securityDeposit;
      totalDiscount = 0;

      pricing = {
        basePrice: monthlyRate,
        nights,
        monthsCount,
        extraDays,
        monthlySubtotal,
        proratedAmount,
        monthlySecurityDeposit: securityDeposit,
        total: finalTotal
      };
    }

    console.log('Calculated Pricing:', pricing);
    console.log(`Final Total: ${finalTotal}`);
    console.log(`Advance Amount: ${advanceAmount}`);
    console.log(`Security Deposit: ${securityDeposit}`);

    // Generate booking reference
    const bookingReference = 'KH-TEST-MONTHLY';

    // Get commission rate
    const commissionRate = 10.00;
    const commissionAmount = (Math.max(0, finalTotal - securityDeposit) * commissionRate) / 100;
    const propertyOwnerEarnings = Math.max(0, finalTotal - securityDeposit - commissionAmount);

    const initialStatus = 'pending';
    const paymentTimeLimitMinutes = 15;

    // Check if we can run a transaction or insert a mock booking (then rollback or delete)
    const connection = await pool.getConnection();
    await connection.beginTransaction();

    try {
      const [result] = await connection.execute(`
        INSERT INTO bookings (
          booking_reference, guest_id, property_id, hms_room_id,
          check_in_date, check_out_date, check_in_time, check_out_time,
          number_of_guests, number_of_children, number_of_infants,
          base_price, cleaning_fee, security_deposit, extra_guest_fee,
          service_fee, tax_amount, admin_commission_rate, admin_commission_amount, property_owner_earnings,
          total_amount, currency, status, payment_status,
          special_requests, coupon_code, discount_amount,
          booking_source, guest_name, guest_email, guest_phone,
          confirmed_at, payment_deadline,
          booking_type, months_count, extra_days, monthly_rate_used, advance_amount,
          is_non_refundable, booking_date, created_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW(), NOW())
      `, [
        bookingReference, guest_id, property_id, null,
        check_in_date, check_out_date, check_in_time || '15:00', check_out_time || '11:00',
        number_of_guests, number_of_children, number_of_infants,
        isMonthly ? (property.monthly_rent_amount || 0) : 0,
        cleaningFee, securityDeposit, extraGuestFee,
        serviceFee, taxAmount, commissionRate, commissionAmount, propertyOwnerEarnings,
        finalTotal, property.currency || 'BDT', initialStatus, 'pending',
        special_requests || null, coupon_code || null, totalDiscount,
        'website', 'Test Guest', 'test@example.com', '01700000000',
        null,
        new Date(Date.now() + paymentTimeLimitMinutes * 60 * 1000),
        booking_type,
        monthsCount, extraDays, monthlyRateUsed, advanceAmount,
        property.is_non_refundable || false
      ]);

      const insertId = result.insertId;
      console.log(`Inserted booking ID: ${insertId}`);

      // Verify the row
      const [rows] = await connection.execute('SELECT * FROM bookings WHERE id = ?', [insertId]);
      console.log('Saved Database Row:', JSON.stringify(rows[0], null, 2));

      // Rollback transaction so we don't pollute database
      await connection.rollback();
      console.log('Transaction rolled back successfully!');
    } catch (err) {
      await connection.rollback();
      throw err;
    } finally {
      connection.release();
    }

    process.exit(0);
  } catch (error) {
    console.error(error);
    process.exit(1);
  }
}

main();
