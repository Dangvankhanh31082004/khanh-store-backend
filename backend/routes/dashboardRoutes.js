const express = require('express');
const router = express.Router();
const dashboardController = require('../controllers/dashboardController');
const { authenticate, authorize } = require('../middlewares/authMiddleware');

// Dashboard Stats (Chỉ Admin)
router.get('/stats', authenticate, authorize(['admin', 'manager', 'owner']), dashboardController.getStats);

module.exports = router;
