const pool = require('../config/db');
const Order = require('../models/orderModel');

const orderService = {
    validateCart: async (items) => {
        if (!items || !Array.isArray(items) || items.length === 0) {
            const err = new Error('Giỏ hàng đang trống.');
            err.status = 400;
            throw err;
        }

        const validatedItems = [];
        let totalAmount = 0;

        for (const item of items) {
            const [rows] = await pool.query('SELECT name, price, stock_quantity, image_url FROM products WHERE id = ?', [item.product_id]);
            if (rows.length === 0) {
                const err = new Error(`Sản phẩm ID ${item.product_id} không còn tồn tại.`);
                err.status = 400;
                throw err;
            }
            const product = rows[0];
            if (product.stock_quantity < item.quantity) {
                const err = new Error(`Sản phẩm [${product.name}] chỉ còn lại ${product.stock_quantity} chiếc trong kho.`);
                err.status = 400;
                throw err;
            }
            totalAmount += product.price * item.quantity;
            validatedItems.push({
                product_id: item.product_id,
                name: product.name,
                price: product.price,
                request_quantity: item.quantity,
                image_url: product.image_url
            });
        }

        return { valid: true, data: validatedItems, total_amount: totalAmount };
    },

    checkout: async (userId, payload) => {
        const { store_id, items, shipping_address, payment_method, notes } = payload;
        if (!store_id || !items || !Array.isArray(items) || items.length === 0 || !shipping_address || !payment_method) {
            const err = new Error('Vui lòng cung cấp đầy đủ thông tin giao hàng và danh sách sản phẩm.');
            err.status = 400;
            throw err;
        }

        for (const item of items) {
            const q = parseInt(item.quantity, 10);
            const pid = parseInt(item.product_id, 10);
            if (isNaN(pid) || isNaN(q) || q <= 0) {
                const err = new Error('Số lượng mua hoặc mã sản phẩm không hợp lệ (phải là số nguyên dương).');
                err.status = 400;
                throw err;
            }
            item.quantity = q;
            item.product_id = pid;
        }

        const customerId = await Order.getCustomerIdByUserId(userId);
        if (!customerId) {
            const err = new Error('Tài khoản của bạn chưa được liên kết hồ sơ khách mua hàng.');
            err.status = 403;
            throw err;
        }

        return await Order.createOrder(customerId, store_id, items, shipping_address, payment_method, notes);
    },

    getHistory: async (userId) => {
        const customerId = await Order.getCustomerIdByUserId(userId);
        if (!customerId) {
            const err = new Error('Lỗi quyền truy cập.');
            err.status = 403;
            throw err;
        }
        return await Order.findByCustomer(customerId);
    },

    getOrderDetail: async (userId, role, orderId) => {
        const order = await Order.findById(orderId);
        if (!order) {
            const err = new Error('Không tìm thấy đơn hàng.');
            err.status = 404;
            throw err;
        }

        const customerId = await Order.getCustomerIdByUserId(userId);
        const userRole = role.toLowerCase();
        const isAdminOrStaff = ['admin', 'manager', 'owner', 'staff'].includes(userRole);
        if (order.customer_id !== customerId && !isAdminOrStaff) {
            const err = new Error('Bạn không có quyền xem thông tin đơn hàng này.');
            err.status = 403;
            throw err;
        }

        return order;
    },

    updateStatus: async (orderId, status) => {
        const validStatuses = ['PENDING', 'PROCESSING', 'SHIPPED', 'DELIVERED', 'CANCELLED'];
        if (!validStatuses.includes(status)) {
            const err = new Error('Trạng thái truyền lên không hợp lệ.');
            err.status = 400;
            throw err;
        }

        const affectedRows = await Order.updateStatus(orderId, status);
        if (affectedRows === 0) {
            const err = new Error('Không tìm thấy mã đơn hàng.');
            err.status = 404;
            throw err;
        }
        return affectedRows;
    },

    getAllForAdmin: async (query) => {
        const page = Math.max(1, parseInt(query.page, 10) || 1);
        const limit = Math.max(1, Math.min(100, parseInt(query.limit, 10) || 20));
        const offset = (page - 1) * limit;
        return await Order.findAll({ status: query.status, limit, offset });
    },

    cancelMyOrder: async (userId, orderId) => {
        const customerId = await Order.getCustomerIdByUserId(userId);
        if (!customerId) {
            const err = new Error('Lỗi quyền truy cập.');
            err.status = 403;
            throw err;
        }

        const order = await Order.findById(orderId);
        if (!order) {
            const err = new Error('Không tìm thấy đơn hàng.');
            err.status = 404;
            throw err;
        }
        if (order.customer_id !== customerId) {
            const err = new Error('Bạn không có quyền hủy đơn hàng này.');
            err.status = 403;
            throw err;
        }
        if (order.status !== 'PENDING') {
            const err = new Error('Chỉ có thể hủy đơn hàng đang ở trạng thái Chờ xử lý.');
            err.status = 400;
            throw err;
        }

        await Order.updateStatus(orderId, 'CANCELLED');
        return true;
    }
};

module.exports = orderService;
