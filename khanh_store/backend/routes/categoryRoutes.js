const express = require('express');
const router = express.Router();
const categoryController = require('../controllers/categoryController');
const { authenticate, authorize } = require('../middlewares/authMiddleware');

const manageRoles = ['staff', 'manager', 'admin', 'owner'];

// 1. PUBLIC ROUTES (Mọi người đều có thể xem danh sách và chi tiết)
router.get('/', categoryController.getAll);
router.get('/:id', categoryController.getById);

// 2. ADMIN/STAFF PROTECTED ROUTES (Chỉ Quản trị viên mới được sửa đổi)
router.post('/', authenticate, authorize(manageRoles), categoryController.create);
router.put('/:id', authenticate, authorize(manageRoles), categoryController.update);
router.delete('/:id', authenticate, authorize(manageRoles), categoryController.delete);

module.exports = router;
