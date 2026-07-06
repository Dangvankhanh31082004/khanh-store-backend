const Store = require('../models/storeModel');

const storeService = {
    getAll: async () => Store.getAll(),
    getById: async (id) => {
        const store = await Store.findById(id);
        if (!store) throw new Error('Không tìm thấy chi nhánh');
        return store;
    },
    create: async ({ name, address, phone, manager_id }) => {
        if (!name || !address) throw new Error('Tên và địa chỉ chi nhánh là bắt buộc');
        return await Store.create({ name, address, phone, manager_id: manager_id ? parseInt(manager_id) : null });
    },
    update: async (id, { name, address, phone, manager_id }) => {
        const existingStore = await Store.findById(id);
        if (!existingStore) {
            const err = new Error('Không tìm thấy chi nhánh để cập nhật');
            err.status = 404;
            throw err;
        }
        if (!name || !address) throw new Error('Tên và địa chỉ chi nhánh là bắt buộc');
        const affectedRows = await Store.update(id, { name, address, phone, manager_id: manager_id ? parseInt(manager_id) : null });
        if (affectedRows === 0) {
            const err = new Error('Không có thông tin nào bị thay đổi');
            err.status = 400;
            throw err;
        }
        return affectedRows;
    },
    delete: async (id) => {
        const existingStore = await Store.findById(id);
        if (!existingStore) {
            const err = new Error('Không tìm thấy chi nhánh');
            err.status = 404;
            throw err;
        }
        const affectedRows = await Store.delete(id);
        if (affectedRows === 0) {
            const err = new Error('Xóa chi nhánh thất bại');
            err.status = 400;
            throw err;
        }
        return affectedRows;
    }
};

module.exports = storeService;
