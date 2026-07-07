// admin-main.js - Mã JS dùng chung cho trang Quản Trị Admin

document.addEventListener('DOMContentLoaded', () => {
    adminInit();
});

function adminInit() {
    checkAdminAuth();
    initSidebarToggle();
    renderAdminHeader();
}

// 1. Kiểm tra xác thực & phân quyền Admin
function checkAdminAuth() {
    const token = localStorage.getItem('token');
    const user = JSON.parse(localStorage.getItem('user'));

    if (!token || !user) {
        alert('Vui lòng đăng nhập tài khoản quản trị!');
        window.location.href = '../auth.html';
        return;
    }

    const role = user.role ? user.role.toUpperCase() : '';
    const allowedRoles = ['ADMIN', 'STAFF', 'MANAGER', 'OWNER'];
    if (!allowedRoles.includes(role)) {
        alert('Truy cập bị từ chối. Bạn không có quyền truy cập trang quản trị!');
        window.location.href = '../index.html';
        return;
    }
}

// 2. Kích hoạt nút toggle sidebar trên thiết bị di động (Responsive)
function initSidebarToggle() {
    const toggleBtn = document.querySelector('.top-navbar .btn.d-md-none');
    const sidebar = document.querySelector('.sidebar');
    
    if (toggleBtn && sidebar) {
        toggleBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            sidebar.classList.toggle('active');
        });
        
        document.addEventListener('click', (e) => {
            if (sidebar.classList.contains('active') && !sidebar.contains(e.target) && !toggleBtn.contains(e.target)) {
                sidebar.classList.remove('active');
            }
        });
    }
}

// 3. Hiển thị thông tin người dùng quản trị góc phải Navbar
function renderAdminHeader() {
    const user = JSON.parse(localStorage.getItem('user'));
    const adminNameSpan = document.querySelector('.top-navbar .d-flex.align-items-center span');
    
    if (user && adminNameSpan) {
        adminNameSpan.textContent = `Xin chào, ${user.full_name || user.username}`;
    }
    
    const logoutBtn = document.querySelector('.sidebar ul li a.text-danger');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', (e) => {
            e.preventDefault();
            if (confirm('Bạn có muốn đăng xuất tài khoản?')) {
                localStorage.removeItem('token');
                localStorage.removeItem('user');
                window.location.href = '../index.html';
            }
        });
    }
}
