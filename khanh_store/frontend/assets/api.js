// Backend URL dùng cho môi trường Cloud.
// Khi deploy Vercel: đặt biến BACKEND_URL trong file config.js hoặc Vercel Environment Variables.
const API_BASE_URL = (() => {
    const backendUrl =
        (typeof window.BACKEND_URL === 'string' && window.BACKEND_URL) ||
        (typeof window.ENV_BACKEND_URL === 'string' && window.ENV_BACKEND_URL);

    if (backendUrl) {
        return `${backendUrl.replace(/\/$/, '')}/api`;
    }

    // Không gọi /api trên Vercel vì frontend và backend deploy tách riêng.
    return '/api';
})();

window.API_BASE_URL = API_BASE_URL;
window.API_HOST = API_BASE_URL.replace(/\/api$/, '');

const api = {
    // Hàm gọi API cơ bản tự động nhúng JWT Token
    fetch: async (endpoint, options = {}) => {
        const token = localStorage.getItem('token');
        const headers = {
            'Content-Type': 'application/json',
            ...options.headers
        };

        if (token) {
            headers['Authorization'] = `Bearer ${token}`;
        }

        // Bỏ Content-Type nếu gửi FormData (upload file hình ảnh)
        if (options.body instanceof FormData) {
            delete headers['Content-Type'];
        }

        try {
            const response = await fetch(`${API_BASE_URL}${endpoint}`, {
                ...options,
                headers
            });

            const data = await response.json();

            if (!response.ok) {
                // Xử lý lỗi Token (Hết hạn hoặc sai)
                if (response.status === 401 || response.status === 403) {
                    console.warn('Authentication Error:', data.message);
                    if (!window.location.pathname.includes('auth.html')) {
                        localStorage.removeItem('token');
                        localStorage.removeItem('user');
                        const isInsideAdmin = window.location.pathname.includes('/admin/');
                        window.location.href = isInsideAdmin ? '../auth.html' : 'auth.html';
                    }
                }
                throw new Error(data.message || 'Lỗi kết nối API');
            }

            return data;
        } catch (error) {
            console.error('API Error:', error);
            throw error;
        }
    },

    get: (endpoint) => api.fetch(endpoint, { method: 'GET' }),
    post: (endpoint, body) => api.fetch(endpoint, { method: 'POST', body: JSON.stringify(body) }),
    put: (endpoint, body) => api.fetch(endpoint, { method: 'PUT', body: JSON.stringify(body) }),
    delete: (endpoint) => api.fetch(endpoint, { method: 'DELETE' }),
    upload: (endpoint, formData, method = 'POST') => api.fetch(endpoint, { method, body: formData }),
};
