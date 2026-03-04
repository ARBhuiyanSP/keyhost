const express = require('express');
const SSLCommerzPayment = require('sslcommerz-lts');
const { pool } = require('../config/database');
const { formatResponse } = require('../utils/helpers');
const { verifyToken } = require('../middleware/auth');
const router = express.Router();

// Utility function to get SSL config
const getSSLConfig = async () => {
    const [rows] = await pool.execute('SELECT store_id, store_password, is_live FROM payment_settings WHERE provider_name = ?', ['sslcommerz']);
    if (rows.length === 0) {
        throw new Error('SSLCommerz configuration not found in payment_settings');
    }
    return {
        store_id: rows[0].store_id,
        store_password: rows[0].store_password,
        is_live: Boolean(rows[0].is_live)
    };
};

// Payment Init Route
router.post('/ssl-request', verifyToken, async (req, res) => {
    try {
        const { booking_id, amount, customer_name, customer_email, customer_phone, customer_city, customer_address } = req.body;

        if (!amount) {
            return res.status(400).json(formatResponse(false, 'Amount is required'));
        }

        const { store_id, store_password, is_live } = await getSSLConfig();

        const tran_id = `REF${new Date().getTime()}`;
        const baseUrl = `${req.protocol}://${req.get('host')}`;

        const data = {
            total_amount: amount,
            currency: 'BDT',
            tran_id: tran_id,
            success_url: `${baseUrl}/api/sslcommerz/ssl-success`,
            fail_url: `${baseUrl}/api/sslcommerz/ssl-fail`,
            cancel_url: `${baseUrl}/api/sslcommerz/ssl-cancel`,
            ipn_url: `${baseUrl}/api/sslcommerz/ssl-ipn`,
            shipping_method: 'No',
            product_name: 'Property Booking',
            product_category: 'Booking',
            product_profile: 'general',
            cus_name: customer_name || 'Guest',
            cus_email: customer_email || 'guest@example.com',
            cus_add1: customer_address || 'Dhaka',
            cus_add2: 'Dhaka',
            cus_city: customer_city || 'Dhaka',
            cus_state: 'Dhaka',
            cus_postcode: '1000',
            cus_country: 'Bangladesh',
            cus_phone: customer_phone || '01711111111',
            cus_fax: '01711111111',
            ship_name: customer_name || 'Guest',
            ship_add1: 'Dhaka',
            ship_add2: 'Dhaka',
            ship_city: 'Dhaka',
            ship_state: 'Dhaka',
            ship_postcode: 1000,
            ship_country: 'Bangladesh',
        };

        // Store in orders table
        await pool.execute(
            `INSERT INTO orders (booking_id, tran_id, amount, status) VALUES (?, ?, ?, ?)`,
            [booking_id || null, tran_id, amount, 'PENDING']
        );

        const sslcz = new SSLCommerzPayment(store_id, store_password, is_live);
        sslcz.init(data).then(apiResponse => {
            let GatewayPageURL = apiResponse.GatewayPageURL;
            res.json(formatResponse(true, 'Payment URL generated', { url: GatewayPageURL }));
        }).catch(error => {
            console.error(error);
            res.status(500).json(formatResponse(false, 'Failed to initialize payment gateway'));
        });
    } catch (error) {
        console.error('SSL Request Error:', error);
        res.status(500).json(formatResponse(false, error.message));
    }
});

// Callback Routes
router.post('/ssl-success', async (req, res) => {
    const { tran_id, val_id } = req.body;

    if (tran_id) {
        await pool.execute(`UPDATE orders SET status = 'Success', val_id = ? WHERE tran_id = ?`, [val_id, tran_id]);

        // Attempt to update bookings and payments table if booking_id logic is required
        // (A real app would also verify the val_id via SSLCommerz API here)
        const [orders] = await pool.execute(`SELECT booking_id, amount FROM orders WHERE tran_id = ?`, [tran_id]);
        if (orders.length > 0 && orders[0].booking_id) {
            const booking_id = orders[0].booking_id;
            const amount = orders[0].amount;

            // Same payment logic as bkash
            await pool.execute(`UPDATE bookings SET payment_status = 'paid', status = 'confirmed', confirmed_at = NOW() WHERE id = ?`, [booking_id]);
            const crReference = `SSL-${tran_id}`;
            const [exists] = await pool.execute("SELECT id FROM payments WHERE gateway_transaction_id = ?", [tran_id]);
            if (exists.length === 0) {
                await pool.execute(`
            INSERT INTO payments (
              booking_id, payment_reference, payment_method, payment_type, 
              amount, dr_amount, cr_amount, transaction_type, status, 
              payment_date, created_at, updated_at, gateway_transaction_id
            ) VALUES (?, ?, 'sslcommerz', 'booking', ?, 0, ?, 'guest_payment', 'completed', NOW(), NOW(), NOW(), ?)
          `, [booking_id, crReference, amount, amount, tran_id]);
            }
        }
    }

    // Here we would normally redirect to the frontend checkout success page
    const frontendUrl = process.env.FRONTEND_URL;
    const redirectUrl = `${frontendUrl}/guest/bookings`;
    return res.redirect(redirectUrl);
});

router.post('/ssl-fail', async (req, res) => {
    const { tran_id } = req.body;
    if (tran_id) {
        await pool.execute(`UPDATE orders SET status = 'Failed' WHERE tran_id = ?`, [tran_id]);
    }
    const frontendUrl = process.env.FRONTEND_URL;
    return res.redirect(`${frontendUrl}/guest/bookings?payment=fail&tran_id=${tran_id}`);
});

router.post('/ssl-cancel', async (req, res) => {
    const { tran_id } = req.body;
    if (tran_id) {
        await pool.execute(`UPDATE orders SET status = 'Cancelled' WHERE tran_id = ?`, [tran_id]);
    }
    const frontendUrl = process.env.FRONTEND_URL;
    return res.redirect(`${frontendUrl}/guest/bookings?payment=cancel&tran_id=${tran_id}`);
});

router.post('/ssl-ipn', async (req, res) => {
    const { tran_id, val_id, status } = req.body;
    if (tran_id && status === 'VALID') {
        await pool.execute(`UPDATE orders SET status = 'Success', val_id = ? WHERE tran_id = ?`, [val_id, tran_id]);
    }
    return res.status(200).send('IPN Recieved');
});

// Admin Route to update settings
router.post('/settings', verifyToken, async (req, res) => {
    try {
        const { store_id, store_password, is_live } = req.body;
        await pool.execute(
            `UPDATE payment_settings SET store_id = ?, store_password = ?, is_live = ? WHERE provider_name = 'sslcommerz'`,
            [store_id, store_password, is_live ? 1 : 0]
        );
        res.json(formatResponse(true, 'SSLCommerz settings updated successfully'));
    } catch (error) {
        console.error('Update SSL settings error:', error);
        res.status(500).json(formatResponse(false, 'Failed to update SSL settings'));
    }
});

router.get('/settings', verifyToken, async (req, res) => {
    try {
        const { store_id, store_password, is_live } = await getSSLConfig();
        res.json(formatResponse(true, 'Settings retrieved', { store_id, store_password, is_live }));
    } catch (error) {
        res.status(500).json(formatResponse(false, 'Failed to retrieve SSL settings'));
    }
});

module.exports = router;
