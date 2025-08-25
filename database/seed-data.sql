-- Additional seed data for testing
USE ecommerce_db;

-- Insert more sample products for better testing
INSERT INTO products (title, description, price, image) VALUES 
('Gaming Mouse', 'High-precision gaming mouse with RGB lighting', 79.99, 'https://images.unsplash.com/photo-1527864550417-7fd91fc51a46?w=400'),
('Mechanical Keyboard', 'RGB mechanical keyboard with blue switches', 149.99, 'https://images.unsplash.com/photo-1541140532154-b024d705b90a?w=400'),
('Monitor', '27-inch 4K gaming monitor with HDR support', 399.99, 'https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?w=400'),
('Wireless Speaker', 'Portable Bluetooth speaker with premium sound', 89.99, 'https://images.unsplash.com/photo-1608043152269-423dbba4e7e1?w=400'),
('Fitness Tracker', 'Advanced fitness tracker with heart rate monitoring', 199.99, 'https://images.unsplash.com/photo-1575311373937-040b8e1fd5b6?w=400'),
('Power Bank', '20000mAh portable power bank with fast charging', 49.99, 'https://images.unsplash.com/photo-1609592806596-4d8b5b5e7e0a?w=400'),
('USB-C Hub', 'Multi-port USB-C hub with HDMI and ethernet', 69.99, 'https://images.unsplash.com/photo-1625842268584-8f3296236761?w=400'),
('Webcam', '4K webcam with auto-focus and noise cancellation', 129.99, 'https://images.unsplash.com/photo-1587825140708-dfaf72ae4b04?w=400');

-- Insert sample addresses for testing
INSERT INTO addresses (user_id, name, phone, street, city, pincode, state) VALUES 
(2, 'John Doe', '1234567890', '123 Main Street', 'New York', '10001', 'NY'),
(2, 'John Doe', '1234567890', '456 Oak Avenue', 'Brooklyn', '11201', 'NY');

-- Insert sample orders for testing (assuming user ID 2 exists)
INSERT INTO orders (user_id, total, status) VALUES 
(2, 899.98, 'delivered'),
(2, 249.98, 'shipped'),
(2, 79.99, 'pending');

-- Insert sample order items
INSERT INTO order_items (order_id, product_id, quantity, price) VALUES 
(1, 1, 1, 599.99),
(1, 3, 1, 299.99),
(2, 2, 1, 199.99),
(2, 4, 1, 49.99),
(3, 7, 1, 79.99);
