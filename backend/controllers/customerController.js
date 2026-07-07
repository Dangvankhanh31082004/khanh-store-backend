const customerService = require('../services/customerService');

const CustomerController = {
    getAll: async (req, res) => {
        try {
            const result = await customerService.getAll(req.query);
            const page = Math.max(1, parseInt(req.query.page, 10) || 1);
            const limit = Math.max(1, Math.min(100, parseInt(req.query.limit, 10) || 20));

            res.json({
                message: 'Lấy danh sách người dùng thành công',
                data: result.data,
                pagination: {
                    total: result.total,
                    page,
                    limit,
                    totalPages: Math.ceil(result.total / limit)
                }
            });
        } catch (error) {
            console.error('Lỗi lấy danh sách khách hàng:', error);
            res.status(error.status || 500).json({ message: error.message || 'Lỗi server khi lấy danh sách khách hàng.' });
        }
    }
};

module.exports = CustomerController;
