const storeService = require('../services/storeService');

const storeController = {
    getAll: async (req, res) => {
        try {
            const stores = await storeService.getAll();
            res.json({ message: 'Lấy danh sách chi nhánh thành công', data: stores });
        } catch (error) {
            console.error('Lỗi khi lấy chi nhánh:', error);
            res.status(error.status || 500).json({ message: error.message || 'Lỗi server khi lấy chi nhánh' });
        }
    },

    getById: async (req, res) => {
        try {
            const store = await storeService.getById(req.params.id);
            res.json({ message: 'Lấy thông tin chi nhánh thành công', data: store });
        } catch (error) {
            console.error('Lỗi lấy chi tiết chi nhánh:', error);
            res.status(error.status || 500).json({ message: error.message || 'Lỗi server' });
        }
    },

    create: async (req, res) => {
        try {
            const newId = await storeService.create(req.body);
            res.status(201).json({ message: 'Tạo chi nhánh thành công', data: { id: newId } });
        } catch (error) {
            console.error('Lỗi tạo chi nhánh:', error);
            res.status(error.status || 500).json({ message: error.message || 'Lỗi server khi tạo chi nhánh' });
        }
    },

    update: async (req, res) => {
        try {
            await storeService.update(req.params.id, req.body);
            res.json({ message: 'Cập nhật chi nhánh thành công' });
        } catch (error) {
            console.error('Lỗi cập nhật chi nhánh:', error);
            res.status(error.status || 500).json({ message: error.message || 'Lỗi server khi cập nhật chi nhánh' });
        }
    },

    delete: async (req, res) => {
        try {
            await storeService.delete(req.params.id);
            res.json({ message: 'Xóa chi nhánh thành công' });
        } catch (error) {
            console.error('Lỗi khi xóa chi nhánh:', error);
            if (error.code === 'ER_ROW_IS_REFERENCED_2') {
                return res.status(400).json({ message: 'Không thể xóa chi nhánh này vì đang tồn tại sản phẩm hoặc đơn hàng thuộc chi nhánh.' });
            }
            res.status(error.status || 500).json({ message: error.message || 'Lỗi server khi xóa chi nhánh' });
        }
    }
};

module.exports = storeController;
