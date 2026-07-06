let viewingOrderId = null;
let currentPage = 1;

const STATUS_BADGE = {
    'PENDING':    '<span class="badge bg-warning text-dark">Chờ xử lý</span>',
    'PROCESSING': '<span class="badge bg-info text-dark">Đang xử lý</span>',
    'SHIPPED':    '<span class="badge bg-primary">Đang giao</span>',
    'DELIVERED':  '<span class="badge bg-success">Đã giao</span>',
    'CANCELLED':  '<span class="badge bg-danger">Đã hủy</span>'
};

async function loadOrders(page = 1) {
    currentPage = page;
    const status = document.getElementById('status-filter').value;
    let url = `/orders/admin/all?page=${page}&limit=15`;
    if (status) url += `&status=${status}`;

    const tbody = document.getElementById('orders-tbody');
    tbody.innerHTML = '<tr><td colspan="7" class="text-center py-4"><div class="spinner-border text-primary"></div></td></tr>';

    try {
        const res = await api.get(url);
        tbody.innerHTML = '';
        if (!res.data.length) {
            tbody.innerHTML = '<tr><td colspan="7" class="text-center py-4 text-muted">Không có đơn hàng nào.</td></tr>';
            renderPagination(res.pagination, document.getElementById('orders-pagination'), loadOrders);
            return;
        }

        res.data.forEach(o => {
            const date = new Date(o.order_date).toLocaleDateString('vi-VN');
            const statusUpper = (o.status || 'PENDING').toUpperCase();
            const badge = STATUS_BADGE[statusUpper] || `<span class="badge bg-secondary">${o.status}</span>`;
            const tr = document.createElement('tr');
            tr.innerHTML = `
                <td class="fw-bold">#${String(o.id).padStart(6, '0')}</td>
                <td>${o.customer_name || '---'}</td>
                <td>${date}</td>
                <td>${formatPrice(o.total_amount)}</td>
                <td><small class="text-uppercase text-muted">${o.payment_method || 'cod'}</small></td>
                <td>${badge}</td>
                <td><button class="btn btn-sm btn-outline-dark detail-btn" data-id="${o.id}">Chi tiết</button></td>`;
            tbody.appendChild(tr);
        });

        tbody.querySelectorAll('.detail-btn').forEach(btn => btn.addEventListener('click', () => showOrderDetail(btn.dataset.id)));
        renderPagination(res.pagination, document.getElementById('orders-pagination'), loadOrders);
    } catch (e) {
        tbody.innerHTML = `<tr><td colspan="7" class="text-center text-danger">${e.message}</td></tr>`;
    }
}

async function showOrderDetail(orderId) {
    viewingOrderId = orderId;
    const modal = new bootstrap.Modal(document.getElementById('orderModal'));
    const body = document.getElementById('orderModalBody');
    body.innerHTML = '<div class="text-center py-3"><div class="spinner-border text-primary"></div></div>';
    modal.show();

    try {
        const res = await api.get(`/orders/${orderId}`);
        const o = res.data;
        document.getElementById('orderModalTitle').textContent = `Đơn #${String(o.id).padStart(6, '0')}`;
        document.getElementById('update-status-select').value = (o.status || 'PENDING').toUpperCase();

        const itemsHtml = o.items.map(item => `
            <div class="d-flex justify-content-between mb-2">
                <span>${item.product_name} <small class="text-muted">x${item.quantity}</small></span>
                <span>${formatPrice(item.unit_price * item.quantity)}</span>
            </div>`).join('');

        body.innerHTML = `
            <p><b>Khách hàng:</b> ${o.customer_name || '---'} &nbsp;|&nbsp; ${o.customer_phone || ''}</p>
            <p><b>Địa chỉ nhận:</b> ${o.shipping_address}</p>
            ${o.notes ? `<p><b>Ghi chú:</b> ${o.notes}</p>` : ''}
            <hr>
            <h6 class="fw-bold">Sản phẩm</h6>
            ${itemsHtml}
            <hr>
            <div class="d-flex justify-content-between fs-5">
                <b>Tổng cộng:</b><b class="text-danger">${formatPrice(o.total_amount)}</b>
            </div>`;
    } catch (e) {
        body.innerHTML = '<p class="text-danger">Không thể tải chi tiết.</p>';
    }
}

document.addEventListener('DOMContentLoaded', () => {
    document.getElementById('update-status-btn').addEventListener('click', async () => {
        if (!viewingOrderId) return;
        const newStatus = document.getElementById('update-status-select').value;
        try {
            await api.put(`/orders/${viewingOrderId}/status`, { status: newStatus });
            bootstrap.Modal.getInstance(document.getElementById('orderModal')).hide();
            loadOrders(currentPage);
        } catch (e) {
            alert('Lỗi cập nhật: ' + e.message);
        }
    });

    document.getElementById('status-filter').addEventListener('change', () => loadOrders(1));
    adminInit();
    loadOrders();
});