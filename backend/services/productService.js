const fs = require('fs');
const path = require('path');
const slugify = require('slugify');
const Product = require('../models/productModel');

const productService = {
    getAll: async (query) => {
        return await Product.findAll(query);
    },

    getById: async (id) => {
        const product = await Product.findById(id);
        if (!product) throw new Error('Không tìm thấy sản phẩm');
        return product;
    },

    create: async ({ store_id, category_id, name, description, price, stock_quantity, file }) => {
        if (!store_id || !category_id || !name || !price) {
            throw new Error('Thiếu thông tin bắt buộc (store_id, category_id, name, price)');
        }

        const image_url = file ? `/uploads/${file.filename}` : null;
        const slug = slugify(name, { lower: true, strict: true, locale: 'vi' }) + '-' + Date.now();

        const newId = await Product.create({
            store_id,
            category_id,
            name,
            slug,
            description,
            price,
            stock_quantity: stock_quantity || 0,
            image_url
        });
        return newId;
    },

    update: async (id, data, file) => {
        const existingProduct = await Product.findById(id);
        if (!existingProduct) {
            const err = new Error('Không tìm thấy sản phẩm để cập nhật');
            err.status = 404;
            throw err;
        }

        const updateData = { ...data };
        if (updateData.name) {
            updateData.slug = slugify(updateData.name, { lower: true, strict: true, locale: 'vi' }) + '-' + Date.now();
        }

        if (file) {
            updateData.image_url = `/uploads/${file.filename}`;
            if (existingProduct.image_url) {
                const oldPath = path.join(__dirname, '..', existingProduct.image_url);
                if (fs.existsSync(oldPath)) fs.unlinkSync(oldPath);
            }
        }

        const affectedRows = await Product.update(id, updateData);
        if (affectedRows === 0) {
            const err = new Error('Không có dữ liệu nào bị thay đổi');
            err.status = 400;
            throw err;
        }
        return affectedRows;
    },

    delete: async (id) => {
        const existingProduct = await Product.findById(id);
        if (!existingProduct) {
            const err = new Error('Không tìm thấy sản phẩm');
            err.status = 404;
            throw err;
        }

        const affectedRows = await Product.delete(id);
        if (affectedRows === 0) {
            const err = new Error('Xóa thất bại.');
            err.status = 400;
            throw err;
        }

        if (existingProduct.image_url) {
            const oldPath = path.join(__dirname, '..', existingProduct.image_url);
            if (fs.existsSync(oldPath)) fs.unlinkSync(oldPath);
        }
        return affectedRows;
    }
};

module.exports = productService;
