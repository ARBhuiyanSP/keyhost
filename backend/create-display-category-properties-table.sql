-- Create junction table for many-to-many relationship
-- between display_categories and properties
CREATE TABLE IF NOT EXISTS display_category_properties (
  id INT AUTO_INCREMENT PRIMARY KEY,
  display_category_id INT NOT NULL,
  property_id INT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE KEY unique_category_property (display_category_id, property_id),
  FOREIGN KEY (display_category_id) REFERENCES display_categories(id) ON DELETE CASCADE,
  FOREIGN KEY (property_id) REFERENCES properties(id) ON DELETE CASCADE,
  INDEX idx_display_category_id (display_category_id),
  INDEX idx_property_id (property_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

