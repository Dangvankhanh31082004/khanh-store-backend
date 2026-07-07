let cartForOrder = [];
let totalAmount = 0;

function showToast(message, type = 'success') {
    const toastEl = document.getElementById('toast-msg');
    const toastBody = document.getElementById('toast-body');
    toastBody.textContent = message;
    toastEl.className = `toast align-items-center text-bg-${type} border-0`;
    const toast = new bootstrap.Toast(toastEl, { delay: 3000 });
    toast.show();
}

async function loadStores() {
    try {
        const res = await api.get('/stores');
        const select = document.getElementById('store-select');
        select.innerHTML = '';

        if (res.data && res.data.length > 0) {
            res.data.forEach(store => {
                const option = document.createElement('option');
                option.value = store.id;
                option.textContent = `${store.name} - ${store.address}`;
                select.appendChild(option);
            });
        } else {
            select.innerHTML = '<option value="">Không tìm thấy chi nhánh nào</option>';
        }
    } catch (e) {
        console.error('Lỗi tải danh sách chi nhánh:', e);
        document.getElementById('store-select').innerHTML = '<option value="">Lỗi tải danh sách chi nhánh</option>';
    }
}

async function loadOrderSummary() {
    const localCart = JSON.parse(localStorage.getItem('cart')) || [];
    const summaryContainer = document.getElementById('order-summary-items');

    if (localCart.length === 0) {
        summaryContainer.innerHTML = '<p class="text-muted">Giỏ hàng trống.</p>';
        return;
    }

    try {
        const res = await api.post('/orders/validate-cart', { items: localCart });
        cartForOrder = res.data;
        totalAmount = res.total_amount;

        let html = '';
        cartForOrder.forEach(item => {
            html += `
                <div class="d-flex justify-content-between mb-3 align-items-center">
                    <div><h6 class="mb-0">${item.name}</h6><small class="text-muted">SL: ${item.request_quantity}</small></div>
                    <span class="fw-semibold">${formatPrice(item.price * item.request_quantity)}</span>
                </div>`;
        });

        summaryContainer.innerHTML = html;
        document.getElementById('summary-total').textContent = formatPrice(totalAmount);
        document.getElementById('place-order-btn').disabled = false;
    } catch (e) {
        summaryContainer.innerHTML = '<p class="text-danger">Lỗi tải giỏ hàng. <a href="cart.html">Về giỏ hàng</a></p>';
    }
}

function prefillUserInfo() {
    const user = JSON.parse(localStorage.getItem('user'));
    if (user) {
        document.getElementById('full-name').value = user.full_name || user.username || '';
        document.getElementById('phone').value = user.phone || '';
    }
}

async function placeOrder() {
    const name = document.getElementById('full-name').value.trim();
    const phone = document.getElementById('phone').value.trim();
    const address = document.getElementById('shipping-address').value.trim();
    const storeId = document.getElementById('store-select').value;

    if (!name || !phone || !address || !storeId) {
        alert('Vui lòng điền đầy đủ thông tin giao hàng!');
        return;
    }

    const paymentMethod = document.querySelector('input[name="payment"]:checked').value;
    const btn = document.getElementById('place-order-btn');
    btn.disabled = true;
    btn.innerHTML = '<span class="spinner-border spinner-border-sm me-2"></span>Đang đặt hàng...';

    try {
        const orderData = {
            store_id: parseInt(storeId),
            items: cartForOrder.map(item => ({ product_id: item.product_id, quantity: item.request_quantity })),
            shipping_address: address,
            notes: document.getElementById('notes').value.trim(),
            payment_method: paymentMethod
        };

        const res = await api.post('/orders/checkout', orderData);
        localStorage.removeItem('cart');
        showToast('Đặt hàng thành công! Mã đơn hàng: #' + res.order_id);
        setTimeout(() => window.location.href = 'orders.html', 2500);
    } catch (e) {
        showToast('Lỗi đặt hàng: ' + e.message, 'danger');
        btn.disabled = false;
        btn.innerHTML = 'ĐẶT HÀNG NGAY';
    }
}

document.addEventListener('DOMContentLoaded', () => {
    const token = localStorage.getItem('token');
    if (!token) {
        alert('Bạn cần đăng nhập để thanh toán!');
        window.location.href = 'auth.html';
        return;
    }

    prefillUserInfo();
    loadStores();
    loadOrderSummary();
    document.getElementById('place-order-btn').addEventListener('click', placeOrder);
});