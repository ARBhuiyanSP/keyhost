const { pool } = require('../config/database');

async function testApi() {
  const id = 3;
  try {
    const [tables] = await pool.query(`SHOW TABLES LIKE 'hms_invoices'`);
    let invoices = [];
    if (tables.length > 0) {
      const [rows] = await pool.query(
        'SELECT * FROM hms_invoices WHERE booking_id = ? ORDER BY created_at DESC',
        [id]
      );
      invoices = rows;
    }

    const [payments] = await pool.query(
      `SELECT id, payment_reference, payment_method, amount, cr_amount, dr_amount, 
              transaction_type, status, notes, payment_date, created_at
       FROM payments WHERE booking_id = ? AND status = 'completed' ORDER BY created_at ASC`,
      [id]
    );

    console.log('Payments count:', payments.length);

    const combinedInvoices = [...invoices];

    payments.forEach((pay, idx) => {
      const exists = invoices.some(inv => inv.invoice_number === pay.payment_reference);
      if (!exists) {
        combinedInvoices.push({
          id: `virtual-pay-${pay.id}`,
          booking_id: parseInt(id),
          invoice_number: pay.payment_reference || `PAY-${pay.id}`,
          invoice_type: idx === 0 ? 'booking_payment' : 'partial_payment',
          amount: parseFloat(pay.cr_amount || pay.amount || 0),
          notes: pay.notes || (idx === 0 ? 'Initial Booking Payment' : 'Payment Receipt'),
          created_at: pay.payment_date || pay.created_at,
          generated_at: pay.payment_date || pay.created_at,
          is_virtual: true
        });
      }
    });

    combinedInvoices.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
    
    console.log('Combined Invoices output:', JSON.stringify(combinedInvoices, null, 2));

  } catch (error) {
    console.error('Error:', error);
  } finally {
    await pool.end();
  }
}

testApi();
