const { pool } = require('../config/database.js');

async function fixPricesAndImages() {
  try {
    console.log("Starting pricing & image sync for single-unit properties...");
    
    // 1. Get all single-unit properties
    const [properties] = await pool.execute(`
      SELECT id, title, base_price, is_hms_enabled, property_type
      FROM properties
      WHERE is_single_unit = 1
    `);
    
    console.log(`Found ${properties.length} single-unit properties.`);
    
    for (const prop of properties) {
      // 2. Fetch property images from property_images
      const [propImages] = await pool.execute(`
        SELECT image_url
        FROM property_images
        WHERE property_id = ? AND is_active = 1
        ORDER BY sort_order ASC
      `, [prop.id]);
      const roomImages = propImages.map(img => img.image_url);

      // 3. Check if a room exists for this property
      const [rooms] = await pool.execute(`
        SELECT id, room_number, price, images
        FROM hms_rooms
        WHERE property_id = ? AND room_number = 'Entire Place'
      `, [prop.id]);
      
      if (rooms.length > 0) {
        const room = rooms[0];
        const propPrice = parseFloat(prop.base_price || 0);
        const roomPrice = parseFloat(room.price || 0);
        
        let parsedRoomImages = [];
        try {
          if (room.images) {
            parsedRoomImages = JSON.parse(room.images);
            if (typeof parsedRoomImages === 'string') parsedRoomImages = JSON.parse(parsedRoomImages);
          }
        } catch (e) {
          parsedRoomImages = [];
        }

        // We update if the price doesn't match OR if room images are empty/out of sync
        const needsImageUpdate = !parsedRoomImages || parsedRoomImages.length === 0;
        
        if (roomPrice !== propPrice || needsImageUpdate) {
          console.log(`Updating property ID ${prop.id} (${prop.title}):`);
          if (roomPrice !== propPrice) {
            console.log(`  Price: ${roomPrice} -> ${propPrice}`);
          }
          if (needsImageUpdate) {
            console.log(`  Images: empty -> Synced ${roomImages.length} property images`);
          }
          
          await pool.execute(`
            UPDATE hms_rooms
            SET price = ?, room_type = ?, images = ?
            WHERE id = ?
          `, [propPrice, prop.property_type || 'Room', JSON.stringify(roomImages), room.id]);
        } else {
          console.log(`Property ID ${prop.id} (${prop.title}) is already correct (Price: ${roomPrice}, Images: ${parsedRoomImages.length}).`);
        }
      } else {
        // If HMS is enabled but no room is seeded, seed it now with images
        if (prop.is_hms_enabled) {
          console.log(`Seeding missing 'Entire Place' room for HMS-enabled property ID ${prop.id} (${prop.title}) with price ${prop.base_price} and ${roomImages.length} images.`);
          await pool.execute(`
            INSERT INTO hms_rooms (property_id, room_number, room_type, floor, price, status, features, images)
            VALUES (?, 'Entire Place', ?, '1', ?, 'available', '[]', ?)
          `, [prop.id, prop.property_type || 'Room', prop.base_price || 0, JSON.stringify(roomImages)]);
        }
      }
    }
    
    console.log("Pricing & image sync completed successfully!");
  } catch (error) {
    console.error("Error running fix script:", error);
  } finally {
    process.exit();
  }
}

fixPricesAndImages();
