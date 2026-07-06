const pool = require('../config/db');

const Product = {
    // 1. READ ALL (Hỗ trợ Search, Filter, Pagination)
    findAll: async ({ search, category_id, store_id, min_price, max_price, limit, offset }) => {
        let query = `SELECT p.*, c.name as category_name, s.name as store_name 
                     FROM products p 
                     JOIN categories c ON p.category_id = c.id 
                     JOIN stores s ON p.store_id = s.id 
                     WHERE 1=1`;
        let countQuery = 'SELECT COUNT(*) as total FROM products p WHERE 1=1';
        const params = [];

        if (search) {
            query += ' AND p.name LIKE ?';
            countQuery += ' AND p.name LIKE ?';
            params.push(`%${search}%`);
        }
        if (category_id) {
            query += ' AND p.category_id = ?';
            countQuery += ' AND p.category_id = ?';
            params.push(category_id);
        }
        if (store_id) {
            query += ' AND p.store_id = ?';
            countQuery += ' AND p.store_id = ?';
            params.push(store_id);
        }
        if (min_price) {
            query += ' AND p.price >= ?';
            countQuery += ' AND p.price >= ?';
            params.push(min_price);
        }
        if (max_price) {
            query += ' AND p.price <= ?';
            countQuery += ' AND p.price <= ?';
            params.push(max_price);
        }

        query += ' ORDER BY p.created_at DESC LIMIT ? OFFSET ?';
        const [rows] = await pool.query(query, [...params, parseInt(limit), parseInt(offset)]);
        const [countResult] = await pool.query(countQuery, params);

        return {
            data: rows,
            total: countResult[0].total
        };
    },

    // 2. READ ONE
    findById: async (id) => {
        const [rows] = await pool.query(
            `SELECT p.*, c.name as category_name, s.name as store_name 
             FROM products p 
             JOIN categories c ON p.category_id = c.id 
             JOIN stores s ON p.store_id = s.id 
             WHERE p.id = ?`,
            [id]
        );
        return rows[0];
    },

    // 3. CREATE
    create: async (productData) => {
        const { store_id, category_id, name, slug, description, price, stock_quantity, image_url } = productData;
        const [result] = await pool.query(
            `INSERT INTO products (store_id, category_id, name, slug, description, price, stock_quantity, image_url) 
             VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
            [store_id, category_id, name, slug, description, price, stock_quantity, image_url]
        );
        return result.insertId;
    },

    // 4. UPDATE (Cập nhật thông tin sản phẩm)
    // Bảo mật: Sử dụng whitelist để ngăn chặn SQL Injection qua việc gán key động từ Client
    update: async (id, productData) => {
        const fields = [];
        const values = [];
        const allowedKeys = ['store_id', 'category_id', 'name', 'slug', 'description', 'price', 'stock_quantity', 'image_url'];
        
        // Build câu lệnh SQL tự động dựa vào các field được whitelist gửi lên
        for (const [key, value] of Object.entries(productData)) {
            if (allowedKeys.includes(key) && value !== undefined) {
                fields.push(`\`${key}\` = ?`); // Dùng backtick để bảo vệ các tên cột trùng từ khóa SQL
                values.push(value);
            }
        }
        
        if (fields.length === 0) return 0; // Không có trường nào hợp lệ để update
        
        values.push(id);
        const query = `UPDATE products SET ${fields.join(', ')} WHERE id = ?`;
        
        const [result] = await pool.query(query, values);
        return result.affectedRows; // Trả về số dòng bị ảnh hưởng
    },

    // 5. DELETE
    delete: async (id) => {
        const [result] = await pool.query('DELETE FROM products WHERE id = ?', [id]);
        return result.affectedRows;
    }
};

module.exports = Product;
