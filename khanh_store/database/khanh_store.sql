CREATE DATABASE IF NOT EXISTS khanh_store DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE khanh_store;

-- =======================================
-- 1. BẢNG ROLES
-- =======================================
CREATE TABLE roles (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(50) NOT NULL UNIQUE,
    description VARCHAR(255)
);

-- =======================================
-- 2. BẢNG USERS
-- =======================================
CREATE TABLE users (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(50) NOT NULL UNIQUE,
    email VARCHAR(100) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    role_id INT NOT NULL,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_users_roles 
        FOREIGN KEY (role_id) REFERENCES roles(id) 
        ON DELETE RESTRICT 
        ON UPDATE CASCADE,
    INDEX idx_user_email (email),
    INDEX idx_user_username (username)
);

-- =======================================
-- 3. BẢNG CUSTOMERS
-- =======================================
CREATE TABLE customers (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    user_id BIGINT NOT NULL UNIQUE,
    full_name VARCHAR(100) NOT NULL,
    phone VARCHAR(20),
    address VARCHAR(255),
    CONSTRAINT fk_customers_users 
        FOREIGN KEY (user_id) REFERENCES users(id) 
        ON DELETE CASCADE 
        ON UPDATE CASCADE,
    INDEX idx_customer_phone (phone)
);

-- =======================================
-- 4. BẢNG STORES
-- =======================================
CREATE TABLE stores (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    address VARCHAR(255) NOT NULL,
    phone VARCHAR(20),
    manager_id BIGINT,
    CONSTRAINT fk_stores_users_manager 
        FOREIGN KEY (manager_id) REFERENCES users(id) 
        ON DELETE SET NULL 
        ON UPDATE CASCADE
);

-- =======================================
-- 5. BẢNG CATEGORIES
-- =======================================
CREATE TABLE categories (
    id INT AUTO_INCREMENT PRIMARY KEY,
    parent_id INT NULL,
    name VARCHAR(100) NOT NULL,
    slug VARCHAR(100) NOT NULL UNIQUE,
    description TEXT,
    CONSTRAINT fk_categories_parent 
        FOREIGN KEY (parent_id) REFERENCES categories(id) 
        ON DELETE SET NULL 
        ON UPDATE CASCADE,
    INDEX idx_category_slug (slug)
);

-- =======================================
-- 6. BẢNG PRODUCTS
-- =======================================
CREATE TABLE products (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    store_id INT NOT NULL,
    category_id INT NOT NULL,
    name VARCHAR(255) NOT NULL,
    slug VARCHAR(255) NOT NULL UNIQUE,
    description TEXT,
    price DECIMAL(15,2) NOT NULL,
    stock_quantity INT NOT NULL DEFAULT 0,
    image_url VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT fk_products_stores 
        FOREIGN KEY (store_id) REFERENCES stores(id) 
        ON DELETE CASCADE 
        ON UPDATE CASCADE,
    CONSTRAINT fk_products_categories 
        FOREIGN KEY (category_id) REFERENCES categories(id) 
        ON DELETE RESTRICT 
        ON UPDATE CASCADE,
    INDEX idx_product_slug (slug),
    INDEX idx_product_category (category_id),
    INDEX idx_product_store (store_id)
);

-- =======================================
-- 7. BẢNG ORDERS
-- =======================================
CREATE TABLE orders (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    customer_id BIGINT NOT NULL,
    store_id INT NOT NULL,
    order_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    status ENUM('PENDING', 'PROCESSING', 'SHIPPED', 'DELIVERED', 'CANCELLED') DEFAULT 'PENDING',
    total_amount DECIMAL(15,2) NOT NULL,
    shipping_address VARCHAR(255) NOT NULL,
    payment_method VARCHAR(50) NOT NULL,
    notes TEXT,
    CONSTRAINT fk_orders_customers 
        FOREIGN KEY (customer_id) REFERENCES customers(id) 
        ON DELETE RESTRICT 
        ON UPDATE CASCADE,
    CONSTRAINT fk_orders_stores 
        FOREIGN KEY (store_id) REFERENCES stores(id) 
        ON DELETE RESTRICT 
        ON UPDATE CASCADE,
    INDEX idx_order_customer (customer_id),
    INDEX idx_order_store (store_id),
    INDEX idx_order_status (status),
    INDEX idx_order_date (order_date)
);

-- =======================================
-- 8. BẢNG ORDER_DETAILS
-- =======================================
CREATE TABLE order_details (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    order_id BIGINT NOT NULL,
    product_id BIGINT NOT NULL,
    quantity INT NOT NULL,
    unit_price DECIMAL(15,2) NOT NULL,
    CONSTRAINT fk_orderdetails_orders 
        FOREIGN KEY (order_id) REFERENCES orders(id) 
        ON DELETE CASCADE 
        ON UPDATE CASCADE,
    CONSTRAINT fk_orderdetails_products 
        FOREIGN KEY (product_id) REFERENCES products(id) 
        ON DELETE RESTRICT 
        ON UPDATE CASCADE,
    UNIQUE INDEX uq_order_product (order_id, product_id)
);


-- =======================================
-- INSERT DỮ LIỆU MẪU (MOCK DATA)
-- =======================================

-- 1. Insert Roles
INSERT INTO roles (name, description) VALUES 
('ADMIN', 'Quản trị viên toàn hệ thống'),
('STAFF', 'Nhân viên cửa hàng'),
('CUSTOMER', 'Khách hàng');

-- 2. Insert Dummy Users
-- Admin
INSERT INTO users (id, username, email, password_hash, role_id) VALUES 
(1, 'admin', 'admin@khanhstore.com', '$2b$10$KMyZwCeXqh0NHrsbkTME9uaJtxwMLINz0HmZUjTLYBCpm9EMi.MNi', 1);

-- Customer
INSERT INTO users (id, username, email, password_hash, role_id) VALUES 
(2, 'user', 'user@khanhstore.com', '$2b$10$KMyZwCeXqh0NHrsbkTME9uaJtxwMLINz0HmZUjTLYBCpm9EMi.MNi', 3);

-- Customer Profile
INSERT INTO customers (user_id, full_name, phone, address) VALUES 
(2, 'Khách Hàng A', '0987654321', '123 Cầu Giấy, Hà Nội');

-- 3. Insert Stores
INSERT INTO stores (name, address, phone, manager_id) VALUES 
('KHÁNH STORE - CS1', '123 Cầu Giấy, Hà Nội', '0987654321', 1),
('KHÁNH STORE - CS2', '456 Quận 1, TP.HCM', '0912345678', 1);

-- 4. Insert Categories
-- Danh mục cha
INSERT INTO categories (id, parent_id, name, slug, description) VALUES 
(1, NULL, 'Laptop', 'laptop', 'Máy tính xách tay các hãng'),
(2, NULL, 'PC', 'pc', 'Máy tính để bàn, PC lắp ráp'),
(3, NULL, 'Linh Kiện PC', 'linh-kien-pc', 'Linh kiện rời để ráp PC'),
(4, NULL, 'Gaming Gear', 'gaming-gear', 'Phụ kiện dành cho game thủ'),
(5, NULL, 'Màn Hình', 'man-hinh', 'Màn hình máy tính');

-- Danh mục con
INSERT INTO categories (id, parent_id, name, slug, description) VALUES 
(6, 4, 'Chuột Máy Tính', 'chuot-may-tinh', 'Chuột gaming, chuột văn phòng'),
(7, 4, 'Bàn Phím', 'ban-phim', 'Bàn phím cơ, bàn phím giả cơ'),
(8, 4, 'Tai Nghe', 'tai-nghe', 'Tai nghe gaming, true wireless'),
(9, 3, 'SSD', 'ssd', 'Ổ cứng thể rắn SSD'),
(10, 3, 'RAM', 'ram', 'Bộ nhớ trong RAM'),
(11, 3, 'CPU', 'cpu', 'Vi xử lý trung tâm'),
(12, 3, 'Mainboard', 'mainboard', 'Bo mạch chủ');

-- 5. Insert Products (33 Sản phẩm Công Nghệ)
INSERT INTO products (store_id, category_id, name, slug, description, price, stock_quantity, image_url) VALUES 
-- Nhóm Laptop (Category 1)
(1, 1, 'MacBook Pro 14 M3 2023', 'macbook-pro-14-m3-2023', 'MacBook Pro 14 inch M3 8-Core CPU 10-Core GPU 8GB 512GB', 39990000, 10, '/images/laptop-macbook-pro.jpg'),
(1, 1, 'Dell XPS 15 9530', 'dell-xps-15-9530', 'Dell XPS 15 Intel Core i7-13700H, 16GB, 512GB SSD, RTX 4050', 45000000, 5, '/images/laptop-dell-xps.jpg'),
(2, 1, 'Lenovo ThinkPad X1 Carbon Gen 11', 'lenovo-thinkpad-x1-carbon-gen-11', 'Lenovo ThinkPad X1 Carbon Intel Core i7, 16GB RAM', 42000000, 8, '/images/laptop-thinkpad.jpg'),
(2, 1, 'ASUS ROG Strix G16', 'asus-rog-strix-g16', 'Laptop Gaming ASUS ROG Strix G16 i7-13650HX, RTX 4060', 35990000, 15, '/images/laptop-rog.jpg'),

-- Nhóm PC (Category 2)
(1, 2, 'PC Gaming KHANH-01 (i5-12400F/RTX 3060)', 'pc-gaming-khanh-01', 'PC Gaming lắp ráp sẵn, cấu hình i5 12400F, RTX 3060 12GB', 16500000, 20, '/images/pc-01.jpg'),
(1, 2, 'PC Office KHANH-02 (i3-12100/8GB/256GB)', 'pc-office-khanh-02', 'PC Văn phòng nhỏ gọn, hoạt động ổn định', 6500000, 50, '/images/pc-02.jpg'),
(2, 2, 'PC Workstation AI (i9-14900K/RTX 4090)', 'pc-workstation-ai', 'Máy trạm cao cấp render, AI, đồ họa nặng', 120000000, 2, '/images/pc-03.jpg'),

-- Nhóm Chuột (Category 6)
(1, 6, 'Logitech G Pro X Superlight', 'logitech-g-pro-x-superlight', 'Chuột gaming không dây siêu nhẹ 63g', 2890000, 30, '/images/mouse-logi-pro.jpg'),
(2, 6, 'Razer DeathAdder V3 Pro', 'razer-deathadder-v3-pro', 'Chuột không dây Razer form công thái học', 3500000, 25, '/images/mouse-da-v3.jpg'),
(1, 6, 'Logitech MX Master 3S', 'logitech-mx-master-3s', 'Chuột văn phòng cao cấp, cuộn từ tính', 2500000, 40, '/images/mouse-mx3s.jpg'),
(1, 6, 'Razer Viper V2 Pro', 'razer-viper-v2-pro', 'Chuột đối xứng siêu nhẹ cho Esports', 3200000, 20, '/images/mouse-viper.jpg'),

-- Nhóm Bàn phím (Category 7)
(1, 7, 'Bàn phím cơ Akko 3098B Multi-modes', 'akko-3098b', 'Bàn phím cơ Akko kết nối 3 mode, switch xịn', 1890000, 50, '/images/kb-akko.jpg'),
(2, 7, 'Keychron Q1 Pro', 'keychron-q1-pro', 'Bàn phím cơ custom nhôm nguyên khối có dây/không dây', 4500000, 15, '/images/kb-keychron.jpg'),
(1, 7, 'Razer BlackWidow V4 Pro', 'razer-blackwidow-v4-pro', 'Bàn phím cơ full size nhiều macro key, RGB chói lóa', 5500000, 10, '/images/kb-razer.jpg'),
(2, 7, 'Corsair K70 RGB PRO', 'corsair-k70-rgb-pro', 'Bàn phím cơ gaming khung nhôm, Cherry MX', 3990000, 20, '/images/kb-corsair.jpg'),

-- Nhóm SSD (Category 9)
(1, 9, 'SSD Samsung 980 PRO 1TB PCIe 4.0', 'ssd-samsung-980-pro-1tb', 'Ổ cứng SSD NVMe tốc độ cao 7000MB/s', 2490000, 60, '/images/ssd-ss.jpg'),
(1, 9, 'SSD WD Black SN850X 1TB', 'ssd-wd-black-sn850x-1tb', 'Ổ cứng SSD NVMe chuyên game', 2650000, 45, '/images/ssd-wd.jpg'),
(2, 9, 'SSD Kingston NV2 500GB PCIe 4.0', 'ssd-kingston-nv2-500gb', 'Ổ cứng SSD NVMe quốc dân giá rẻ', 990000, 100, '/images/ssd-kingston.jpg'),

-- Nhóm RAM (Category 10)
(1, 10, 'RAM Corsair Vengeance RGB 32GB (2x16GB) DDR5 6000MHz', 'ram-corsair-vengeance-rgb-32gb-ddr5', 'Kit RAM DDR5 hiệu năng cao', 3200000, 40, '/images/ram-corsair.jpg'),
(2, 10, 'RAM G.Skill Trident Z5 RGB 32GB (2x16GB) 6400MHz', 'ram-gskill-trident-z5-rgb-32gb', 'RAM DDR5 cao cấp cho dân chơi PC', 3800000, 30, '/images/ram-gskill.jpg'),
(1, 10, 'RAM Kingston FURY Beast 16GB (2x8GB) DDR4 3200MHz', 'ram-kingston-fury-beast-16gb-ddr4', 'RAM DDR4 giá rẻ cho PC phổ thông', 1100000, 80, '/images/ram-kingston.jpg'),

-- Nhóm CPU (Category 11)
(1, 11, 'CPU Intel Core i9-14900K', 'cpu-intel-core-i9-14900k', 'Vi xử lý flagship thế hệ 14 của Intel', 14500000, 10, '/images/cpu-i9.jpg'),
(1, 11, 'CPU AMD Ryzen 7 7800X3D', 'cpu-amd-ryzen-7-7800x3d', 'Vi xử lý Gaming tốt nhất thế giới hiện tại', 9800000, 15, '/images/cpu-amd.jpg'),
(2, 11, 'CPU Intel Core i5-13400F', 'cpu-intel-core-i5-13400f', 'Vi xử lý quốc dân cho PC Gaming tầm trung', 4900000, 50, '/images/cpu-i5.jpg'),

-- Nhóm Mainboard (Category 12)
(1, 12, 'Mainboard ASUS ROG MAXIMUS Z790 HERO', 'main-asus-rog-maximus-z790-hero', 'Bo mạch chủ siêu cao cấp cho chip Intel 13/14', 16000000, 5, '/images/main-asus.jpg'),
(1, 12, 'Mainboard MSI MAG B760M MORTAR WIFI', 'main-msi-mag-b760m', 'Bo mạch chủ M-ATX tầm trung linh kiện tốt', 4200000, 35, '/images/main-msi.jpg'),
(2, 12, 'Mainboard GIGABYTE B650 AORUS ELITE AX', 'main-gigabyte-b650-aorus-elite-ax', 'Bo mạch chủ ATX socket AM5 cho AMD Ryzen 7000', 5500000, 20, '/images/main-giga.jpg'),

-- Nhóm Tai nghe (Category 8)
(1, 8, 'Tai nghe HyperX Cloud III', 'hyperx-cloud-iii', 'Tai nghe gaming cực kỳ thoải mái', 2490000, 40, '/images/hp-hyperx.jpg'),
(2, 8, 'Tai nghe Sony WH-1000XM5', 'sony-wh-1000xm5', 'Tai nghe chống ồn chủ động không dây đỉnh cao', 7500000, 15, '/images/hp-sony.jpg'),
(1, 8, 'Tai nghe Razer Kraken V3', 'razer-kraken-v3', 'Tai nghe gaming có haptic feedback', 2700000, 25, '/images/hp-razer.jpg'),

-- Nhóm Màn hình (Category 5)
(1, 5, 'Màn hình LG UltraGear 27GN800-B 27" 2K 144Hz', 'lg-ultragear-27gn800', 'Màn hình gaming 2K IPS 144Hz giá rẻ', 6500000, 30, '/images/mon-lg.jpg'),
(2, 5, 'Màn hình ASUS TUF Gaming VG27AQL1A 27" 2K 170Hz', 'asus-tuf-vg27aql1a', 'Màn hình gaming màu sắc đẹp, tần số quét cao', 7800000, 20, '/images/mon-asus.jpg'),
(1, 5, 'Màn hình Dell UltraSharp U2723QE 27" 4K', 'dell-ultrasharp-u2723qe', 'Màn hình 4K chuẩn màu sắc cho đồ họa', 14500000, 15, '/images/mon-dell.jpg');
