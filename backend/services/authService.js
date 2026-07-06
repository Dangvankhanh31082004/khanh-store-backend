const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const User = require('../models/userModel');

const generateTokens = (user) => {
    const payload = { id: user.id, username: user.username, role: user.role_name };
    const accessToken = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '15m' });
    const refreshToken = jwt.sign(payload, process.env.REFRESH_TOKEN_SECRET || process.env.JWT_SECRET, { expiresIn: '7d' });
    return { accessToken, refreshToken };
};

const authService = {
    register: async ({ username, email, password, full_name }) => {
        if (!username || !email || !password || !full_name) {
            throw new Error('Vui lòng nhập đủ thông tin.');
        }

        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            throw new Error('Định dạng email không hợp lệ.');
        }
        if (password.length < 6) {
            throw new Error('Mật khẩu phải chứa ít nhất 6 ký tự.');
        }

        const existingUser = await User.findByEmail(email);
        if (existingUser) throw new Error('Email đã tồn tại.');

        const existingUsername = await User.findByUsername(username);
        if (existingUsername) throw new Error('Username đã tồn tại.');

        let role = await User.getRoleByName('CUSTOMER');
        if (!role) role = await User.getRoleByName('user');
        if (!role) throw new Error('Không xác định được role mặc định.');

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        const userId = await User.create({
            username,
            email,
            password_hash: hashedPassword,
            role_id: role.id
        });

        await User.createCustomerProfile(userId, full_name);
        return { message: 'Đăng ký thành công. Vui lòng đăng nhập.' };
    },

    login: async ({ email, password }) => {
        if (!email || !password) {
            throw new Error('Vui lòng nhập email và password.');
        }

        const user = await User.findByEmail(email);
        if (!user) {
            const err = new Error('Email hoặc mật khẩu không đúng.');
            err.status = 401;
            throw err;
        }
        if (!user.is_active) {
            const err = new Error('Tài khoản đã bị khóa.');
            err.status = 403;
            throw err;
        }

        const isMatch = await bcrypt.compare(password, user.password_hash);
        if (!isMatch) {
            const err = new Error('Email hoặc mật khẩu không đúng.');
            err.status = 401;
            throw err;
        }

        const tokens = generateTokens(user);
        return {
            accessToken: tokens.accessToken,
            refreshToken: tokens.refreshToken,
            user: {
                id: user.id,
                username: user.username,
                email: user.email,
                full_name: user.full_name || user.username,
                phone: user.phone || '',
                address: user.address || '',
                role: user.role_name
            }
        };
    },

    getProfile: async (userId) => {
        const user = await User.findById(userId);
        if (!user) throw new Error('Không tìm thấy người dùng.');
        return user;
    },

    updateProfile: async (userId, payload) => {
        const { full_name, phone, address, password } = payload;
        if (!full_name && !phone && !address && !password) {
            throw new Error('Không có thông tin nào để cập nhật.');
        }
        return await User.updateProfile(userId, { full_name, phone, address, password });
    },

    refreshToken: async (refreshToken) => {
        if (!refreshToken) {
            const err = new Error('Không tìm thấy refresh token.');
            err.status = 401;
            throw err;
        }

        return new Promise((resolve, reject) => {
            jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET || process.env.JWT_SECRET, (err, userPayload) => {
                if (err) {
                    const error = new Error('Refresh token không hợp lệ hoặc đã hết hạn.');
                    error.status = 403;
                    reject(error);
                    return;
                }
                const payload = { id: userPayload.id, username: userPayload.username, role: userPayload.role };
                const newAccessToken = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '15m' });
                resolve({ accessToken: newAccessToken });
            });
        });
    }
};

module.exports = authService;
