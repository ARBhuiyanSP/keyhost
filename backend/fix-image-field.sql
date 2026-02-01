-- Fix property_images table to support large base64 images

-- Current: TEXT field = max 65KB
-- Problem: Base64 images are much larger
-- Solution: Change to MEDIUMTEXT or LONGTEXT

ALTER TABLE property_images 
MODIFY COLUMN image_url LONGTEXT;

-- Verify the change
DESCRIBE property_images;

-- Check existing data
SELECT 
    id,
    property_id,
    image_type,
    LENGTH(image_url) as url_length,
    LEFT(image_url, 50) as preview
FROM property_images
ORDER BY property_id DESC, sort_order
LIMIT 10;



