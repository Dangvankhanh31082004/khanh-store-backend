const fs = require('fs');
const path = require('path');
const slugify = require('slugify');
const Product = require('../models/productModel');

const productService = {
    getAll: async ({ page = 1, limit = 10, search, category_id, store_id }) => {
        const offset = (Number(page) - 1) * Number(limit);
        return await Product.findAll({
            search,
            category_id,
            store_id,
            limit: Number(limit),
            offset
        });
    },

    getById: async (id) => {
        const product = await Product.findById(id);
        if (!product) throw new Error('Không tìm thấy sản phẩm');
        return product;
    },

    create: async ({ store_id, category_id, name, description, price, stock_quantity, file }) => {
        // Validate required fields
        if (!store_id || !category_id || !name || price == null) {
            throw new Error('Thiếu thông tin bắt buộc (store_id, category_id, name, price)');
        }
        // Ensure price is a positive number
        const numericPrice = Number(price);
        if (isNaN(numericPrice) || numericPrice <= 0) {
            throw new Error('Giá sản phẩm không hợp lệ');
        }
        const image_url = file ? `/uploads/${file.filename}` : null;
        const slug = slugify(name, { lower: true, strict: true, locale: 'vi' }) + '-' + Date.now();
        const newId = await Product.create({
            store_id,
            category_id,
            name,
            slug,
            description,
            price: numericPrice,
            stock_quantity: stock_quantity || 0,
            image_url
        });
        return newId;
    },
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
        // Validate price if provided
        if (updateData.price != null) {
            const numericPrice = Number(updateData.price);
            if (isNaN(numericPrice) || numericPrice <= 0) {
                throw new Error('Giá sản phẩm không hợp lệ');
            }
            updateData.price = numericPrice;
        }
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

// Helper to validate a product object (used by verification script)
function validateProduct(product) {
    const errors = [];
    if (!product.name) errors.push('Missing name');
    const price = Number(product.price);
    if (isNaN(price) || price <= 0) errors.push('Invalid price');
    if (!product.image_url) errors.push('Missing image_url');
    return errors;
}

module.exports = { ...productService, validateProduct };
