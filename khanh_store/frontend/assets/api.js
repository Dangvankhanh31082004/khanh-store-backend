// Backend URL dùng cho môi trường Cloud
const API_BASE_URL =
    "https://khanh-store-backend-production.up.railway.app/api";

window.API_BASE_URL = API_BASE_URL;
window.API_HOST = "https://khanh-store-backend-production.up.railway.app";


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


        // Nếu upload ảnh bằng FormData thì bỏ Content-Type
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

                if (response.status === 401 || response.status === 403) {

                    console.warn(
                        'Authentication Error:',
                        data.message
                    );


                    if (!window.location.pathname.includes('auth.html')) {

                        localStorage.removeItem('token');
                        localStorage.removeItem('user');


                        const isInsideAdmin =
                            window.location.pathname.includes('/admin/');


                        window.location.href =
                            isInsideAdmin
                            ? '../auth.html'
                            : 'auth.html';
                    }
                }


                throw new Error(
                    data.message || 'Lỗi kết nối API'
                );
            }


            return data;


        } catch (error) {

            console.error('API Error:', error);

            throw error;
        }
    },


    get: (endpoint) =>
        api.fetch(endpoint, {
            method: 'GET'
        }),


    post: (endpoint, body) =>
        api.fetch(endpoint, {
            method: 'POST',
            body: JSON.stringify(body)
        }),


    put: (endpoint, body) =>
        api.fetch(endpoint, {
            method: 'PUT',
            body: JSON.stringify(body)
        }),


    delete: (endpoint) =>
        api.fetch(endpoint, {
            method: 'DELETE'
        }),


    upload: (endpoint, formData, method = 'POST') =>
        api.fetch(endpoint, {
            method,
            body: formData
        })

};