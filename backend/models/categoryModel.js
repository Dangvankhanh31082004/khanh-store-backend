const pool = require('../config/db');

const Category = {
    getAll: async () => {
        const [rows] = await pool.query(
            `SELECT c.*, COUNT(p.id) as product_count 
             FROM categories c 
             LEFT JOIN products p ON p.category_id = c.id 
             GROUP BY c.id 
             ORDER BY c.name ASC`
        );
        return rows;
    },

    findById: async (id) => {
        const [rows] = await pool.query('SELECT * FROM categories WHERE id = ?', [id]);
        return rows[0];
    },

    // 3. Tạo danh mục mới (Chỉ Admin/Staff)
    create: async ({ name, slug, description, parent_id }) => {
        const [result] = await pool.query(
            'INSERT INTO categories (name, slug, description, parent_id) VALUES (?, ?, ?, ?)',
            [name, slug, description, parent_id || null]
        );
        return result.insertId;
    },

    // 4. Cập nhật thông tin danh mục (Chỉ Admin/Staff)
    update: async (id, { name, slug, description, parent_id }) => {
        const [result] = await pool.query(
            'UPDATE categories SET name = ?, slug = ?, description = ?, parent_id = ? WHERE id = ?',
            [name, slug, description, parent_id || null, id]
        );
        return result.affectedRows;
    },

    // 5. Xóa danh mục (Chỉ Admin/Staff)
    delete: async (id) => {
        const [result] = await pool.query('DELETE FROM categories WHERE id = ?', [id]);
        return result.affectedRows;
    }
};

module.exports = Category;
