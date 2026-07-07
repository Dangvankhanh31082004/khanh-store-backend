const Customer = require('../models/customerModel');

const customerService = {
    getAll: async (query) => {
        const page = Math.max(1, parseInt(query.page, 10) || 1);
        const limit = Math.max(1, Math.min(100, parseInt(query.limit, 10) || 20));
        const offset = (page - 1) * limit;
        return await Customer.findAll({
            search: query.search,
            role: query.role,
            limit,
            offset
        });
    }
};

module.exports = customerService;
