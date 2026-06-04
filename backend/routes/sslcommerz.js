const express = require('express');
const SSLCommerzPayment = require('sslcommerz-lts');
const { pool } = require('../config/database');
const { formatResponse } = require('../utils/helpers');
const { syncPaymentToHMSAccounts } = require('../utils/hms-sync');
const { syncHmsAccessForHost } = require('../utils/hms-helper');
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

// HMS Package Subscription
router.post('/hms-request', verifyToken, async (req, res) => {
    try {
        const { package_id, amount } = req.body;
        if (!package_id || !amount) return res.status(400).json(formatResponse(false, 'Package ID and amount required'));

        const { store_id, store_password, is_live } = await getSSLConfig();
        const tran_id = `HMS${new Date().getTime()}`;
        const baseUrl = process.env.NODE_ENV === 'production' ? `https://${req.get('host')}` : `${req.protocol}://${req.get('host')}`;

        // Get user for details
        const [users] = await pool.execute('SELECT first_name, last_name, email, phone FROM users WHERE id = ?', [req.user.id]);
        if (users.length === 0) return res.status(404).json(formatResponse(false, 'User not found'));
        const user = users[0];

        // Store order securely, we link to host_id = req.user.id
        await pool.execute(
            `INSERT INTO orders (tran_id, amount, status, package_id, host_id) VALUES (?, ?, ?, ?, ?)`,
            [tran_id, amount, 'PENDING', package_id, req.user.id]
        );

        const data = {
            total_amount: amount,
            currency: 'BDT',
            tran_id: tran_id,
            success_url: `${baseUrl}/api/sslcommerz/ssl-success`,
            fail_url: `${baseUrl}/api/sslcommerz/ssl-fail`,
            cancel_url: `${baseUrl}/api/sslcommerz/ssl-cancel`,
            ipn_url: `${baseUrl}/api/sslcommerz/ssl-ipn`,
            shipping_method: 'No',
            product_name: 'HMS Subscription',
            product_category: 'Subscription',
            product_profile: 'general',
            cus_name: `${user.first_name || ''} ${user.last_name || ''}`.trim() || 'Host',
            cus_email: user.email || 'host@example.com',
            cus_add1: 'Host Address',
            cus_city: 'Dhaka',
            cus_country: 'Bangladesh',
            cus_phone: user.phone || '01711111111',
        };

        const sslcz = new SSLCommerzPayment(store_id, store_password, is_live);
        sslcz.init(data).then(apiResponse => {
            if (apiResponse?.status === 'SUCCESS' && apiResponse?.GatewayPageURL) {
                res.json(formatResponse(true, 'Payment URL generated', { url: apiResponse.GatewayPageURL }));
            } else {
                console.error('SSLCommerz HMS Init Failed:', apiResponse);
                res.status(400).json(formatResponse(false, apiResponse?.failedreason || 'Failed to generate payment URL', apiResponse));
            }
        }).catch(error => {
            console.error('SSL HMS Init Error:', error);
            res.status(500).json(formatResponse(false, 'Failed to initialize payment gateway'));
        });
    } catch(err) {
        console.error('HMS SSL Request Error', err);
        res.status(500).json(formatResponse(false, err.message));
    }
});

// Payment Init Route
router.post('/ssl-request', verifyToken, async (req, res) => {
    try {
        const { booking_id, amount, points_to_redeem, customer_name, customer_email, customer_phone, customer_city, customer_address } = req.body;

        if (!amount) {
            return res.status(400).json(formatResponse(false, 'Amount is required'));
        }

        const { store_id, store_password, is_live } = await getSSLConfig();

        const tran_id = `REF${new Date().getTime()}`;
        const baseUrl = process.env.NODE_ENV === 'production'
            ? `https://${req.get('host')}`
            : `${req.protocol}://${req.get('host')}`;

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
            `INSERT INTO orders (booking_id, tran_id, amount, status, points_to_redeem) VALUES (?, ?, ?, ?, ?)`,
            [booking_id || null, tran_id, amount, 'PENDING', points_to_redeem || 0]
        );

        const sslcz = new SSLCommerzPayment(store_id, store_password, is_live);
        sslcz.init(data).then(apiResponse => {
            if (apiResponse?.status === 'SUCCESS' && apiResponse?.GatewayPageURL) {
                res.json(formatResponse(true, 'Payment URL generated', { url: apiResponse.GatewayPageURL }));
            } else {
                console.error('SSLCommerz Init Failed:', apiResponse);
                res.status(400).json(formatResponse(false, apiResponse?.failedreason || 'Failed to generate payment URL', apiResponse));
            }
        }).catch(error => {
            console.error('SSL Init Error:', error);
            res.status(500).json(formatResponse(false, 'Failed to initialize payment gateway'));
        });
    } catch (error) {
        console.error('SSL Request Error:', error);
        res.status(500).json(formatResponse(false, error.message));
    }
});

// Callback Routes
router.post('/ssl-success', async (req, res) => {
    const { tran_id, val_id, bank_tran_id } = req.body;
    console.log('SSL Success IPN received:', { tran_id, val_id, bank_tran_id });

    if (tran_id) {
        try {
            await pool.execute(`UPDATE orders SET status = 'Success', val_id = ? WHERE tran_id = ?`, [val_id, tran_id]);

            const [orders] = await pool.execute(`SELECT booking_id, package_id, host_id, amount, points_to_redeem FROM orders WHERE tran_id = ?`, [tran_id]);
            
            if (orders.length > 0) {
               const orderInfo = orders[0];
               
               // If it's an HMS Subscription payment
               if (orderInfo.package_id && orderInfo.host_id) {
                   const [pkgs] = await pool.execute('SELECT duration_days FROM hms_packages WHERE id = ?', [orderInfo.package_id]);
                   const durationDays = pkgs.length > 0 ? pkgs[0].duration_days || 30 : 30;

                   const [existing] = await pool.execute('SELECT id FROM hms_subscriptions WHERE host_id = ?', [orderInfo.host_id]);
                   if (existing.length > 0) {
                     await pool.execute(
                       `UPDATE hms_subscriptions SET status = 'active', package_id = ?, subscription_ends_at = DATE_ADD(NOW(), INTERVAL ? DAY) WHERE host_id = ?`,
                       [orderInfo.package_id, durationDays, orderInfo.host_id]
                     );
                   } else {
                     await pool.execute(
                       `INSERT INTO hms_subscriptions (host_id, status, package_id, subscription_ends_at) VALUES (?, 'active', ?, DATE_ADD(NOW(), INTERVAL ? DAY))`,
                       [orderInfo.host_id, orderInfo.package_id, durationDays]
                     );
                   }
                   await syncHmsAccessForHost(orderInfo.host_id, true);
                   
                   const frontendUrl = process.env.FRONTEND_URL;
                   return res.redirect(`${frontendUrl}/property-owner/hms/pricing?payment=success&tran_id=${tran_id}`);
               }

               // If it's a Property Booking
               if (orderInfo.booking_id) {
                const booking_id = orderInfo.booking_id;
                const amount = orderInfo.amount;
                const points_to_redeem = orderInfo.points_to_redeem;

                await pool.execute(`UPDATE bookings SET payment_status = 'paid', payment_method = 'sslcommerz', status = 'confirmed', confirmed_at = NOW() WHERE id = ?`, [booking_id]);
                const crReference = `SSL-${tran_id}`;
                const [exists] = await pool.execute("SELECT id FROM payments WHERE gateway_transaction_id = ?", [tran_id]);
                if (exists.length === 0) {
                    let pointsRedeemed = 0;
                    let pointsDiscount = 0;
                    if (points_to_redeem > 0) {
                        try {
                            const [bookingData] = await pool.execute('SELECT guest_id, total_amount FROM bookings WHERE id = ?', [booking_id]);
                            if (bookingData.length > 0) {
                                const { redeemPointsForBooking } = require('../utils/rewardsPoints');
                                const redemptionResult = await redeemPointsForBooking(bookingData[0].guest_id, points_to_redeem, booking_id);
                                pointsRedeemed = redemptionResult.pointsRedeemed;
                                pointsDiscount = redemptionResult.discountAmount;
                                
                                await pool.execute(`
                                    UPDATE bookings 
                                    SET points_redeemed = ?, points_discount = ?, updated_at = NOW()
                                    WHERE id = ?
                                `, [pointsRedeemed, pointsDiscount, booking_id]);
                            }
                        } catch (err) {
                            console.error('Points redemption error on SSL success:', err);
                        }
                    }

                const [result] = await pool.execute(`
                INSERT INTO payments (
                  booking_id, payment_reference, payment_method, payment_type, 
                  amount, dr_amount, cr_amount, transaction_type, status, notes,
                  payment_date, created_at, updated_at, gateway_transaction_id, bank_tran_id
                ) VALUES (?, ?, 'sslcommerz', 'booking', ?, 0, ?, 'guest_payment', 'completed', ?, NOW(), NOW(), NOW(), ?, ?)
              `, [
                    booking_id, 
                    crReference, 
                    amount, 
                    amount, 
                    `Guest payment received via SSLCommerz - Total paid: ৳${amount}${pointsDiscount > 0 ? `, Points discount: ৳${pointsDiscount.toFixed(2)}` : ''}`,
                    tran_id,
                    bank_tran_id || null
                ]);

                const paymentId = result.insertId;

                // Sync to HMS Accounts
                try {
                    await syncPaymentToHMSAccounts(paymentId);
                } catch (hmsError) {
                    console.error('HMS Sync error in SSL success:', hmsError);
                }

                const [drExists] = await pool.execute(`
                    SELECT id FROM payments 
                    WHERE booking_id = ? AND transaction_type = 'owner_accepted' AND dr_amount > 0
                `, [booking_id]);

                if (drExists.length === 0) {
                    const autoDrRef = `DR-AUTO-${Date.now()}-${booking_id}`;
                    await pool.execute(`
                        INSERT INTO payments (
                            booking_id, payment_reference, payment_type,
                            amount, dr_amount, cr_amount, transaction_type, status, notes,
                            payment_date, created_at, updated_at
                        ) VALUES (?, ?, 'booking', ?, ?, 0, 'owner_accepted', 'completed', ?, NOW(), NOW(), NOW())
                    `, [booking_id, autoDrRef, amount, amount, `Automatic DR entry for successful payment - ৳${amount}`]);
                }
              
                    await pool.execute(`
                      UPDATE admin_earnings 
                      SET payment_status = 'paid', 
                          payment_date = NOW(),
                          updated_at = NOW()
                      WHERE booking_id = ? 
                      AND payment_status = 'pending'
                    `, [booking_id]);

                    await pool.execute(`
                      UPDATE payments
                      SET status = 'completed',
                          updated_at = NOW()
                      WHERE booking_id = ? 
                      AND transaction_type = 'owner_accepted'
                      AND dr_amount > 0
                    `, [booking_id]);

                    try {
                        const [bookingData] = await pool.execute('SELECT guest_id, total_amount FROM bookings WHERE id = ?', [booking_id]);
                        if (bookingData.length > 0) {
                            const guestId = bookingData[0].guest_id;
                            const totalAmount = bookingData[0].total_amount;
                            
                            const [existingPoints] = await pool.execute(`
                                SELECT id FROM rewards_point_transactions 
                                WHERE booking_id = ? AND transaction_type = 'earned'
                            `, [booking_id]);
                            
                            if (existingPoints.length === 0) {
                                const { awardPointsForBooking } = require('../utils/rewardsPoints');
                                await awardPointsForBooking(guestId, totalAmount, booking_id);
                                console.log(`✅ Points awarded successfully for SSLCommerz payment on booking ${booking_id}`);
                            }
                        }
                    } catch (pointsError) {
                        console.error('Points awarding error in SSLCommerz:', pointsError);
                    }
                }
               }
            }
        } catch (error) {
            console.error('SSL Success processing error:', error);
        }
    }

    const frontendUrl = process.env.FRONTEND_URL;
    const [orders2] = await pool.execute(`SELECT booking_id FROM orders WHERE tran_id = ?`, [tran_id]);
    const bookingIdForRedirect = orders2?.[0]?.booking_id;
    const redirectUrl = bookingIdForRedirect
        ? `${frontendUrl}/booking-confirmation/${bookingIdForRedirect}`
        : `${frontendUrl}/guest/bookings`;
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
        try {
            await pool.execute(`UPDATE orders SET status = 'Success', val_id = ? WHERE tran_id = ?`, [val_id, tran_id]);
            
            const [orders] = await pool.execute(`SELECT booking_id, package_id, host_id, amount, points_to_redeem FROM orders WHERE tran_id = ?`, [tran_id]);
            if (orders.length > 0) {
               const orderInfo = orders[0];
               
               if (orderInfo.package_id && orderInfo.host_id) {
                   const [pkgs] = await pool.execute('SELECT duration_days FROM hms_packages WHERE id = ?', [orderInfo.package_id]);
                   const durationDays = pkgs.length > 0 ? pkgs[0].duration_days || 30 : 30;

                   const [existing] = await pool.execute('SELECT id FROM hms_subscriptions WHERE host_id = ?', [orderInfo.host_id]);
                   if (existing.length > 0) {
                     await pool.execute(
                       `UPDATE hms_subscriptions SET status = 'active', package_id = ?, subscription_ends_at = DATE_ADD(NOW(), INTERVAL ? DAY) WHERE host_id = ?`,
                       [orderInfo.package_id, durationDays, orderInfo.host_id]
                     );
                   } else {
                     await pool.execute(
                       `INSERT INTO hms_subscriptions (host_id, status, package_id, subscription_ends_at) VALUES (?, 'active', ?, DATE_ADD(NOW(), INTERVAL ? DAY))`,
                       [orderInfo.host_id, orderInfo.package_id, durationDays]
                     );
                   }
                   await syncHmsAccessForHost(orderInfo.host_id, true);
               } else if (orderInfo.booking_id) {
                const booking_id = orderInfo.booking_id;
                const amount = orderInfo.amount;
                const points_to_redeem = orderInfo.points_to_redeem;

                await pool.execute(`UPDATE bookings SET payment_status = 'paid', payment_method = 'sslcommerz', status = 'confirmed', confirmed_at = NOW() WHERE id = ?`, [booking_id]);
                const crReference = `SSL-${tran_id}`;
                const [exists] = await pool.execute("SELECT id FROM payments WHERE gateway_transaction_id = ?", [tran_id]);
                if (exists.length === 0) {
                    let pointsRedeemed = 0;
                    let pointsDiscount = 0;
                    if (points_to_redeem > 0) {
                        try {
                            const [bookingData] = await pool.execute('SELECT guest_id, total_amount FROM bookings WHERE id = ?', [booking_id]);
                            if (bookingData.length > 0) {
                                const { redeemPointsForBooking } = require('../utils/rewardsPoints');
                                const redemptionResult = await redeemPointsForBooking(bookingData[0].guest_id, points_to_redeem, booking_id);
                                pointsRedeemed = redemptionResult.pointsRedeemed;
                                pointsDiscount = redemptionResult.discountAmount;
                                
                                await pool.execute(`
                                    UPDATE bookings 
                                    SET points_redeemed = ?, points_discount = ?, updated_at = NOW()
                                    WHERE id = ?
                                `, [pointsRedeemed, pointsDiscount, booking_id]);
                            }
                        } catch (err) {
                            console.error('Points redemption error on SSL IPN:', err);
                        }
                    }

                const [result] = await pool.execute(`
                INSERT INTO payments (
                  booking_id, payment_reference, payment_method, payment_type, 
                  amount, dr_amount, cr_amount, transaction_type, status, notes,
                  payment_date, created_at, updated_at, gateway_transaction_id
                ) VALUES (?, ?, 'sslcommerz', 'booking', ?, 0, ?, 'guest_payment', 'completed', ?, NOW(), NOW(), NOW(), ?)
              `, [
                    booking_id, 
                    crReference, 
                    amount, 
                    amount, 
                    `Guest payment received via SSLCommerz - Total paid: ৳${amount}${pointsDiscount > 0 ? `, Points discount: ৳${pointsDiscount.toFixed(2)}` : ''}`,
                    tran_id
                ]);

                const paymentId = result.insertId;

                // Sync to HMS Accounts
                try {
                    await syncPaymentToHMSAccounts(paymentId);
                } catch (hmsError) {
                    console.error('HMS Sync error in SSL IPN:', hmsError);
                }

                    await pool.execute(`
                      UPDATE admin_earnings 
                      SET payment_status = 'paid', 
                          payment_date = NOW(),
                          updated_at = NOW()
                      WHERE booking_id = ? 
                      AND payment_status = 'pending'
                    `, [booking_id]);

                    await pool.execute(`
                      UPDATE payments
                      SET status = 'completed',
                          updated_at = NOW()
                      WHERE booking_id = ? 
                      AND transaction_type = 'owner_accepted'
                      AND dr_amount > 0
                    `, [booking_id]);

                    try {
                        const [bookingData] = await pool.execute('SELECT guest_id, total_amount FROM bookings WHERE id = ?', [booking_id]);
                        if (bookingData.length > 0) {
                            const guestId = bookingData[0].guest_id;
                            const totalAmount = bookingData[0].total_amount;
                            
                            const [existingPoints] = await pool.execute(`
                                SELECT id FROM rewards_point_transactions 
                                WHERE booking_id = ? AND transaction_type = 'earned'
                            `, [booking_id]);
                            
                            if (existingPoints.length === 0) {
                                const { awardPointsForBooking } = require('../utils/rewardsPoints');
                                await awardPointsForBooking(guestId, totalAmount, booking_id);
                                console.log(`✅ Points awarded successfully via SSL IPN on booking ${booking_id}`);
                            }
                        }
                    } catch (pointsError) {
                        console.error('Points awarding error in SSLCommerz IPN:', pointsError);
                    }
                }
               }
            }
        } catch (error) {
            console.error('SSL IPN processing error:', error);
        }
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

// Public HMS Payment Info
router.get('/hms/payment-info/:token', async (req, res) => {
    try {
        const { token } = req.params;
        const [rows] = await pool.query(`
            SELECT 
                b.id, b.total_amount, b.payment_status, b.guest_name, b.guest_email, b.guest_phone,
                p.title as property_title, p.address as property_address,
                r.room_number, r.room_type
            FROM bookings b
            JOIN properties p ON b.property_id = p.id
            LEFT JOIN hms_rooms r ON b.hms_room_id = r.id
            WHERE b.payment_link_token = ?
        `, [token]);

        if (rows.length === 0) {
            return res.status(404).json(formatResponse(false, 'Payment link invalid or expired'));
        }

        if (rows[0].payment_status === 'paid') {
            return res.json(formatResponse(true, 'Already paid', { ...rows[0], alreadyPaid: true }));
        }

        res.json(formatResponse(true, 'Payment info retrieved', { booking: rows[0] }));
    } catch (error) {
        res.status(500).json(formatResponse(false, 'Error fetching payment info'));
    }
});

// Public HMS Invoice Info
router.get('/hms/invoice-info/:token', async (req, res) => {
    try {
        const { token } = req.params;
        const [rows] = await pool.query(`
            SELECT 
                b.*, 
                p.title as property_title, p.address as property_address, p.city as property_city,
                r.room_number, r.room_type,
                po.business_name as company_name,
                DATEDIFF(b.check_out_date, b.check_in_date) as nights
            FROM bookings b
            JOIN properties p ON b.property_id = p.id
            JOIN property_owners po ON p.owner_id = po.id
            LEFT JOIN hms_rooms r ON b.hms_room_id = r.id
            WHERE b.payment_link_token = ?
        `, [token]);

        if (rows.length === 0) {
            return res.status(404).json(formatResponse(false, 'Invoice not found or link expired'));
        }

        res.json(formatResponse(true, 'Invoice data retrieved', { invoice: rows[0] }));
    } catch (error) {
        res.status(500).json(formatResponse(false, 'Error fetching invoice data'));
    }
});

// Public HMS Payment Request
router.post('/hms/public-request', async (req, res) => {
    try {
        const { token } = req.body;
        const [bookings] = await pool.query(`
            SELECT b.*, p.title as property_title 
            FROM bookings b
            JOIN properties p ON b.property_id = p.id
            WHERE b.payment_link_token = ?
        `, [token]);

        if (bookings.length === 0) return res.status(404).json(formatResponse(false, 'Invalid token'));
        const booking = bookings[0];

        const { store_id, store_password, is_live } = await getSSLConfig();
        const tran_id = `HMSPAY${new Date().getTime()}`;
        const baseUrl = process.env.NODE_ENV === 'production' ? `https://${req.get('host')}` : `${req.protocol}://${req.get('host')}`;

        await pool.execute(
            `INSERT INTO orders (booking_id, tran_id, amount, status) VALUES (?, ?, ?, ?)`,
            [booking.id, tran_id, booking.total_amount, 'PENDING']
        );

        const data = {
            total_amount: booking.total_amount,
            currency: 'BDT',
            tran_id: tran_id,
            success_url: `${baseUrl}/api/sslcommerz/ssl-success`,
            fail_url: `${baseUrl}/api/sslcommerz/ssl-fail`,
            cancel_url: `${baseUrl}/api/sslcommerz/ssl-cancel`,
            ipn_url: `${baseUrl}/api/sslcommerz/ssl-ipn`,
            shipping_method: 'No',
            product_name: `Room ${booking.room_number || ''} - ${booking.property_title}`,
            product_category: 'Hotel Booking',
            product_profile: 'general',
            cus_name: booking.guest_name || 'Guest',
            cus_email: booking.guest_email || 'guest@example.com',
            cus_add1: 'Dhaka',
            cus_city: 'Dhaka',
            cus_country: 'Bangladesh',
            cus_phone: booking.guest_phone || '01711111111',
        };

        const sslcz = new SSLCommerzPayment(store_id, store_password, is_live);
        sslcz.init(data).then(apiResponse => {
            if (apiResponse?.status === 'SUCCESS' && apiResponse?.GatewayPageURL) {
                res.json(formatResponse(true, 'Payment URL generated', { url: apiResponse.GatewayPageURL }));
            } else {
                res.status(400).json(formatResponse(false, 'Failed to generate payment URL'));
            }
        });
    } catch (error) {
        res.status(500).json(formatResponse(false, error.message));
    }
});

module.exports = router;
