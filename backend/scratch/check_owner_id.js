const { pool } = require('../config/database');

async function checkOwners() {
    try {
        const [owners] = await pool.query(`
            SELECT po.id as owner_id, po.user_id, po.business_name, p.id as property_id, b.id as booking_id, b.booking_reference, b.payment_status
            FROM property_owners po
            JOIN properties p ON p.owner_id = po.id
            JOIN bookings b ON b.property_id = p.id
            WHERE b.id = 372
        `);
        console.log('Booking 372 Owner Details:', owners);
        process.exit(0);
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
}

checkOwners();
