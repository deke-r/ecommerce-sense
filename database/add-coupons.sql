-- Add coupon tables to existing database
USE ecommerce_db;

-- Coupons table
CREATE TABLE IF NOT EXISTS coupons (
    id INT AUTO_INCREMENT PRIMARY KEY,
    code VARCHAR(50) UNIQUE NOT NULL,
    description TEXT,
    discount_type ENUM('percentage', 'fixed') NOT NULL,
    discount_value DECIMAL(10, 2) NOT NULL,
    min_order_amount DECIMAL(10, 2) DEFAULT 0,
    max_discount_amount DECIMAL(10, 2) NULL,
    usage_limit INT DEFAULT NULL,
    used_count INT DEFAULT 0,
    is_active TINYINT(1) DEFAULT 1,
    valid_from TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    valid_until TIMESTAMP NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Coupon usage tracking table
CREATE TABLE IF NOT EXISTS coupon_usage (
    id INT AUTO_INCREMENT PRIMARY KEY,
    coupon_id INT NOT NULL,
    user_id INT NOT NULL,
    order_id INT NULL,
    used_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (coupon_id) REFERENCES coupons(id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE SET NULL,
    UNIQUE KEY unique_user_coupon_order (user_id, coupon_id, order_id)
);

-- Insert sample coupons
INSERT INTO coupons (code, description, discount_type, discount_value, min_order_amount, max_discount_amount, usage_limit, valid_until) VALUES
('WELCOME10', 'Welcome discount for new customers', 'percentage', 10.00, 500.00, 200.00, 100, DATE_ADD(NOW(), INTERVAL 30 DAY)),
('SAVE50', 'Flat ₹50 off on orders above ₹1000', 'fixed', 50.00, 1000.00, NULL, 50, DATE_ADD(NOW(), INTERVAL 15 DAY)),
('MEGA20', '20% off on orders above ₹2000', 'percentage', 20.00, 2000.00, 500.00, 25, DATE_ADD(NOW(), INTERVAL 7 DAY)),
('FIRST100', '₹100 off for first-time buyers', 'fixed', 100.00, 1500.00, NULL, 200, DATE_ADD(NOW(), INTERVAL 60 DAY)),
('FLASH15', '15% off on all orders', 'percentage', 15.00, 300.00, 300.00, 1000, DATE_ADD(NOW(), INTERVAL 3 DAY));
