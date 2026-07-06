const pool = require('../config/db');

const Store = {
    // 1. Lấy tất cả chi nhánh
    getAll: async () => {
        // Thực hiện JOIN để lấy cả thông tin tên quản lý chi nhánh nếu có
        const [rows] = await pool.query(
            `SELECT s.*, u.username as manager_username 
             FROM stores s 
             LEFT JOIN users u ON s.manager_id = u.id 
             ORDER BY s.id ASC`
        );
        return rows;
    },

    // 2. Tìm chi nhánh theo ID
    findById: async (id) => {
        const [rows] = await pool.query('SELECT * FROM stores WHERE id = ?', [id]);
        return rows[0];
    },

    // 3. Tạo chi nhánh mới
    create: async ({ name, address, phone, manager_id }) => {
        const [result] = await pool.query(
            'INSERT INTO stores (name, address, phone, manager_id) VALUES (?, ?, ?, ?)',
            [name, address, phone || null, manager_id || null]
        );
        return result.insertId;
    },

    // 4. Cập nhật chi nhánh
    update: async (id, { name, address, phone, manager_id }) => {
        const [result] = await pool.query(
            'UPDATE stores SET name = ?, address = ?, phone = ?, manager_id = ? WHERE id = ?',
            [name, address, phone || null, manager_id || null, id]
        );
        return result.affectedRows;
    },

    // 5. Xóa chi nhánh
    delete: async (id) => {
        const [result] = await pool.query('DELETE FROM stores WHERE id = ?', [id]);
        return result.affectedRows;
    }
};

module.exports = Store;
