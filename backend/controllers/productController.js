const productService = require('../services/productService');

const productController = {
    getAll: async (req, res) => {
        try {
            const { page = 1, limit = 10, search, category_id, store_id, min_price, max_price } = req.query;
            const parsedPage = Math.max(1, parseInt(page, 10) || 1);
            const parsedLimit = Math.max(1, Math.min(100, parseInt(limit, 10) || 10));
            const offset = (parsedPage - 1) * parsedLimit;
            const parsedMinPrice = min_price ? Math.max(0, parseFloat(min_price) || 0) : undefined;
            const parsedMaxPrice = max_price ? Math.max(0, parseFloat(max_price) || 0) : undefined;

            const result = await productService.getAll({
                search,
                category_id: category_id ? parseInt(category_id) || undefined : undefined,
                store_id: store_id ? parseInt(store_id) || undefined : undefined,
                min_price: parsedMinPrice,
                max_price: parsedMaxPrice,
                limit: parsedLimit,
                offset
            });

            res.json({
                message: 'Lấy danh sách sản phẩm thành công',
                data: result.data,
                pagination: {
                    total: result.total,
                    page: parsedPage,
                    limit: parsedLimit,
                    totalPages: Math.ceil(result.total / parsedLimit)
                }
            });
        } catch (error) {
            console.error('Lỗi lấy danh sách sản phẩm:', error);
            res.status(error.status || 500).json({ message: error.message || 'Lỗi server khi lấy danh sách sản phẩm' });
        }
    },

    getById: async (req, res) => {
        try {
            const product = await productService.getById(req.params.id);
            res.json({ message: 'Lấy sản phẩm thành công', data: product });
        } catch (error) {
            console.error(error);
            res.status(error.status || 500).json({ message: error.message || 'Lỗi server' });
        }
    },

    create: async (req, res) => {
        try {
            const newId = await productService.create({ ...req.body, file: req.file });
            res.status(201).json({ message: 'Tạo sản phẩm thành công', data: { id: newId } });
        } catch (error) {
            console.error(error);
            res.status(error.status || 500).json({ message: error.message || 'Lỗi server khi tạo sản phẩm' });
        }
    },

    update: async (req, res) => {
        try {
            await productService.update(req.params.id, req.body, req.file);
            res.json({ message: 'Cập nhật sản phẩm thành công' });
        } catch (error) {
            console.error(error);
            res.status(error.status || 500).json({ message: error.message || 'Lỗi server khi cập nhật sản phẩm' });
        }
    },

    delete: async (req, res) => {
        try {
            await productService.delete(req.params.id);
            res.json({ message: 'Xóa sản phẩm thành công' });
        } catch (error) {
            console.error(error);
            if (error.code === 'ER_ROW_IS_REFERENCED_2') {
                return res.status(400).json({ message: 'Không thể xóa! Sản phẩm này đã tồn tại trong lịch sử đơn hàng. Hãy thử ẩn sản phẩm.' });
            }
            res.status(error.status || 500).json({ message: error.message || 'Lỗi server' });
        }
    }
};

module.exports = productController;
