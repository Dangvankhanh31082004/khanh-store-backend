// Hàm chạy khi tải xong bất kỳ trang nào
document.addEventListener('DOMContentLoaded', () => {
    updateHeaderAuthStatus();
    updateCartBadge();
});

// Cập nhật trạng thái nút Đăng Nhập / Tên User
function updateHeaderAuthStatus() {
    const user = JSON.parse(localStorage.getItem('user'));
    
    // Tìm nút Đăng nhập trong thanh Navbar
    const loginBtn = document.querySelector('a[href="auth.html"].btn');
    
    if (user && loginBtn) {
        const parentLi = loginBtn.parentElement;
        parentLi.classList.add('dropdown');
        parentLi.innerHTML = `
            <a class="nav-link dropdown-toggle fw-bold text-dark" href="#" data-bs-toggle="dropdown">
                <i class="bi bi-person-circle text-primary"></i> ${user.name}
            </a>
            <ul class="dropdown-menu dropdown-menu-end shadow border-0 mt-2 rounded-3">
                <li><a class="dropdown-item py-2" href="profile.html"><i class="bi bi-person me-2"></i> Hồ sơ cá nhân</a></li>
                <li><a class="dropdown-item py-2" href="orders.html"><i class="bi bi-bag me-2"></i> Lịch sử đơn hàng</a></li>
                ${user.role !== 'USER' ? `<li><hr class="dropdown-divider"></li><li><a class="dropdown-item py-2 fw-bold text-primary" href="admin/index.html"><i class="bi bi-speedometer2 me-2"></i> Trang Quản trị</a></li>` : ''}
                <li><hr class="dropdown-divider"></li>
                <li><a class="dropdown-item py-2 text-danger" href="#" onclick="logout()"><i class="bi bi-box-arrow-right me-2"></i> Đăng xuất</a></li>
            </ul>
        `;
    }
}

// Xóa Token và Data khi Đăng xuất
function logout() {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    window.location.href = 'index.html';
}

// Cập nhật con số hiển thị trên Giỏ hàng Navbar
function updateCartBadge() {
    const cart = JSON.parse(localStorage.getItem('cart')) || [];
    const count = cart.reduce((sum, item) => sum + item.quantity, 0);
    
    const cartIcon = document.querySelector('.bi-cart3');
    if (!cartIcon) return;
    
    const cartLink = cartIcon.parentElement;
    let badge = cartLink.querySelector('.badge');
    
    if (!badge) {
        cartLink.classList.add('position-relative');
        badge = document.createElement('span');
        badge.className = 'position-absolute top-0 start-100 translate-middle badge rounded-pill bg-danger';
        cartLink.appendChild(badge);
    }
    
    badge.textContent = count;
    badge.style.display = count === 0 ? 'none' : 'inline-block';
}

// Hàm thêm sản phẩm vào Giỏ (Sử dụng chung cho các trang)
function addToCart(productId, quantity = 1) {
    let cart = JSON.parse(localStorage.getItem('cart')) || [];
    const existingIndex = cart.findIndex(item => item.product_id === parseInt(productId));
    
    if (existingIndex > -1) {
        cart[existingIndex].quantity += parseInt(quantity);
    } else {
        cart.push({ product_id: parseInt(productId), quantity: parseInt(quantity) });
    }
    
    localStorage.setItem('cart', JSON.stringify(cart));
    updateCartBadge();
    alert('Đã thêm sản phẩm vào giỏ hàng!');
}

// Định dạng tiền tệ VNĐ
function formatPrice(amount) {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);
}

// Giải quyết đường dẫn ảnh động bằng cách map các tệp ảnh tĩnh từ SQL sang ảnh Unsplash thực tế
function getProductImageUrl(imagePath) {
    if (!imagePath) {
        return 'https://images.unsplash.com/photo-1531403009284-440f080d1e12?q=80&w=500';
    }
    if (imagePath.startsWith('http')) {
        return imagePath;
    }
    if (imagePath.startsWith('/uploads/')) {
        return `http://localhost:5000${imagePath}`;
    }
    
    // Ánh xạ ảnh mẫu Unsplash chất lượng cao cho các sản phẩm trong file SQL
    const mapping = {
        'laptop-macbook-pro': 'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?q=80&w=500',
        'laptop-dell-xps': 'https://images.unsplash.com/photo-1593642632823-8f785ba67e45?q=80&w=500',
        'laptop-thinkpad': 'https://images.unsplash.com/photo-1588872657578-7efd1f1555ed?q=80&w=500',
        'laptop-rog': 'https://images.unsplash.com/photo-1603302576837-37561b2e2302?q=80&w=500',
        'pc-01': 'https://images.unsplash.com/photo-1593640408182-31c70c8268f5?q=80&w=500',
        'pc-02': 'https://images.unsplash.com/photo-1587831990711-23ca6441447b?q=80&w=500',
        'pc-03': 'https://images.unsplash.com/photo-1618477388954-7852f32655ec?q=80&w=500',
        'mouse-logi-pro': 'https://images.unsplash.com/photo-1527814050087-379381547961?q=80&w=500',
        'mouse-da-v3': 'https://images.unsplash.com/photo-1615663245857-ac93bb7c39e7?q=80&w=500',
        'mouse-mx3s': 'https://images.unsplash.com/photo-1625842268584-8f329040ff0b?q=80&w=500',
        'mouse-viper': 'https://images.unsplash.com/photo-1615663245857-ac93bb7c39e7?q=80&w=500',
        'kb-akko': 'https://images.unsplash.com/photo-1595225476474-87563907a212?q=80&w=500',
        'kb-keychron': 'https://images.unsplash.com/photo-1618384887929-16ec33fab9ef?q=80&w=500',
        'kb-razer': 'https://images.unsplash.com/photo-1587829741301-dc798b83add3?q=80&w=500',
        'kb-corsair': 'https://images.unsplash.com/photo-1601445638532-3c6f6c3aa1d6?q=80&w=500',
        'ssd-ss': 'https://images.unsplash.com/photo-1597872200969-2b65dffc90a9?q=80&w=500',
        'ssd-wd': 'https://images.unsplash.com/photo-1597872200969-2b65dffc90a9?q=80&w=500',
        'ssd-kingston': 'https://images.unsplash.com/photo-1597872200969-2b65dffc90a9?q=80&w=500',
        'ram-corsair': 'https://images.unsplash.com/photo-1562976540-1502c2145186?q=80&w=500',
        'ram-gskill': 'https://images.unsplash.com/photo-1562976540-1502c2145186?q=80&w=500',
        'ram-kingston': 'https://images.unsplash.com/photo-1562976540-1502c2145186?q=80&w=500',
        'cpu-i9': 'https://images.unsplash.com/photo-1591453089816-0fbb971b454c?q=80&w=500',
        'cpu-amd': 'https://images.unsplash.com/photo-1591453089816-0fbb971b454c?q=80&w=500',
        'cpu-i5': 'https://images.unsplash.com/photo-1591453089816-0fbb971b454c?q=80&w=500',
        'main-asus': 'https://images.unsplash.com/photo-1518770660439-4636190af475?q=80&w=500',
        'main-msi': 'https://images.unsplash.com/photo-1518770660439-4636190af475?q=80&w=500',
        'main-giga': 'https://images.unsplash.com/photo-1518770660439-4636190af475?q=80&w=500',
        'hp-hyperx': 'https://images.unsplash.com/photo-1546435770-a3e426bf472b?q=80&w=500',
        'hp-sony': 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?q=80&w=500',
        'hp-razer': 'https://images.unsplash.com/photo-1606220588913-b3aacb4d2f4f?q=80&w=500',
        'mon-lg': 'https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?q=80&w=500',
        'mon-asus': 'https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?q=80&w=500',
        'mon-dell': 'https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?q=80&w=500'
    };

    const key = Object.keys(mapping).find(k => imagePath.includes(k));
    return key ? mapping[key] : 'https://images.unsplash.com/photo-1531403009284-440f080d1e12?q=80&w=500';
}
