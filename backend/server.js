const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const pool = require('./config/db');

// Khởi tạo các biến môi trường
dotenv.config();

const app = express();

// ==========================================
// 1. MIDDLEWARES GLOBAL
// ==========================================
app.use(cors()); // Cho phép cross-origin request
app.use(express.json()); // Phân tích JSON body
app.use(express.urlencoded({ extended: true })); // Phân tích URL-encoded form body
app.use('/uploads', express.static('uploads')); // Public thư mục tĩnh chứa ảnh upload

// ==========================================
// 2. TEST KẾT NỐI DATABASE
// ==========================================
pool.getConnection()
    .then(connection => {
        console.log('✅ Kết nối Database MySQL thành công!');
        connection.release();
    })
    .catch(err => {
        console.error('❌ Lỗi kết nối Database:', err.message);
    });

// ==========================================
// 3. ROUTES (Sẽ định nghĩa sau)
// ==========================================
app.get('/', (req, res) => {
    res.json({ message: 'Chào mừng đến với API Backend của KHÁNH STORE!' });
});

// Import các routes
const authRoutes = require('./routes/authRoutes');
const productRoutes = require('./routes/productRoutes');
const orderRoutes = require('./routes/orderRoutes');
const categoryRoutes = require('./routes/categoryRoutes');
const storeRoutes = require('./routes/storeRoutes');
const customerRoutes = require('./routes/customerRoutes');
const dashboardRoutes = require('./routes/dashboardRoutes');

app.use('/api/auth', authRoutes);
app.use('/api/products', productRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/stores', storeRoutes);
app.use('/api/customers', customerRoutes);
app.use('/api/dashboard', dashboardRoutes);


// ==========================================
// 4. START SERVER
// ==========================================
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`🚀 Server Backend đang chạy tại http://localhost:${PORT}`);
});
