const bcrypt = require('bcrypt');
const pool = require('../config/db');

const User = {
    findByEmail: async (email) => {
        const [rows] = await pool.query(
            `SELECT u.*, r.name as role_name, c.full_name, c.phone, c.address 
             FROM users u 
             JOIN roles r ON u.role_id = r.id 
             LEFT JOIN customers c ON c.user_id = u.id 
             WHERE u.email = ?`, 
            [email]
        );
        return rows[0];
    },
    
    findByUsername: async (username) => {
        const [rows] = await pool.query(
            `SELECT u.*, r.name as role_name, c.full_name, c.phone, c.address 
             FROM users u 
             JOIN roles r ON u.role_id = r.id 
             LEFT JOIN customers c ON c.user_id = u.id 
             WHERE u.username = ?`, 
            [username]
        );
        return rows[0];
    },

    findById: async (id) => {
        const [rows] = await pool.query(
            `SELECT u.id, u.username, u.email, u.is_active, u.created_at, r.name as role_name, c.full_name, c.phone, c.address 
             FROM users u 
             JOIN roles r ON u.role_id = r.id 
             LEFT JOIN customers c ON c.user_id = u.id 
             WHERE u.id = ?`, 
            [id]
        );
        return rows[0];
    },
    
    getRoleByName: async (roleName) => {
        const [rows] = await pool.query('SELECT id FROM roles WHERE LOWER(name) = LOWER(?)', [roleName]);
        return rows[0];
    },
    
    create: async (userData) => {
        const { username, email, password_hash, role_id } = userData;
        const [result] = await pool.query(
            'INSERT INTO users (username, email, password_hash, role_id) VALUES (?, ?, ?, ?)',
            [username, email, password_hash, role_id]
        );
        return result.insertId;
    },
    
    createCustomerProfile: async (userId, fullName) => {
        await pool.query(
            'INSERT INTO customers (user_id, full_name) VALUES (?, ?)',
            [userId, fullName]
        );
    },

    updateProfile: async (userId, updateData) => {
        const connection = await pool.getConnection();
        try {
            await connection.beginTransaction();
            const { full_name, phone, address, password } = updateData;

            if (password) {
                const hashedPassword = await bcrypt.hash(password, await bcrypt.genSalt(10));
                await connection.query('UPDATE users SET password_hash = ? WHERE id = ?', [hashedPassword, userId]);
            }

            const [customerRows] = await connection.query('SELECT id FROM customers WHERE user_id = ?', [userId]);
            if (customerRows.length > 0) {
                await connection.query(
                    'UPDATE customers SET full_name = COALESCE(?, full_name), phone = COALESCE(?, phone), address = COALESCE(?, address) WHERE user_id = ?',
                    [full_name, phone, address, userId]
                );
            } else if (full_name || phone || address) {
                await connection.query(
                    'INSERT INTO customers (user_id, full_name, phone, address) VALUES (?, ?, ?, ?)',
                    [userId, full_name || '', phone || null, address || null]
                );
            }

            await connection.commit();
            return await User.findById(userId);
        } catch (error) {
            await connection.rollback();
            throw error;
        } finally {
            connection.release();
        }
    }
};

module.exports = User;
