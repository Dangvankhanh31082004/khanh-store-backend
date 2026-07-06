const pool = require('../config/db');

const Order = {
    // 1. TẠO ĐƠN HÀNG (Sử dụng MySQL Transaction để đảm bảo tính nhất quán)
    createOrder: async (customerId, storeId, items, shippingAddress, paymentMethod, notes) => {
        const connection = await pool.getConnection();
        try {
            // Bắt đầu Transaction (Nếu lỗi ở bất kỳ khâu nào, toàn bộ sẽ bị Rollback)
            await connection.beginTransaction();

            let totalAmount = 0;
            const orderDetailsData = [];

            // Khâu 1: Kiểm tra tồn kho và tính tổng tiền thực tế từ Server (Bảo mật)
            for (const item of items) {
                // Khóa dòng (FOR UPDATE) để tránh Race Condition khi nhiều người mua cùng 1 mặt hàng
                const [productRows] = await connection.query(
                    'SELECT name, price, stock_quantity FROM products WHERE id = ? FOR UPDATE', 
                    [item.product_id]
                );
                
                if (productRows.length === 0) {
                    throw new Error(`Sản phẩm ID ${item.product_id} không tồn tại.`);
                }

                const product = productRows[0];
                if (product.stock_quantity < item.quantity) {
                    throw new Error(`Sản phẩm [${product.name}] không đủ số lượng trong kho.`);
                }

                totalAmount += (product.price * item.quantity);
                orderDetailsData.push({
                    product_id: item.product_id,
                    quantity: item.quantity,
                    unit_price: product.price
                });

                // Khâu 2: Trừ số lượng tồn kho
                await connection.query(
                    'UPDATE products SET stock_quantity = stock_quantity - ? WHERE id = ?',
                    [item.quantity, item.product_id]
                );
            }

            // Khâu 3: Tạo record trong bảng orders
            const [orderResult] = await connection.query(
                `INSERT INTO orders (customer_id, store_id, total_amount, shipping_address, payment_method, notes, status) 
                 VALUES (?, ?, ?, ?, ?, ?, 'PENDING')`,
                [customerId, storeId, totalAmount, shippingAddress, paymentMethod, notes]
            );
            
            const orderId = orderResult.insertId;

            // Khâu 4: Tạo hàng loạt record trong bảng order_details
            for (const detail of orderDetailsData) {
                await connection.query(
                    `INSERT INTO order_details (order_id, product_id, quantity, unit_price) 
                     VALUES (?, ?, ?, ?)`,
                    [orderId, detail.product_id, detail.quantity, detail.unit_price]
                );
            }

            // Xác nhận hoàn tất Transaction
            await connection.commit();
            return orderId;
        } catch (error) {
            // Nếu có lỗi (Hết hàng, Lỗi SQL...) -> Hủy bỏ mọi thay đổi trong DB
            await connection.rollback();
            throw error; // Ném lỗi ra cho Controller xử lý gửi về Client
        } finally {
            connection.release(); // Trả connection lại cho Pool
        }
    },

    // Lấy lịch sử mua hàng của 1 khách hàng cụ thể
    findByCustomer: async (customerId) => {
        const [rows] = await pool.query(
            'SELECT * FROM orders WHERE customer_id = ? ORDER BY order_date DESC', 
            [customerId]
        );
        return rows;
    },

    // Lấy chi tiết đơn hàng (JOIN với products để ra tên và ảnh)
    findById: async (orderId) => {
        const [orderRows] = await pool.query(
            `SELECT o.*, c.full_name as customer_name, c.phone as customer_phone 
             FROM orders o 
             JOIN customers c ON o.customer_id = c.id 
             WHERE o.id = ?`,
            [orderId]
        );
        if (orderRows.length === 0) return null;
        
        const order = orderRows[0];

        const [detailRows] = await pool.query(
            `SELECT od.quantity, od.unit_price, p.id as product_id, p.name as product_name, p.image_url 
             FROM order_details od 
             JOIN products p ON od.product_id = p.id 
             WHERE od.order_id = ?`,
            [orderId]
        );
        
        order.items = detailRows;
        return order;
    },

    // Admin/Nhân viên cập nhật trạng thái đơn (PENDING -> PROCESSING -> SHIPPED -> DELIVERED)
    updateStatus: async (orderId, status) => {
        const connection = await pool.getConnection();
        try {
            await connection.beginTransaction();

            // Lấy trạng thái hiện tại
            const [orderRows] = await connection.query('SELECT status FROM orders WHERE id = ? FOR UPDATE', [orderId]);
            if (orderRows.length === 0) {
                await connection.rollback();
                return 0;
            }
            const currentStatus = orderRows[0].status;

            if (currentStatus === status) {
                await connection.commit();
                return 1;
            }

            // Nếu hủy đơn hàng, trả lại số lượng tồn kho
            if (status === 'CANCELLED' && currentStatus !== 'CANCELLED') {
                const [items] = await connection.query('SELECT product_id, quantity FROM order_details WHERE order_id = ?', [orderId]);
                for (const item of items) {
                    await connection.query(
                        'UPDATE products SET stock_quantity = stock_quantity + ? WHERE id = ?',
                        [item.quantity, item.product_id]
                    );
                }
            }
            // Nếu chuyển trạng thái từ CANCELLED sang trạng thái khác (phục hồi đơn), trừ số lượng tồn kho
            else if (currentStatus === 'CANCELLED' && status !== 'CANCELLED') {
                const [items] = await connection.query('SELECT product_id, quantity FROM order_details WHERE order_id = ?', [orderId]);
                for (const item of items) {
                    const [prod] = await connection.query('SELECT name, stock_quantity FROM products WHERE id = ? FOR UPDATE', [item.product_id]);
                    if (prod.length > 0 && prod[0].stock_quantity < item.quantity) {
                        throw new Error(`Sản phẩm [${prod[0].name}] không đủ số lượng trong kho để phục hồi đơn hàng.`);
                    }
                    await connection.query(
                        'UPDATE products SET stock_quantity = stock_quantity - ? WHERE id = ?',
                        [item.quantity, item.product_id]
                    );
                }
            }

            // Cập nhật trạng thái
            const [result] = await connection.query(
                'UPDATE orders SET status = ? WHERE id = ?',
                [status, orderId]
            );

            await connection.commit();
            return result.affectedRows;
        } catch (error) {
            await connection.rollback();
            throw error;
        } finally {
            connection.release();
        }
    },
    
    // Admin lấy toàn bộ danh sách đơn hàng (Có phân trang và Lọc trạng thái)
    findAll: async ({ status, limit = 20, offset = 0 }) => {
        let query = `
            SELECT o.*, c.full_name as customer_name, c.phone as customer_phone 
            FROM orders o 
            JOIN customers c ON o.customer_id = c.id 
            WHERE 1=1`;
        let countQuery = 'SELECT COUNT(*) as total FROM orders o WHERE 1=1';
        const params = [];

        if (status) {
            query += ' AND o.status = ?';
            countQuery += ' AND o.status = ?';
            params.push(status);
        }

        query += ' ORDER BY o.order_date DESC LIMIT ? OFFSET ?';
        
        const [rows] = await pool.query(query, [...params, parseInt(limit), parseInt(offset)]);
        const [countResult] = await pool.query(countQuery, params);

        return {
            data: rows,
            total: countResult[0].total
        };
    },

    // Hàm tiện ích: Chuyển đổi User_ID (lấy từ Token JWT) thành Customer_ID
    getCustomerIdByUserId: async (userId) => {
        const [rows] = await pool.query('SELECT id FROM customers WHERE user_id = ?', [userId]);
        return rows.length > 0 ? rows[0].id : null;
    }
};

module.exports = Order;
