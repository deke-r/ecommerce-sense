-- Comprehensive migration for new ecommerce features
USE ecommerce_db;

-- 1. Create brands table
CREATE TABLE IF NOT EXISTS brands (
    id INT AUTO_INCREMENT PRIMARY KEY,
    brand_name VARCHAR(255) NOT NULL UNIQUE,
    brand_image VARCHAR(255) NULL,
    is_active TINYINT(1) DEFAULT 1,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- 2. Add brand columns to products table
ALTER TABLE products ADD COLUMN IF NOT EXISTS brand_id INT NULL;
ALTER TABLE products ADD COLUMN IF NOT EXISTS brand_name VARCHAR(255) NULL;
ALTER TABLE products ADD CONSTRAINT IF NOT EXISTS fk_product_brand 
    FOREIGN KEY (brand_id) REFERENCES brands(id) ON DELETE SET NULL;

-- 3. Create product sizes table for size variations
CREATE TABLE IF NOT EXISTS product_sizes (
    id INT AUTO_INCREMENT PRIMARY KEY,
    product_id INT NOT NULL,
    size_name VARCHAR(50) NOT NULL,
    size_value VARCHAR(20) NOT NULL,
    additional_price DECIMAL(10, 2) DEFAULT 0.00,
    stock_quantity INT DEFAULT 0,
    is_available TINYINT(1) DEFAULT 1,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE,
    UNIQUE KEY unique_product_size (product_id, size_value)
);

-- 4. Add size-related columns to products table
ALTER TABLE products ADD COLUMN IF NOT EXISTS has_sizes TINYINT(1) DEFAULT 0;
ALTER TABLE products ADD COLUMN IF NOT EXISTS size_category ENUM('clothing', 'footwear', 'accessories', 'none') DEFAULT 'none';

-- 5. Add size selection to cart table
ALTER TABLE cart ADD COLUMN IF NOT EXISTS selected_size VARCHAR(20) NULL;

-- 6. Add size selection to order_items table
ALTER TABLE order_items ADD COLUMN IF NOT EXISTS selected_size VARCHAR(20) NULL;

-- 7. Insert sample brands
INSERT IGNORE INTO brands (brand_name, is_active) VALUES 
('Apple', 1),
('Samsung', 1),
('Nike', 1),
('Adidas', 1),
('Sony', 1),
('LG', 1),
('Dell', 1),
('HP', 1),
('Canon', 1),
('Nikon', 1),
('Generic', 1);

-- 8. Update existing products with sample brand assignments
UPDATE products SET brand_id = 1, brand_name = 'Apple' WHERE title LIKE '%iPhone%' OR title LIKE '%iPad%' OR title LIKE '%MacBook%';
UPDATE products SET brand_id = 2, brand_name = 'Samsung' WHERE title LIKE '%Samsung%' OR title LIKE '%Galaxy%';
UPDATE products SET brand_id = 5, brand_name = 'Sony' WHERE title LIKE '%Sony%' OR title LIKE '%PlayStation%';
UPDATE products SET brand_id = 11, brand_name = 'Generic' WHERE brand_id IS NULL;

-- 9. Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_products_brand_id ON products(brand_id);
CREATE INDEX IF NOT EXISTS idx_product_sizes_product_id ON product_sizes(product_id);
CREATE INDEX IF NOT EXISTS idx_brands_active ON brands(is_active);

-- 10. Update review system - ensure review images table exists with proper structure
ALTER TABLE review_images MODIFY COLUMN image_url VARCHAR(255) NOT NULL;

SELECT 'Comprehensive migration completed successfully!' as status;
