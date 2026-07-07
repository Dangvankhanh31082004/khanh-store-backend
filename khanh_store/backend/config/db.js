const mysql = require('mysql2/promise');
const dotenv = require('dotenv');

dotenv.config();

// Khởi tạo Connection Pool cho MySQL
const pool = mysql.createPool({
    host: process.env.DB_HOST,
    port: parseInt(process.env.DB_PORT, 10) || 3306,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    waitForConnections: true,
    connectionLimit: 10, // Giới hạn số lượng connection đồng thời
    queueLimit: 0
});

module.exports = pool;
