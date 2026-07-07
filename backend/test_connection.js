const mysql = require('mysql2/promise');
require('dotenv').config();

async function run() {
    try {
        const pool = mysql.createPool({
            host: process.env.DB_HOST,
            port: parseInt(process.env.DB_PORT, 10) || 3306,
            user: process.env.DB_USER,
            password: process.env.DB_PASSWORD,
            database: process.env.DATABASE || 'khanh_store',
            waitForConnections: true,
            connectionLimit: 1,
            queueLimit: 0
        });
        
        console.log("Updating admin password hash to 'Admin@123'...");
        const adminHash = '$2b$10$BEfEpGbu5Jn5rLe3EwA2KOtnRX6ynuahDreZO4MtEVfH0KeFQRSWO';
        const [result] = await pool.query("UPDATE users SET password_hash = ? WHERE email = 'admin@khanhstore.com'", [adminHash]);
        console.log("Update result:", result);
        await pool.end();
    } catch (err) {
        console.error("Failed to update remote DB:", err);
    }
}

run();
