const STATUS_BADGE = {
    'PENDING':    '<span class="badge bg-warning text-dark">Chờ xử lý</span>',
    'PROCESSING': '<span class="badge bg-info text-dark">Đang xử lý</span>',
    'SHIPPED':    '<span class="badge bg-primary">Đang giao</span>',
    'DELIVERED':  '<span class="badge bg-success">Đã giao</span>',
    'CANCELLED':  '<span class="badge bg-danger">Đã hủy</span>'
};

function initSidebar() {
    const user = JSON.parse(localStorage.getItem('user'));
    if (user) {
        const firstChar = (user.full_name || user.username || '?')[0].toUpperCase();
        document.getElementById('user-avatar').textContent = firstChar;
        document.getElementById('user-name-sidebar').textContent = user.full_name || user.username;
    }
}

async function loadOrders() {
    document.getElementById('loading-orders').style.display = 'block';
    document.getElementById('orders-table-container').style.display = 'none';
    document.getElementById('empty-orders').style.display = 'none';

    try {
        const res = await api.get('/orders/history');
        document.getElementById('loading-orders').style.display = 'none';

        if (!res.data || res.data.length === 0) {
            document.getElementById('empty-orders').style.display = 'block';
            return;
        }

        document.getElementById('orders-table-container').style.display = 'block';
        const tbody = document.getElementById('orders-tbody');
        tbody.innerHTML = '';

        res.data.forEach(order => {
            const date = new Date(order.order_date).toLocaleDateString('vi-VN');
            const statusUpper = (order.status || 'PENDING').toUpperCase();
            const badge = STATUS_BADGE[statusUpper] || `<span class="badge bg-secondary">${order.status}</span>`;
            const tr = document.createElement('tr');
            tr.innerHTML = `
                <td class="fw-bold">#${String(order.id).padStart(6, '0')}</td>
                <td>${date}</td>
                <td>${formatPrice(order.total_amount)}</td>
                <td><small class="text-uppercase text-muted">${order.payment_method || 'cod'}</small></td>
                <td>${badge}</td>
                <td>
                    <button class="btn btn-sm btn-outline-dark detail-btn" data-id="${order.id}">Chi tiết</button>
                    ${statusUpper === 'PENDING' ? `<button class="btn btn-sm btn-outline-danger ms-1 cancel-btn" data-id="${order.id}">Hủy</button>` : ''}
                </td>`;
            tbody.appendChild(tr);
        });

        tbody.querySelectorAll('.detail-btn').forEach(btn => btn.addEventListener('click', () => showOrderDetail(btn.dataset.id)));
        tbody.querySelectorAll('.cancel-btn').forEach(btn => btn.addEventListener('click', () => cancelOrder(btn.dataset.id)));
    } catch (e) {
        document.getElementById('loading-orders').style.display = 'none';
        document.getElementById('empty-orders').style.display = 'block';
    }
}

async function showOrderDetail(orderId) {
    const modal = new bootstrap.Modal(document.getElementById('orderDetailModal'));
    const body = document.getElementById('orderDetailBody');
    body.innerHTML = '<div class="text-center py-3"><div class="spinner-border text-primary"></div></div>';
    modal.show();

    try {
        const res = await api.get(`/orders/${orderId}`);
        const order = res.data;
        const date = new Date(order.order_date).toLocaleDateString('vi-VN');
        const itemsHtml = order.items.map(item => `
            <div class="d-flex justify-content-between mb-2">
                <span>${item.product_name} <small class="text-muted">x${item.quantity}</small></span>
                <span>${formatPrice(item.unit_price * item.quantity)}</span>
            </div>`).join('');

        body.innerHTML = `
            <div class="mb-3">
                <p class="mb-1"><b>Mã đơn:</b> #${String(order.id).padStart(6, '0')} &nbsp;&nbsp; <b>Ngày đặt:</b> ${date}</p>
                <p class="mb-1"><b>Người nhận:</b> ${order.customer_name || '---'} &nbsp;|&nbsp; ${order.customer_phone || ''}</p>
                <p class="mb-1"><b>Địa chỉ nhận hàng:</b> ${order.shipping_address}</p>
                ${order.notes ? `<p class="mb-1"><b>Ghi chú:</b> ${order.notes}</p>` : ''}
            </div>
            <hr>
            <h6 class="fw-bold">Sản phẩm đặt mua</h6>
            ${itemsHtml}
            <hr>
            <div class="d-flex justify-content-between fs-5">
                <b>Tổng cộng:</b><b class="text-danger">${formatPrice(order.total_amount)}</b>
            </div>`;
    } catch (e) {
        body.innerHTML = '<p class="text-danger">Không thể tải chi tiết đơn hàng.</p>';
    }
}

async function cancelOrder(orderId) {
    if (!confirm('Bạn có chắc muốn hủy đơn hàng này không?')) return;
    try {
        await api.put(`/orders/${orderId}/cancel`);
        alert('Đã hủy đơn hàng thành công!');
        loadOrders();
    } catch (e) {
        alert('Lỗi hủy đơn: ' + e.message);
    }
}

function renderPagination({ page, totalPages }, onPageChange) {
    const nav = document.getElementById('orders-pagination');
    if (totalPages <= 1) { nav.innerHTML = ''; return; }

    let html = '<ul class="pagination justify-content-center mt-3">';
    for (let i = 1; i <= totalPages; i++) {
        html += `<li class="page-item ${i === page ? 'active' : ''}"><a class="page-link" href="#" data-page="${i}">${i}</a></li>`;
    }
    html += '</ul>';
    nav.innerHTML = html;
    nav.querySelectorAll('a.page-link').forEach(a => {
        a.addEventListener('click', e => {
            e.preventDefault();
            onPageChange(parseInt(e.target.dataset.page));
            window.scrollTo(0, 0);
        });
    });
}

document.addEventListener('DOMContentLoaded', () => {
    document.getElementById('logout-btn').addEventListener('click', e => {
        e.preventDefault();
        logout();
    });

    const token = localStorage.getItem('token');
    if (!token) {
        window.location.href = 'auth.html';
        return;
    }

    initSidebar();
    loadOrders();
});