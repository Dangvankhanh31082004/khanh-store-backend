const jwt = require('jsonwebtoken');

// 1. Authentication middleware – verifies JWT and attaches user payload
const authenticate = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({ success: false, message: 'Missing or malformed Authorization header' });
    }
    const token = authHeader.split(' ')[1];
    try {
        const payload = jwt.verify(token, process.env.JWT_SECRET);
        req.user = payload; // { id, username, role }
        next();
    } catch (err) {
        return res.status(403).json({ success: false, message: 'Invalid or expired token' });
    }
};

// 2. Authorization middleware – checks role against allowed list
const authorize = (allowedRoles = []) => {
    if (typeof allowedRoles === 'string') allowedRoles = [allowedRoles];
    return (req, res, next) => {
        if (!req.user || !req.user.role) {
            return res.status(401).json({ success: false, message: 'Unauthenticated' });
        }
        const userRole = req.user.role.toLowerCase();
        const normalized = allowedRoles.map(r => r.toLowerCase());
        // Treat 'customer' as 'user' for backward compatibility
        const hasAccess = normalized.includes(userRole) || (normalized.includes('user') && userRole === 'customer');
        if (!hasAccess) {
            return res.status(403).json({ success: false, message: 'Forbidden: insufficient role' });
        }
        next();
    };
};

module.exports = { authenticate, authorize };
