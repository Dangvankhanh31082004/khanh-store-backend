const express = require('express');
const router = express.Router();
const orderController = require('../controllers/orderController');
const { authenticate, authorize } = require('../middlewares/authMiddleware');

const adminRoles = ['staff', 'manager', 'admin', 'owner'];

// ==========================================
// CART & CHECKOUT (Luồng Đặt Hàng)
// ==========================================
// Xác thực giỏ hàng không cần JWT để khách vãng lai cũng có thể check giá/kho
router.post('/validate-cart', orderController.validateCart);

// Checkout bắt buộc đăng nhập (JWT)
router.post('/checkout', authenticate, orderController.checkout);

// ==========================================
// CUSTOMER ROUTES (Luồng Cá Nhân)
// ==========================================
// Lịch sử mua hàng cá nhân
router.get('/history', authenticate, orderController.getHistory);
router.put('/:id/cancel', authenticate, orderController.cancelMyOrder);


// ==========================================
// ADMIN ROUTES (Luồng Quản Trị)
// ==========================================
// Admin xem toàn bộ đơn, có phân trang
router.get('/admin/all', authenticate, authorize(adminRoles), orderController.getAllForAdmin);

// Admin cập nhật Status đơn hàng
router.put('/:id/status', authenticate, authorize(adminRoles), orderController.updateStatus);


// ==========================================
// SHARED ROUTES (Dùng chung)
// ==========================================
// Xem chi tiết đơn (Sẽ có logic kiểm tra ID ngầm bên trong Controller)
// Đặt cuối cùng để tránh bị conflict params `:id` với `history` hoặc `admin/all`
router.get('/:id', authenticate, orderController.getOrderDetail);

module.exports = router;
