const pool = require('../config/db');

const Customer = {
    findAll: async ({ search, role, limit, offset }) => {
        let query = `
            SELECT u.id, u.username, u.email, u.created_at, r.name as role, c.full_name, c.phone, c.address
            FROM users u
            JOIN roles r ON u.role_id = r.id
            LEFT JOIN customers c ON c.user_id = u.id
            WHERE 1=1`;
        let countQuery = `SELECT COUNT(*) as total FROM users u JOIN roles r ON u.role_id = r.id LEFT JOIN customers c ON c.user_id = u.id WHERE 1=1`;
        const params = [];

        if (role) {
            const normalized = role.toLowerCase();
            if (normalized === 'admin') {
                query += " AND LOWER(r.name) IN ('admin','staff','manager','owner')";
                countQuery += " AND LOWER(r.name) IN ('admin','staff','manager','owner')";
            } else {
                query += ' AND LOWER(r.name) = ?';
                countQuery += ' AND LOWER(r.name) = ?';
                params.push(normalized);
            }
        }

        if (search) {
            query += ' AND (u.email LIKE ? OR u.username LIKE ? OR c.full_name LIKE ?)';
            countQuery += ' AND (u.email LIKE ? OR u.username LIKE ? OR c.full_name LIKE ?)';
            const term = `%${search}%`;
            params.push(term, term, term);
        }

        query += ' ORDER BY u.created_at DESC LIMIT ? OFFSET ?';
        const [rows] = await pool.query(query, [...params, parseInt(limit), parseInt(offset)]);
        const [countResult] = await pool.query(countQuery, params);

        return {
            data: rows,
            total: countResult[0].total
        };
    }
};

module.exports = Customer;
