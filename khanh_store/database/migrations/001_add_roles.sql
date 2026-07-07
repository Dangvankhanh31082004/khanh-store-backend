-- Migration: thêm role MANAGER và OWNER nếu chưa tồn tại
INSERT INTO roles (name, description)
SELECT 'MANAGER', 'Quản lý cửa hàng'
FROM DUAL
WHERE NOT EXISTS (SELECT 1 FROM roles WHERE LOWER(name) = 'manager');

INSERT INTO roles (name, description)
SELECT 'OWNER', 'Chủ cửa hàng'
FROM DUAL
WHERE NOT EXISTS (SELECT 1 FROM roles WHERE LOWER(name) = 'owner');
