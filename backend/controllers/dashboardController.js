const dashboardService = require('../services/dashboardService');

const dashboardController = {
    getStats: async (req, res) => {
        try {
            const stats = await dashboardService.getStats();
            res.json({ message: 'Thành công', data: stats });
        } catch (error) {
            console.error(error);
            res.status(error.status || 500).json({ message: error.message || 'Lỗi server' });
        }
    },

    getRevenueReport: async (req, res) => {
        try {
            const revenue = await dashboardService.getMonthlyRevenue();
            res.json({ message: 'Thành công', data: revenue });
        } catch (error) {
            console.error(error);
            res.status(error.status || 500).json({ message: error.message || 'Lỗi server khi thống kê doanh thu' });
        }
    }
};

module.exports = dashboardController;
