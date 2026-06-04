const { pool } = require('../config/database');
const fs = require('fs');
const path = require('path');

async function cleanup() {
    console.log('Starting cleanup of suspended properties...');
    
    try {
        // 1. Get suspended properties
        const [suspendedProperties] = await pool.execute(
            "SELECT id, title FROM properties WHERE status = 'suspended'"
        );

        if (suspendedProperties.length === 0) {
            console.log('No suspended properties found.');
            return;
        }

        console.log(`Found ${suspendedProperties.length} suspended properties.`);

        for (const prop of suspendedProperties) {
            console.log(`\nProcessing property ID ${prop.id}: "${prop.title}"`);

            // 2. Get and delete images
            const [images] = await pool.execute(
                "SELECT image_url FROM property_images WHERE property_id = ?",
                [prop.id]
            );

            for (const img of images) {
                if (img.image_url && img.image_url.startsWith('/uploads/')) {
                    const filePath = path.join(__dirname, '../', img.image_url);
                    if (fs.existsSync(filePath)) {
                        try {
                            fs.unlinkSync(filePath);
                            console.log(`  Deleted file: ${filePath}`);
                        } catch (err) {
                            console.error(`  Error deleting file ${filePath}:`, err.message);
                        }
                    } else {
                        console.log(`  File not found: ${filePath}`);
                    }
                }
            }

            // 3. Delete from related tables
            const tablesToDeleteFrom = [
                'property_images',
                'property_amenities',
                'property_availability',
                'property_rules',
                'property_policies',
                'display_category_properties',
                'property_reports',
                'favorites',
                'external_calendars'
            ];

            for (const table of tablesToDeleteFrom) {
                const [result] = await pool.execute(`DELETE FROM ${table} WHERE property_id = ?`, [prop.id]);
                if (result.affectedRows > 0) {
                    console.log(`  Deleted ${result.affectedRows} records from ${table}`);
                }
            }

            // 4. Handle Bookings and Reviews (Carefully)
            // Note: Bookings might have payments, refunds, etc.
            // We'll delete them too to satisfy the user request of "delete everything".
            
            // Get booking IDs first
            const [bookings] = await pool.execute("SELECT id FROM bookings WHERE property_id = ?", [prop.id]);
            const bookingIds = bookings.map(b => b.id);

            if (bookingIds.length > 0) {
                console.log(`  Handling ${bookingIds.length} bookings...`);
                
                for (const bId of bookingIds) {
                    const bookingTables = [
                        'payments',
                        'refunds',
                        'coupon_usage',
                        'booking_guests',
                        'booking_modifications'
                    ];

                    for (const table of bookingTables) {
                        try {
                            await pool.execute(`DELETE FROM ${table} WHERE booking_id = ?`, [bId]);
                        } catch (err) {
                            // Silently fail if table or column doesn't exist
                        }
                    }
                }
                
                await pool.execute("DELETE FROM bookings WHERE property_id = ?", [prop.id]);
                console.log(`  Deleted bookings for property ${prop.id}`);
            }

            // Reviews
            await pool.execute("DELETE FROM reviews WHERE property_id = ?", [prop.id]);
            console.log(`  Deleted reviews for property ${prop.id}`);

            // 5. Delete the property itself
            const [propResult] = await pool.execute("DELETE FROM properties WHERE id = ?", [prop.id]);
            if (propResult.affectedRows > 0) {
                console.log(`  Successfully deleted property entry.`);
            }
        }

        console.log('\nCleanup completed successfully.');
    } catch (error) {
        console.error('An error occurred during cleanup:', error);
    } finally {
        await pool.end();
    }
}

cleanup();
