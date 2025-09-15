-- Migration script to add cart abandonment functionality
-- Run this script on your existing database

USE ecommerce_db;

-- Add cart abandonment tracking table
CREATE TABLE IF NOT EXISTS cart_abandonment (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    cart_data JSON NOT NULL,
    last_updated TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    email_sent_at TIMESTAMP NULL,
    email_type ENUM('first_reminder', 'second_reminder', 'final_reminder') NULL,
    is_purchased TINYINT(1) DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Add stocks column to products table if it doesn't exist
ALTER TABLE products ADD COLUMN IF NOT EXISTS stocks INT DEFAULT 0;

-- Update existing products to have some stock (optional)
UPDATE products SET stocks = 100 WHERE stocks = 0 OR stocks IS NULL;

-- Create index for better performance
CREATE INDEX idx_cart_abandonment_user_id ON cart_abandonment(user_id);
CREATE INDEX idx_cart_abandonment_last_updated ON cart_abandonment(last_updated);
CREATE INDEX idx_cart_abandonment_email_sent ON cart_abandonment(email_sent_at);

-- Verify the table was created successfully
SELECT 'Cart abandonment table created successfully' as status;
