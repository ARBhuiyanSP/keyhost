const { pool } = require('../config/database');
const fs = require('fs');
const path = require('path');

async function cleanupImages() {
    console.log('Starting images folder cleanup...');
    
    try {
        // 1. Get all image URLs from DB
        const [rows] = await pool.execute('SELECT image_url FROM property_images');
        const dbImages = new Set(rows.map(r => path.basename(r.image_url)));
        
        console.log(`Found ${dbImages.size} unique images in database.`);

        // 2. Scan the uploads folder
        const uploadDir = path.join(__dirname, '../uploads/properties');
        if (!fs.existsSync(uploadDir)) {
            console.log('Upload directory does not exist.');
            return;
        }

        const files = fs.readdirSync(uploadDir);
        console.log(`Found ${files.length} files in ${uploadDir}.`);

        let deleteCount = 0;
        let skipCount = 0;

        // 3. Compare and delete
        for (const file of files) {
            // Only process image-like files if needed, but here we assume everything in this folder should be a property image
            if (dbImages.has(file)) {
                skipCount++;
                // console.log(`Keeping: ${file}`);
            } else {
                const filePath = path.join(uploadDir, file);
                try {
                    // Check if it's a file (not a directory)
                    const stats = fs.statSync(filePath);
                    if (stats.isFile()) {
                        fs.unlinkSync(filePath);
                        console.log(`Deleted unnecessary file: ${file}`);
                        deleteCount++;
                    }
                } catch (err) {
                    console.error(`Error deleting ${file}:`, err.message);
                }
            }
        }

        console.log(`\nCleanup summary:`);
        console.log(`- Files kept: ${skipCount}`);
        console.log(`- Files deleted: ${deleteCount}`);
        console.log('Cleanup completed successfully.');

    } catch (error) {
        console.error('An error occurred during cleanup:', error);
    } finally {
        await pool.end();
    }
}

cleanupImages();
