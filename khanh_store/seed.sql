-- Seed roles
INSERT IGNORE INTO roles (name) VALUES
('ADMIN'), ('OWNER'), ('MANAGER'), ('STAFF'), ('CUSTOMER');

-- Default accounts (passwords hashed with bcrypt)
INSERT IGNORE INTO users (username, email, password_hash, role_id) VALUES
('admin', 'admin@khanhstore.com', '$2b$10$LqFBtSQpNX22uqZJ9VxOTunnQzplbBNQipLUxL7A0sytjmUTvnVT', (SELECT id FROM roles WHERE name='ADMIN')),
('owner', 'owner@khanhstore.com', '$2b$10$zzpc0jU6oxWV1MhUbbOdEeUBLnWuL7rdck.n0TLWVbi3a9PKOCuGG', (SELECT id FROM roles WHERE name='OWNER')),
('manager', 'manager@khanhstore.com', '$2b$10$VnRL4SMO3dDP7n4zKzJMMOSF20V997apEEcPzEFieXgDowMSPX2lm', (SELECT id FROM roles WHERE name='MANAGER')),
('staff', 'staff@khanhstore.com', '$2b$10$eaNJ0dgFSHpllYzdGyJj9OkunYlUDKScc33TLMtevCDczj2xmrDE6', (SELECT id FROM roles WHERE name='STAFF')),
('user', 'user@khanhstore.com', '$2b$10$JeQTGKkG3C4L81JE3gbtcuKwMauiwv7BU61G5FBvb0SRnwxFHnE7e', (SELECT id FROM roles WHERE name='CUSTOMER'));

-- Demo categories
INSERT IGNORE INTO categories (name, slug) VALUES
('Electronics','electronics'),
('Fashion','fashion'),
('Home','home'),
('Sports','sports'),
('Books','books'),
('Toys','toys'),
('Beauty','beauty'),
('Automotive','automotive'),
('Garden','garden'),
('Health','health');

-- Demo products (placeholder images)
INSERT IGNORE INTO products (store_id, category_id, name, slug, description, price, stock_quantity, image_url, created_at)
SELECT 1, c.id, CONCAT('Product ', FLOOR(RAND()*1000)), CONCAT('product-', FLOOR(RAND()*1000)), 'Demo product description', ROUND(RAND()*1000,2), FLOOR(RAND()*100), 'https://via.placeholder.com/300', NOW()
FROM categories c
LIMIT 50;

-- Demo customers (linked to CUSTOMER role users)
INSERT IGNORE INTO customers (user_id, full_name, phone, address)
SELECT u.id, CONCAT('Customer ', u.id), '0123456789', 'Demo address'
FROM users u JOIN roles r ON u.role_id = r.id
WHERE r.name='CUSTOMER'
LIMIT 20;

-- Demo orders
INSERT IGNORE INTO orders (customer_id, total_amount, status, created_at)
SELECT c.id, ROUND(RAND()*500,2), 'Pending', NOW()
FROM customers c
LIMIT 20;

-- Order items (random products per order)
INSERT IGNORE INTO order_items (order_id, product_id, quantity, price)
SELECT o.id, p.id, FLOOR(RAND()*5)+1, p.price
FROM orders o
JOIN products p ON p.id = (SELECT id FROM products ORDER BY RAND() LIMIT 1)
LIMIT 100;
