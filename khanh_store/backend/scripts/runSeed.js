require('dotenv').config();
const mysql = require('mysql2/promise');
const fs = require('fs');
const path = require('path');

async function runSeed() {
  try {
    const pool = mysql.createPool({
      host: process.env.DB_HOST,
      port: parseInt(process.env.DB_PORT, 10) || 3306,
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      database: process.env.DATABASE || 'khanh_store',
      waitForConnections: true,
      connectionLimit: 5,
      queueLimit: 0,
    });
    const seedPath = path.join(__dirname, '..', '..', 'seed.sql');
    const sql = fs.readFileSync(seedPath, 'utf8');
    const statements = sql.split(/;\s*\n/).filter(s => s.trim().length > 0);
    for (const stmt of statements) {
      await pool.query(stmt);
    }
    console.log('Database seeded successfully');
    await pool.end();
  } catch (err) {
    console.error('Seeding failed', err);
    process.exit(1);
  }
}

runSeed();
