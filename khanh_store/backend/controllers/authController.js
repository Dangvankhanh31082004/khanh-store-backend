const authService = require('../services/authService');
const { sendSuccess, sendError } = require('../utils/responseHelper');

const authController = {
    register: async (req, res) => {
        try {
            const result = await authService.register(req.body);
            sendSuccess(res, null, result.message);
        } catch (error) {
            console.error('Error during registration:', error);
            sendError(res, error);
        }
    },

    login: async (req, res) => {
        try {
            const result = await authService.login(req.body);
            sendSuccess(res, result, 'Đăng nhập thành công');
        } catch (error) {
            console.error('Error during login:', error);
            sendError(res, error);
        }
    },

    me: async (req, res) => {
        try {
            const user = await authService.getProfile(req.user.id);
            sendSuccess(res, user, 'Lấy thông tin cá nhân thành công');
        } catch (error) {
            console.error('Error fetching profile:', error);
            sendError(res, error);
        }
    },

    updateProfile: async (req, res) => {
        try {
            const updatedUser = await authService.updateProfile(req.user.id, req.body);
            sendSuccess(res, updatedUser, 'Cập nhật hồ sơ thành công');
        } catch (error) {
            console.error('Error updating profile:', error);
            sendError(res, error);
        }
    },

    refreshToken: async (req, res) => {
        try {
            const tokens = await authService.refreshToken(req.body.refreshToken);
            sendSuccess(res, tokens);
        } catch (error) {
            console.error('Error refreshing token:', error);
            sendError(res, error);
        }
    }
};

module.exports = authController;
const { sendSuccess, sendError } = require('../utils/responseHelper');

const authController = {
  register: async (req, res) => {
    try {
      const result = await authService.register(req.body);
      sendSuccess(res, null, result.message);
    } catch (error) {
      console.error('Error during registration:', error);
      sendError(res, error);
    }
  },

  login: async (req, res) => {
    try {
      const result = await authService.login(req.body);
      sendSuccess(res, result, 'Đăng nhập thành công');
    } catch (error) {
      console.error('Error during login:', error);
      sendError(res, error);
    }
  },

  me: async (req, res) => {
    try {
      const user = await authService.getProfile(req.user.id);
      sendSuccess(res, user, 'Lấy thông tin cá nhân thành công');
    } catch (error) {
      console.error('Error fetching profile:', error);
      sendError(res, error);
    }
  },

  updateProfile: async (req, res) => {
    try {
      const updatedUser = await authService.updateProfile(req.user.id, req.body);
      sendSuccess(res, updatedUser, 'Cập nhật hồ sơ thành công');
    } catch (error) {
      console.error('Error updating profile:', error);
      sendError(res, error);
    }
  },

  refreshToken: async (req, res) => {
    try {
      const tokens = await authService.refreshToken(req.body.refreshToken);
      sendSuccess(res, tokens);
    } catch (error) {
      console.error('Error refreshing token:', error);
      sendError(res, error);
    }
  }
};

module.exports = authController;
