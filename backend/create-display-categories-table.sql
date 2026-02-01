-- Create display_categories table
CREATE TABLE IF NOT EXISTS display_categories (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(255) NOT NULL UNIQUE,
  description TEXT,
  sort_order INT DEFAULT 0,
  is_active TINYINT(1) DEFAULT 1,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_sort_order (sort_order),
  INDEX idx_is_active (is_active)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Add display_category_id column to properties table (run this only if column doesn't exist)
-- Check if column exists first, if not, run the ALTER TABLE command
ALTER TABLE properties 
ADD COLUMN display_category_id INT NULL;

-- Add foreign key constraint (run this only if constraint doesn't exist)
ALTER TABLE properties 
ADD CONSTRAINT fk_properties_display_category 
  FOREIGN KEY (display_category_id) 
  REFERENCES display_categories(id) 
  ON DELETE SET NULL;

-- Add index for better query performance (run this only if index doesn't exist)
CREATE INDEX idx_properties_display_category ON properties(display_category_id);

