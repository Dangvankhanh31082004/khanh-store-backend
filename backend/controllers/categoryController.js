const categoryService = require('../services/categoryService');

const categoryController = {
    getAll: async (req, res) => {
        try {
            const categories = await categoryService.getAll();
            res.json({ message: 'Lấy danh mục thành công', data: categories });
        } catch (error) {
            console.error('Lỗi khi lấy danh mục:', error);
            res.status(error.status || 500).json({ message: error.message || 'Lỗi server khi lấy danh mục' });
        }
    },

    getById: async (req, res) => {
        try {
            const category = await categoryService.getById(req.params.id);
            res.json({ message: 'Lấy danh mục thành công', data: category });
        } catch (error) {
            console.error('Lỗi khi lấy chi tiết danh mục:', error);
            res.status(error.status || 500).json({ message: error.message || 'Lỗi server' });
        }
    },

    create: async (req, res) => {
        try {
            const newId = await categoryService.create(req.body);
            res.status(201).json({ message: 'Tạo danh mục thành công', data: { id: newId } });
        } catch (error) {
            console.error('Lỗi tạo danh mục:', error);
            res.status(error.status || 500).json({ message: error.message || 'Lỗi server khi tạo danh mục' });
        }
    },

    update: async (req, res) => {
        try {
            await categoryService.update(req.params.id, req.body);
            res.json({ message: 'Cập nhật danh mục thành công' });
        } catch (error) {
            console.error('Lỗi cập nhật danh mục:', error);
            res.status(error.status || 500).json({ message: error.message || 'Lỗi server khi cập nhật danh mục' });
        }
    },

    delete: async (req, res) => {
        try {
            await categoryService.delete(req.params.id);
            res.json({ message: 'Xóa danh mục thành công' });
        } catch (error) {
            console.error('Lỗi khi xóa danh mục:', error);
            if (error.code === 'ER_ROW_IS_REFERENCED_2') {
                return res.status(400).json({ message: 'Không thể xóa danh mục này vì đang có sản phẩm thuộc danh mục hoặc danh mục con đang tham chiếu tới nó.' });
            }
            res.status(error.status || 500).json({ message: error.message || 'Lỗi server khi xóa danh mục' });
        }
    }
};

module.exports = categoryController;
