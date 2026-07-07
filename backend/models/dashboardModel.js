const pool = require('../config/db');

const Dashboard = {
    getStats: async () => {
        const [[{ total_revenue }]] = await pool.query("SELECT COALESCE(SUM(total_amount), 0) as total_revenue FROM orders WHERE status = 'DELIVERED'");
        const [[{ total_orders }]] = await pool.query("SELECT COUNT(*) as total_orders FROM orders");
        const [[{ total_customers }]] = await pool.query("SELECT COUNT(*) as total_customers FROM customers");
        const [[{ total_products }]] = await pool.query("SELECT COUNT(*) as total_products FROM products");

        return {
            total_revenue,
            total_orders,
            total_customers,
            total_products
        };
    },

    getMonthlyRevenue: async () => {
        const [rows] = await pool.query(`
            SELECT 
                DATE_FORMAT(order_date, '%m/%Y') as month_year,
                COUNT(id) as total_orders,
                COALESCE(SUM(total_amount), 0) as monthly_revenue,
                COALESCE((
                    SELECT SUM(od.quantity) 
                    FROM order_details od 
                    JOIN orders o ON od.order_id = o.id 
                    WHERE DATE_FORMAT(o.order_date, '%m/%Y') = DATE_FORMAT(orders.order_date, '%m/%Y') 
                      AND o.status = 'DELIVERED'
                ), 0) as total_items
            FROM orders 
            WHERE status = 'DELIVERED'
            GROUP BY DATE_FORMAT(order_date, '%m/%Y'), DATE_FORMAT(order_date, '%Y-%m')
            ORDER BY DATE_FORMAT(order_date, '%Y-%m') DESC
        `);
        return rows;
    }
};

module.exports = Dashboard;
