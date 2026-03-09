const sharp = require('sharp');
const path = require('path');
const fs = require('fs');

const processBase64Image = async (base64String, prefix) => {
    if (!base64String || typeof base64String !== 'string') return null;

    // If it's already a URL from the DB, return it as-is
    if (base64String.startsWith('http') || base64String.startsWith('/uploads/')) {
        return base64String;
    }

    try {
        let imageBuffer;
        // Extract base64 part
        const matches = base64String.match(/^data:([A-Za-z-+\/]+);base64,(.+)$/);
        if (!matches || matches.length !== 3) {
            // maybe it's raw base64 without prefix? Try to decode if it looks like base64
            if (base64String.length > 200) {
                imageBuffer = Buffer.from(base64String, 'base64');
            } else {
                return base64String; // fallback
            }
        } else {
            imageBuffer = Buffer.from(matches[2], 'base64');
        }

        return await saveImage(imageBuffer, prefix);
    } catch (err) {
        console.error('Error processing image:', err);
        return base64String; // fallback to original if processing fails
    }
};

const saveImage = async (imageBuffer, prefix) => {
    const fileName = `${prefix}-${Date.now()}-${Math.round(Math.random() * 1E9)}.webp`;

    // Ensure uploads directory exists
    const uploadDir = path.join(__dirname, '../uploads/properties');
    if (!fs.existsSync(uploadDir)) {
        fs.mkdirSync(uploadDir, { recursive: true });
    }

    const filePath = path.join(uploadDir, fileName);

    await sharp(imageBuffer)
        .webp({ quality: 80, effort: 4 }) // Compress and convert to webp (lossy compression, good for images)
        .toFile(filePath);

    return `/uploads/properties/${fileName}`;
}

module.exports = { processBase64Image };
