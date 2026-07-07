const express = require('express');
const router = express.Router();
const customerController = require('../controllers/customerController');
const { authenticate, authorize } = require('../middlewares/authMiddleware');

const adminRoles = ['staff', 'manager', 'admin', 'owner'];

router.get('/', authenticate, authorize(adminRoles), customerController.getAll);

module.exports = router;
