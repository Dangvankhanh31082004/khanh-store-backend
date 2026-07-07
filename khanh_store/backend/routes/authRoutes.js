const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const { authenticate, authorize } = require('../middlewares/authMiddleware');

// ==========================================
// PUBLIC ROUTES (Không cần đăng nhập)
// ==========================================
router.post('/register', authController.register);
router.post('/login', authController.login);
router.post('/refresh-token', authController.refreshToken);

// ==========================================
// PROTECTED ROUTES (Cần Token)
// ==========================================
router.get('/me', authenticate, authController.me);
router.put('/profile', authenticate, authController.updateProfile);

// Test 2: Route chỉ dành riêng cho Admin và Manager, Owner
router.get('/admin-dashboard', authenticate, authorize(['admin', 'manager', 'owner']), (req, res) => {
    res.json({ 
        message: 'Chào mừng sếp! Đây là khu vực quản trị bí mật.', 
        user: req.user 
    });
});

// Test 3: Route dành cho nhân viên bán hàng
router.get('/staff-area', authenticate, authorize(['staff', 'admin', 'manager', 'owner']), (req, res) => {
    res.json({ 
        message: 'Khu vực quản lý đơn hàng của nhân viên.', 
    });
});

module.exports = router;
