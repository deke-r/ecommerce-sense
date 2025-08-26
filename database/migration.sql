-- Migration script to add categories functionality
USE ecommerce_db;

-- Create categories table if it doesn't exist
CREATE TABLE IF NOT EXISTS categories (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    description TEXT NULL,
    is_active TINYINT(1) NOT NULL DEFAULT 1,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Add category_id column to products table if it doesn't exist
ALTER TABLE products ADD COLUMN IF NOT EXISTS category_id INT;
ALTER TABLE products ADD CONSTRAINT IF NOT EXISTS fk_product_category 
    FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE SET NULL;

-- Add stocks column to products table if it doesn't exist
ALTER TABLE products ADD COLUMN IF NOT EXISTS stocks INT DEFAULT 0;

-- Create product_images table if it doesn't exist
CREATE TABLE IF NOT EXISTS product_images (
    id INT AUTO_INCREMENT PRIMARY KEY,
    product_id INT NOT NULL,
    image_url VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE
);

-- Insert sample categories if they don't exist
INSERT IGNORE INTO categories (name, description, is_active) VALUES 
('Electronics', 'Electronic devices and gadgets', 1),
('Computers', 'Computers, laptops, and accessories', 1),
('Mobile Devices', 'Smartphones, tablets, and mobile accessories', 1),
('Audio', 'Headphones, speakers, and audio equipment', 1),
('Photography', 'Cameras, lenses, and photography gear', 1),
('Gaming', 'Gaming consoles, games, and accessories', 1),
('Fitness', 'Fitness trackers and health monitoring devices', 1),
('Accessories', 'Various tech accessories and peripherals', 1);

-- Update existing products with category assignments
UPDATE products SET category_id = 1 WHERE title IN ('Smartphone', 'Laptop', 'Headphones', 'Watch', 'Camera', 'Tablet');
UPDATE products SET category_id = 2 WHERE title IN ('Gaming Mouse', 'Mechanical Keyboard', 'Monitor', 'USB-C Hub');
UPDATE products SET category_id = 1 WHERE title IN ('Wireless Speaker', 'Webcam');
UPDATE products SET category_id = 6 WHERE title IN ('Fitness Tracker');
UPDATE products SET category_id = 8 WHERE title IN ('Power Bank');

-- Set default stocks for existing products
UPDATE products SET stocks = 100 WHERE stocks IS NULL OR stocks = 0; 