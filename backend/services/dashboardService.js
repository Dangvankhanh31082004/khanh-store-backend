const Dashboard = require('../models/dashboardModel');

const dashboardService = {
    getStats: async () => Dashboard.getStats(),
    getMonthlyRevenue: async () => Dashboard.getMonthlyRevenue()
};

module.exports = dashboardService;
