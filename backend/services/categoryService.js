const Category = require('../models/categoryModel');
const slugify = require('slugify');

const categoryService = {
    getAll: async () => Category.getAll(),
    getById: async (id) => {
        const category = await Category.findById(id);
        if (!category) throw new Error('Không tìm thấy danh mục');
        return category;
    },
    create: async ({ name, description, parent_id }) => {
        if (!name) throw new Error('Tên danh mục là bắt buộc');
        const slug = slugify(name, { lower: true, strict: true, locale: 'vi' }) + '-' + Date.now();
        return await Category.create({ name, slug, description: description || '', parent_id: parent_id ? parseInt(parent_id) : null });
    },
    update: async (id, { name, description, parent_id }) => {
        const existingCategory = await Category.findById(id);
        if (!existingCategory) {
            const err = new Error('Không tìm thấy danh mục để cập nhật');
            err.status = 404;
            throw err;
        }
        if (!name) throw new Error('Tên danh mục là bắt buộc');
        const slug = slugify(name, { lower: true, strict: true, locale: 'vi' }) + '-' + Date.now();
        const affectedRows = await Category.update(id, { name, slug, description: description || '', parent_id: parent_id ? parseInt(parent_id) : null });
        if (affectedRows === 0) {
            const err = new Error('Không có thông tin nào bị thay đổi hoặc cập nhật thất bại');
            err.status = 400;
            throw err;
        }
        return affectedRows;
    },
    delete: async (id) => {
        const existingCategory = await Category.findById(id);
        if (!existingCategory) {
            const err = new Error('Không tìm thấy danh mục');
            err.status = 404;
            throw err;
        }
        const affectedRows = await Category.delete(id);
        if (affectedRows === 0) {
            const err = new Error('Xóa thất bại');
            err.status = 400;
            throw err;
        }
        return affectedRows;
    }
};

module.exports = categoryService;
