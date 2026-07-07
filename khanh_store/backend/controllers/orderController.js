const orderService = require('../services/orderService');

const orderController = {
    validateCart: async (req, res) => {
        try {
            const result = await orderService.validateCart(req.body.items);
            res.json({ message: 'Giỏ hàng hợp lệ.', ...result });
        } catch (error) {
            console.error(error);
            res.status(error.status || 500).json({ message: error.message || 'Lỗi server khi đối chiếu giỏ hàng.', valid: false });
        }
    },

    checkout: async (req, res) => {
        try {
            const orderId = await orderService.checkout(req.user.id, req.body);
            res.status(201).json({ message: 'Đặt hàng thành công!', order_id: orderId });
        } catch (error) {
            console.error('Lỗi Checkout API:', error.message || error);
            res.status(error.status || 500).json({ message: error.message || 'Lỗi server khi đặt hàng. Vui lòng thử lại.' });
        }
    },

    getHistory: async (req, res) => {
        try {
            const orders = await orderService.getHistory(req.user.id);
            res.json({ message: 'Lấy lịch sử mua hàng thành công', data: orders });
        } catch (error) {
            console.error(error);
            res.status(error.status || 500).json({ message: error.message || 'Lỗi server.' });
        }
    },

    getOrderDetail: async (req, res) => {
        try {
            const order = await orderService.getOrderDetail(req.user.id, req.user.role, req.params.id);
            res.json({ message: 'Lấy chi tiết đơn hàng thành công', data: order });
        } catch (error) {
            console.error(error);
            res.status(error.status || 500).json({ message: error.message || 'Lỗi server.' });
        }
    },

    updateStatus: async (req, res) => {
        try {
            await orderService.updateStatus(req.params.id, req.body.status);
            res.json({ message: `Đã cập nhật đơn hàng thành trạng thái: ${req.body.status}` });
        } catch (error) {
            console.error(error);
            res.status(error.status || 500).json({ message: error.message || 'Lỗi server.' });
        }
    },

    getAllForAdmin: async (req, res) => {
        try {
            const result = await orderService.getAllForAdmin(req.query);
            const page = Math.max(1, parseInt(req.query.page, 10) || 1);
            const limit = Math.max(1, Math.min(100, parseInt(req.query.limit, 10) || 20));

            res.json({
                message: 'Lấy danh sách đơn hàng thành công',
                data: result.data,
                pagination: {
                    total: result.total,
                    page,
                    limit,
                    totalPages: Math.ceil(result.total / limit)
                }
            });
        } catch (error) {
            console.error('Lỗi khi Admin lấy danh sách đơn hàng:', error);
            res.status(error.status || 500).json({ message: error.message || 'Lỗi server khi lấy danh sách đơn hàng.' });
        }
    },

    cancelMyOrder: async (req, res) => {
        try {
            await orderService.cancelMyOrder(req.user.id, req.params.id);
            res.json({ message: 'Hủy đơn hàng thành công!' });
        } catch (error) {
            console.error('Lỗi hủy đơn hàng:', error);
            res.status(error.status || 500).json({ message: error.message || 'Lỗi server khi hủy đơn hàng.' });
        }
    }
};

module.exports = orderController;
