const { pool } = require('../config/database');

async function fix() {
  const connection = await pool.getConnection();
  try {
    await connection.beginTransaction();

    // 1. Find all owner_payout_items that are linked to booking_source = 'airbnb' or property_owner_earnings = 0
    const [badItems] = await connection.execute(`
      SELECT opi.id, opi.payout_id, opi.booking_id, b.booking_reference, b.booking_source, b.property_owner_earnings
      FROM owner_payout_items opi
      JOIN bookings b ON opi.booking_id = b.id
      WHERE b.booking_source = 'airbnb' 
         OR b.property_owner_earnings <= 0
    `);

    console.log(`Found ${badItems.length} payout items with zero owner earnings or Airbnb source:`);
    badItems.forEach(item => {
      console.log(` - Item ID: ${item.id}, Payout ID: ${item.payout_id}, Booking Ref: ${item.booking_reference}, Earnings: ${item.property_owner_earnings}`);
    });

    if (badItems.length > 0) {
      // Get unique payout IDs to recalculate later
      const payoutIdsToUpdate = [...new Set(badItems.map(item => item.payout_id))];

      // Delete the bad items
      const badItemIds = badItems.map(item => item.id);
      await connection.query(`
        DELETE FROM owner_payout_items 
        WHERE id IN (${badItemIds.join(',')})
      `);
      console.log(`Deleted ${badItemIds.length} payout items.`);

      // 2. Recalculate totals for each affected payout
      for (const payoutId of payoutIdsToUpdate) {
        // Fetch remaining items for this payout
        const [remainingItems] = await connection.execute(`
          SELECT owner_earnings, admin_commission, commission_paid_to_admin
          FROM owner_payout_items
          WHERE payout_id = ?
        `, [payoutId]);

        let newEarnings = 0;
        let newCommissionPaid = 0;

        remainingItems.forEach(item => {
          newEarnings += parseFloat(item.owner_earnings) || 0;
          newCommissionPaid += item.commission_paid_to_admin ? (parseFloat(item.admin_commission) || 0) : 0;
        });

        const newNetPayout = newEarnings - newCommissionPaid;

        console.log(`Updating Payout ID: ${payoutId} -> newEarnings: ${newEarnings}, newCommissionPaid: ${newCommissionPaid}, newNetPayout: ${newNetPayout}`);

        await connection.execute(`
          UPDATE owner_payouts
          SET total_earnings = ?,
              total_commission_paid = ?,
              net_payout = ?
          WHERE id = ?
        `, [newEarnings, newCommissionPaid, newNetPayout, payoutId]);
      }
    }

    await connection.commit();
    console.log('🎉 Data clean up and recalculation successfully completed!');
    process.exit(0);
  } catch (error) {
    await connection.rollback();
    console.error('Error during cleanup:', error);
    process.exit(1);
  } finally {
    connection.release();
  }
}

fix();
