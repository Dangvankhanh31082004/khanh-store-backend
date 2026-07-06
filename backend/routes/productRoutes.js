const express = require('express');
const router = express.Router();
const productController = require('../controllers/productController');
const upload = require('../middlewares/uploadMiddleware');
const { authenticate, authorize } = require('../middlewares/authMiddleware');

// Middleware bọc ngoài để bắt lỗi định dạng file của multer
const uploadSingle = (req, res, next) => {
    upload.single('image')(req, res, function (err) {
        if (err) return res.status(400).json({ message: err.message });
        next();
    });
};

// ==========================================
// PUBLIC ROUTES (Tất cả mọi người đều xem được)
// ==========================================
router.get('/', productController.getAll); // Kèm params để search/filter/paginate
router.get('/:id', productController.getById);

// ==========================================
// PROTECTED ROUTES (Chỉ Quản trị mới được thao tác)
// ==========================================
const manageRoles = ['staff', 'manager', 'admin', 'owner'];
const deleteRoles = ['manager', 'admin', 'owner']; // Staff không được xóa

router.post('/', authenticate, authorize(manageRoles), uploadSingle, productController.create);
router.put('/:id', authenticate, authorize(manageRoles), uploadSingle, productController.update);
router.delete('/:id', authenticate, authorize(deleteRoles), productController.delete);

module.exports = router;
