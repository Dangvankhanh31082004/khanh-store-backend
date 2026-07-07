const jwt = require('jsonwebtoken');

// 1. MIDDLEWARE XÁC THỰC (Đã đăng nhập chưa?)
const authenticate = (req, res, next) => {
    // Lấy token từ Header: "Authorization: Bearer <token>"
    const authHeader = req.headers['authorization'];
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({ message: 'Quyền truy cập bị từ chối. Token không tồn tại hoặc sai định dạng Bearer.' });
    }
    
    const token = authHeader.split(' ')[1]; 

    // Kiểm tra tính hợp lệ của token
    jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
        if (err) {
            return res.status(403).json({ 
                message: 'Token không hợp lệ hoặc đã hết hạn (Unauthorized).',
                error: err.name === 'TokenExpiredError' ? 'TokenExpired' : 'InvalidToken'
            });
        }
        
        // Lưu thông tin giải mã được từ JWT vào request để các controller tiếp theo sử dụng
        req.user = user; 
        next(); // Cho phép đi tiếp
    });
};

// 2. MIDDLEWARE PHÂN QUYỀN (Có quyền làm hành động này không?)
const authorize = (roles = []) => {
    // Ép kiểu roles thành mảng nếu truyền vào là string
    if (typeof roles === 'string') {
        roles = [roles];
    }

    return (req, res, next) => {
        // Phải đảm bảo đã chạy qua middleware `authenticate`
        if (!req.user || !req.user.role) {
            return res.status(401).json({ message: 'Lỗi không tìm thấy thông tin user trong request.' });
        }

        // Chuyển về chữ thường để dễ so sánh (admin, manager, staff, owner, user)
        const userRole = req.user.role.toLowerCase();
        const mappedRoles = roles.map(r => r.toLowerCase());

        // Kiểm tra xem role của user hiện tại có nằm trong danh sách được phép không.
        // Chú ý: Vì DB đang lưu tên role là CUSTOMER, ta sẽ coi 'customer' tương đương với 'user'
        const isAuthorized = mappedRoles.includes(userRole) || 
                             (mappedRoles.includes('user') && userRole === 'customer');

        if (!isAuthorized) {
            return res.status(403).json({ message: 'Truy cập bị từ chối. Bạn không có đủ quyền hạn!' });
module.exports = {
    authenticate: async (req, res, next) => {
        const authHeader = req.headers['authorization'];
        const token = authHeader && authHeader.split(' ')[1];
        if (!token) return res.status(401).json({ success: false, message: 'Missing token' });
        try {
            const payload = jwt.verify(token, process.env.JWT_SECRET);
            req.user = payload;
            next();
        } catch (err) {
            return res.status(403).json({ success: false, message: 'Invalid token' });
        }
    },
    authorize: (allowedRoles) => (req, res, next) => {
        if (!req.user) return res.status(401).json({ success: false, message: 'Unauthenticated' });
        const userRole = req.user.role?.toLowerCase();
        const hasAccess = allowedRoles.some(r => r.toLowerCase() === userRole);
        if (!hasAccess) return res.status(403).json({ success: false, message: 'Forbidden: insufficient role' });
        next();
    }
};
