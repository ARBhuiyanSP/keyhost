const mysql = require('d:/88i/booking-systme/backend/node_modules/mysql2');
const dotenv = require('d:/88i/booking-systme/backend/node_modules/dotenv');
dotenv.config({ path: 'd:/88i/booking-systme/backend/.env' });

const pool = mysql.createPool({
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'keyhost_booking_system',
  port: process.env.DB_PORT || 3306,
});

const promisePool = pool.promise();

// Mock dependencies
function formatResponse(success, message, data = null, error = null) {
    return { success, message, data, error };
}

async function syncPaymentToHMSAccounts(paymentId) {
    console.log('Mock syncPaymentToHMSAccounts called for payment:', paymentId);
}

async function testPutRoute() {
    try {
        const req = {
            params: { id: '4' },
            body: {
                hms_room_id: '7',
                check_in_date: '2026-06-08',
                check_out_date: '2026-06-09',
                guest_name: 'test edited',
                guest_email: 'edited@test.com',
                guest_phone: '2342-edited',
                total_amount: '15.00',
                payment_status: 'pending',
                special_requests: 'Edited special requests',
                source: 'Walk-in'
            },
            user: { id: 59 }
        };

        const { id } = req.params;
        const { 
            hms_room_id, check_in_date, check_out_date, 
            guest_name, guest_email, guest_phone, total_amount, 
            payment_status, special_requests, source 
        } = req.body;

        const bookingId = parseInt(id);
        const roomId = hms_room_id ? parseInt(hms_room_id) : null;

        // Fetch existing booking and do security check (owner validation)
        const [booking] = await promisePool.query(
            `SELECT b.* FROM bookings b
             JOIN properties p ON b.property_id = p.id
             WHERE b.id = ? AND p.owner_id = (SELECT id FROM property_owners WHERE user_id = ?)`,
             [bookingId, req.user.id]
        );

        if (booking.length === 0) {
            console.log('Access denied. You do not own the property for this reservation.');
            pool.end();
            return;
        }

        const currentBooking = booking[0];
        console.log('Found booking, performing update...');

        // Update the booking record
        const [updateResult] = await promisePool.query(`
            UPDATE bookings 
            SET hms_room_id = ?, 
                check_in_date = ?, 
                check_out_date = ?,
                guest_name = ?, 
                guest_email = ?, 
                guest_phone = ?, 
                base_price = ?, 
                total_amount = ?,
                payment_status = ?, 
                special_requests = ?, 
                source = ?,
                property_owner_earnings = ?,
                updated_at = NOW()
            WHERE id = ?
        `, [
            roomId, check_in_date, check_out_date,
            guest_name, guest_email, guest_phone, total_amount, total_amount,
            payment_status, special_requests, source, total_amount,
            bookingId
        ]);

        console.log('Update result:', updateResult);

        // If payment status changed to paid, and there was no payment recorded yet, record payment
        if (payment_status === 'paid' && currentBooking.payment_status !== 'paid') {
            const [existingPayments] = await promisePool.query(
                'SELECT id FROM payments WHERE booking_id = ? AND status = "completed"',
                [bookingId]
            );
            if (existingPayments.length === 0) {
                const payRef = `HMS-MANUAL-EDIT-${Date.now()}-${bookingId}`;
                const [pResult] = await promisePool.query(`
                    INSERT INTO payments (
                        booking_id, payment_reference, payment_method, payment_type, 
                        amount, cr_amount, dr_amount, transaction_type, status, notes,
                        payment_date
                    ) VALUES (?, ?, 'cash', 'booking', ?, ?, 0, 'guest_payment', 'completed', 'Manual HMS reservation edit payment', NOW())
                `, [bookingId, payRef, total_amount, total_amount]);

                await syncPaymentToHMSAccounts(pResult.insertId);
            }
        }

        console.log('Test completed successfully. Booking updated.');
        pool.end();
    } catch (error) {
        console.error('Test error:', error);
        pool.end();
    }
}

testPutRoute();
