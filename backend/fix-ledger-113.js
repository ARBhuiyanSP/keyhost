const { pool } = require('./config/database');

async function fixLedger() {
  try {
    console.log('Fixing ledger for booking 113...');
    
    // Check if it already exists to avoid duplicates
    const [exists] = await pool.execute(
      "SELECT id FROM payments WHERE booking_id = 113 AND transaction_type = 'owner_accepted' AND dr_amount > 0"
    );
    
    if (exists.length > 0) {
      console.log('DR entry already exists for booking 113.');
      return;
    }

    const [res] = await pool.execute(`
      INSERT INTO payments (
        booking_id, payment_reference, payment_type, transaction_type, 
        amount, dr_amount, cr_amount, status, notes, created_at, updated_at
      ) VALUES (
        113, 'SYS-LEDGER-FIX-113', 'booking', 'owner_accepted', 
        3500.00, 3500.00, 0.00, 'completed', 
        'System auto-fix: Added missing receivable entry for booking #113', 
        NOW(), NOW()
      )
    `);
    
    console.log('Successfully inserted DR entry. Affected rows:', res.affectedRows);
  } catch (err) {
    console.error('Error fixing ledger:', err.message);
  } finally {
    process.exit();
  }
}

fixLedger();
