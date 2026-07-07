/**
 * responseHelper.js
 * Provides a consistent JSON response format for API endpoints.
 * Usage:
 *   const { sendSuccess, sendError } = require('../utils/responseHelper');
 *   sendSuccess(res, data, message);
 *   sendError(res, error, statusCode);
 */

function sendSuccess(res, data = null, message = 'Success') {
  return res.json({
    success: true,
    message,
    data,
  });
}

function sendError(res, error, statusCode = 500) {
  const errMessage = error && error.message ? error.message : 'Internal Server Error';
  const errStatus = error && error.status ? error.status : statusCode;
  return res.status(errStatus).json({
    success: false,
    message: errMessage,
    error: process.env.NODE_ENV === 'development' ? errMessage : undefined,
  });
}

module.exports = {
  sendSuccess,
  sendError,
};
