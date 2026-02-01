-- Create property_types table
CREATE TABLE IF NOT EXISTS property_types (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(255) NOT NULL UNIQUE,
  description TEXT,
  sort_order INT DEFAULT 0,
  is_active TINYINT(1) DEFAULT 1,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_sort_order (sort_order),
  INDEX idx_is_active (is_active)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Insert default property types
INSERT INTO property_types (name, description, sort_order, is_active) VALUES
('Room', 'Single room accommodation', 1, 1),
('Apartment', 'Self-contained apartment unit', 2, 1),
('Villa', 'Luxury standalone villa', 3, 1),
('House', 'Complete house for rent', 4, 1)
ON DUPLICATE KEY UPDATE name=name;

