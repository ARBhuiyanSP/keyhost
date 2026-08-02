const { pool } = require('../config/database');

async function run() {
    console.log('=== STARTING IMAGE URLS CLEANUP ===');
    const [rooms] = await pool.query('SELECT id, images FROM hms_rooms');
    let roomsUpdated = 0;
    
    for (const room of rooms) {
        if (!room.images) continue;
        let imageList;
        try {
            imageList = JSON.parse(room.images);
            if (typeof imageList === 'string') imageList = JSON.parse(imageList);
        } catch (e) {
            console.error(`Failed to parse images JSON for room ID ${room.id}`);
            continue;
        }
        
        if (!Array.isArray(imageList)) continue;
        
        let changed = false;
        const cleanedList = imageList.map(img => {
            if (img && img.startsWith('http') && img.includes('/uploads/')) {
                const index = img.indexOf('/uploads/');
                if (index !== -1) {
                    changed = true;
                    return img.substring(index);
                }
            }
            return img;
        });
        
        if (changed) {
            await pool.query('UPDATE hms_rooms SET images = ? WHERE id = ?', [JSON.stringify(cleanedList), room.id]);
            console.log(`✔ Cleaned images for room ID ${room.id}:`, cleanedList);
            roomsUpdated++;
        }
    }
    
    // Also clean property_images table
    const [propImages] = await pool.query('SELECT id, image_url FROM property_images');
    let propImagesUpdated = 0;
    
    for (const img of propImages) {
        if (img.image_url && img.image_url.startsWith('http') && img.image_url.includes('/uploads/')) {
            const index = img.image_url.indexOf('/uploads/');
            if (index !== -1) {
                const cleanedUrl = img.image_url.substring(index);
                await pool.query('UPDATE property_images SET image_url = ? WHERE id = ?', [cleanedUrl, img.id]);
                console.log(`✔ Cleaned property_image ID ${img.id}:`, cleanedUrl);
                propImagesUpdated++;
            }
        }
    }
    
    console.log(`=== CLEANUP FINISHED ===`);
    console.log(`Total hms_rooms updated: ${roomsUpdated}`);
    console.log(`Total property_images updated: ${propImagesUpdated}`);
    process.exit(0);
}

run().catch(err => {
    console.error('Error running cleanup script:', err);
    process.exit(1);
});
