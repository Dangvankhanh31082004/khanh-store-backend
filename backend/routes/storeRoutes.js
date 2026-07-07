const express = require('express');
const router = express.Router();
const storeController = require('../controllers/storeController');
const { authenticate, authorize } = require('../middlewares/authMiddleware');

const adminRoles = ['admin', 'manager', 'owner'];

// 1. PUBLIC ROUTES (Mọi người xem được thông tin cửa hàng)
router.get('/', storeController.getAll);
router.get('/:id', storeController.getById);

// 2. ADMIN PROTECTED ROUTES (Chỉ Admin mới có quyền CRUD chi nhánh)
router.post('/', authenticate, authorize(adminRoles), storeController.create);
router.put('/:id', authenticate, authorize(adminRoles), storeController.update);
router.delete('/:id', authenticate, authorize(adminRoles), storeController.delete);

module.exports = router;
