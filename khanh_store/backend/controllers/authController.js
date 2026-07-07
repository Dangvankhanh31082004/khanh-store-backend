const authService = require('../services/authService');

const authController = {
    register: async (req, res) => {
        try {
            const result = await authService.register(req.body);
            res.status(201).json({ message: result.message });
        } catch (error) {
            console.error('Lỗi khi đăng ký:', error);
            res.status(error.status || 500).json({ message: error.message || 'Lỗi server nội bộ.' });
        }
    },

    login: async (req, res) => {
        try {
            const result = await authService.login(req.body);
            res.json({ message: 'Đăng nhập thành công', ...result });
        } catch (error) {
            console.error('Lỗi khi đăng nhập:', error);
            res.status(error.status || 500).json({ message: error.message || 'Lỗi server nội bộ.' });
        }
    },

    me: async (req, res) => {
        try {
            const user = await authService.getProfile(req.user.id);
            res.json({ message: 'Lấy thông tin cá nhân thành công', data: user });
        } catch (error) {
            console.error('Lỗi khi lấy thông tin người dùng:', error);
            res.status(error.status || 500).json({ message: error.message || 'Lỗi server nội bộ.' });
        }
    },

    updateProfile: async (req, res) => {
        try {
            const updatedUser = await authService.updateProfile(req.user.id, req.body);
            res.json({ message: 'Cập nhật hồ sơ thành công', data: updatedUser });
        } catch (error) {
            console.error('Lỗi cập nhật hồ sơ:', error);
            res.status(error.status || 500).json({ message: error.message || 'Lỗi server nội bộ.' });
        }
    },

    refreshToken: async (req, res) => {
        try {
            const tokens = await authService.refreshToken(req.body.refreshToken);
            res.json(tokens);
        } catch (error) {
            console.error('Lỗi refresh token:', error);
            res.status(error.status || 500).json({ message: error.message || 'Lỗi server nội bộ.' });
        }
    }
};

module.exports = authController;
