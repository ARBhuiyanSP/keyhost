const { pool } = require('../config/database');

const syncHmsAccessForHost = async (hostUserId, hasAccess) => {
  try {
    const isEnabled = hasAccess ? 1 : 0;
    
    // 1. Get the host owner ID
    const [owners] = await pool.execute(
      'SELECT id FROM property_owners WHERE user_id = ?',
      [hostUserId]
    );
    if (owners.length === 0) {
      console.log(`[HMS-SYNC] No property owner profile found for host user ID ${hostUserId}`);
      return;
    }
    const ownerId = owners[0].id;

    console.log(`[HMS-SYNC] Syncing HMS access to ${hasAccess ? 'ENABLED' : 'DISABLED'} for host user ID ${hostUserId} (ownerId: ${ownerId})`);

    // 2. Update is_hms_enabled for all properties belonging to the host
    const [propUpdateResult] = await pool.execute(
      'UPDATE properties SET is_hms_enabled = ? WHERE owner_id = ?',
      [isEnabled, ownerId]
    );
    console.log(`[HMS-SYNC] Updated is_hms_enabled flag on ${propUpdateResult.affectedRows} properties.`);

    // 3. If access is granted, seed rooms for all single-unit properties that do not have one
    if (hasAccess) {
      const [properties] = await pool.execute(
        'SELECT id, property_type, base_price FROM properties WHERE owner_id = ? AND is_single_unit = 1',
        [ownerId]
      );

      for (const prop of properties) {
        const [existingRooms] = await pool.query(
          'SELECT id FROM hms_rooms WHERE property_id = ?',
          [prop.id]
        );
        if (existingRooms.length === 0) {
          console.log(`[HMS-SYNC] Auto-seeding Entire Place room for property ID ${prop.id}`);
          const [propImages] = await pool.query(
            'SELECT image_url FROM property_images WHERE property_id = ? AND is_active = 1 ORDER BY sort_order ASC',
            [prop.id]
          );
          const roomImages = propImages.map(img => img.image_url);

          await pool.query(
            'INSERT INTO hms_rooms (property_id, room_number, room_type, floor, price, status, features, images) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
            [prop.id, 'Entire Place', prop.property_type || 'Room', '1', prop.base_price || 0, 'available', '[]', JSON.stringify(roomImages)]
          );
        } else {
          console.log(`[HMS-SYNC] Syncing Entire Place room price/type for property ID ${prop.id}`);
          await pool.query(
            "UPDATE hms_rooms SET price = ?, room_type = ? WHERE property_id = ? AND room_number = 'Entire Place'",
            [prop.base_price || 0, prop.property_type || 'Room', prop.id]
          );
        }
      }
    }
  } catch (error) {
    console.error(`[HMS-SYNC] Error synchronizing HMS access for host user ID ${hostUserId}:`, error);
  }
};

module.exports = { syncHmsAccessForHost };
