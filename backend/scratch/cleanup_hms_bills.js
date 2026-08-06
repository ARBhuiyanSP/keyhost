const { pool } = require('../config/database');

const cleanup = async () => {
  try {
    console.log("Starting HMS Bills cleanup...");
    
    // 1. Find all food orders that are NOT billed_to_room (or are cancelled)
    const [ordersToCleanup] = await pool.query(
        "SELECT id, booking_id, payment_status, status FROM hms_food_orders WHERE payment_status != 'billed_to_room' OR status = 'cancelled'"
    );
    
    console.log(`Found ${ordersToCleanup.length} food orders with non-room-billed status.`);
    
    let removedCount = 0;
    for (const order of ordersToCleanup) {
        // We look for service_name format "Food Order #ID"
        const [result] = await pool.query(
            "DELETE FROM hms_bills WHERE booking_id = ? AND service_name = ?",
            [order.booking_id, `Food Order #${order.id}`]
        );
        if (result.affectedRows > 0) {
            removedCount += result.affectedRows;
            console.log(`[CLEANUP] Removed Food Order #${order.id} from hms_bills for booking ${order.booking_id} (Status: ${order.status}, Payment: ${order.payment_status})`);
        }
    }
    
    console.log(`\nCleanup complete. Total stale entries removed: ${removedCount}`);
    process.exit(0);
  } catch (error) {
    console.error('Cleanup failed:', error);
    process.exit(1);
  }
};

cleanup();
