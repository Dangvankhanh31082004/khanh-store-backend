let editingProductId = null;
let searchTimeout;
let currentPage = 1;

async function loadCategories() {
    try {
        const res = await api.get('/categories');
        const filterSel = document.getElementById('filter-category');
        const formSel = document.getElementById('p-category');
        filterSel.innerHTML = '<option value="">Tất cả danh mục</option>';
        formSel.innerHTML = '<option value="">Chọn danh mục</option>';

        res.data.forEach(cat => {
            filterSel.innerHTML += `<option value="${cat.id}">${cat.name}</option>`;
            formSel.innerHTML += `<option value="${cat.id}">${cat.name}</option>`;
        });
    } catch (e) {
        console.error('Lỗi tải danh mục:', e);
    }
}

async function loadStores() {
    try {
        const res = await api.get('/stores');
        const storeSel = document.getElementById('p-store');
        storeSel.innerHTML = '<option value="">Chọn cửa hàng</option>';
        res.data.forEach(store => {
            storeSel.innerHTML += `<option value="${store.id}">${store.name}</option>`;
        });
    } catch (e) {
        console.error('Lỗi tải cửa hàng:', e);
        document.getElementById('p-store').innerHTML = '<option value="">Không tải được cửa hàng</option>';
    }
}

async function loadProducts(page = 1) {
    currentPage = page;
    const search = document.getElementById('search-products').value;
    const catId = document.getElementById('filter-category').value;
    let url = `/products?page=${page}&limit=10`;
    if (search) url += `&search=${encodeURIComponent(search)}`;
    if (catId) url += `&category_id=${catId}`;

    const tbody = document.getElementById('products-tbody');
    tbody.innerHTML = '<tr><td colspan="7" class="text-center py-4"><div class="spinner-border text-primary"></div></td></tr>';

    try {
        const res = await api.get(url);
        tbody.innerHTML = '';
        if (!res.data.length) {
            tbody.innerHTML = '<tr><td colspan="7" class="text-center py-4 text-muted">Không có sản phẩm nào.</td></tr>';
            renderPagination(res.pagination, document.getElementById('products-pagination'), loadProducts);
            return;
        }

        res.data.forEach(p => {
            const tr = document.createElement('tr');
            tr.innerHTML = `
                <td>#${p.id}</td>
                <td><img src="${getProductImageUrl(p.image_url)}" width="50" class="rounded" alt="${p.name}"></td>
                <td class="fw-semibold text-truncate" style="max-width:200px">${p.name}</td>
                <td><span class="badge bg-light text-dark border">${p.category_name || '---'}</span></td>
                <td>${formatPrice(p.price)}</td>
                <td><span class="badge ${p.stock_quantity > 0 ? 'bg-success' : 'bg-danger'}">${p.stock_quantity}</span></td>
                <td>
                    <button class="btn btn-sm btn-outline-primary me-1 edit-btn" data-id="${p.id}"><i class="bi bi-pencil"></i></button>
                    <button class="btn btn-sm btn-outline-danger delete-btn" data-id="${p.id}"><i class="bi bi-trash"></i></button>
                </td>`;
            tbody.appendChild(tr);
        });

        tbody.querySelectorAll('.edit-btn').forEach(btn => btn.addEventListener('click', () => openEditModal(btn.dataset.id)));
        tbody.querySelectorAll('.delete-btn').forEach(btn => btn.addEventListener('click', () => deleteProduct(btn.dataset.id)));
        renderPagination(res.pagination, document.getElementById('products-pagination'), loadProducts);
    } catch (e) {
        tbody.innerHTML = `<tr><td colspan="7" class="text-center text-danger">${e.message}</td></tr>`;
    }
}

async function openEditModal(productId) {
    editingProductId = productId;
    document.getElementById('productModalTitle').textContent = 'Chỉnh sửa sản phẩm';
    document.getElementById('product-id').value = productId;

    try {
        const res = await api.get(`/products/${productId}`);
        const p = res.data;
        document.getElementById('p-name').value = p.name;
        document.getElementById('p-price').value = p.price;
        document.getElementById('p-stock').value = p.stock_quantity;
        document.getElementById('p-image').value = p.image_url || '';
        document.getElementById('p-desc').value = p.description || '';
        document.getElementById('p-category').value = p.category_id;
        document.getElementById('p-store').value = p.store_id || '';
        document.getElementById('p-image-file').value = '';
        new bootstrap.Modal(document.getElementById('productModal')).show();
    } catch (e) {
        alert('Lỗi tải dữ liệu sản phẩm: ' + e.message);
    }
}

function resetProductForm() {
    editingProductId = null;
    document.getElementById('productModalTitle').textContent = 'Thêm sản phẩm mới';
    document.getElementById('product-form').reset();
    document.getElementById('product-id').value = '';
}

async function saveProduct() {
    const name = document.getElementById('p-name').value.trim();
    const categoryId = parseInt(document.getElementById('p-category').value);
    const storeId = parseInt(document.getElementById('p-store').value);
    const price = parseFloat(document.getElementById('p-price').value);
    const stockQuantity = parseInt(document.getElementById('p-stock').value);
    const imageUrl = document.getElementById('p-image').value.trim() || null;
    const description = document.getElementById('p-desc').value.trim();
    const imageFile = document.getElementById('p-image-file').files[0];

    if (!name || isNaN(categoryId) || isNaN(storeId) || isNaN(price) || isNaN(stockQuantity)) {
        alert('Vui lòng điền đầy đủ thông tin bắt buộc!');
        return;
    }

    try {
        if (imageFile) {
            const formData = new FormData();
            formData.append('name', name);
            formData.append('category_id', categoryId);
            formData.append('store_id', storeId);
            formData.append('price', price);
            formData.append('stock_quantity', stockQuantity);
            formData.append('description', description);
            formData.append('image', imageFile);
            if (!editingProductId) {
                await api.upload('/products', formData, 'POST');
            } else {
                await api.upload(`/products/${editingProductId}`, formData, 'PUT');
            }
        } else {
            const payload = {
                name,
                category_id: categoryId,
                store_id: storeId,
                price,
                stock_quantity: stockQuantity,
                image_url: imageUrl,
                description
            };
            if (editingProductId) {
                await api.put(`/products/${editingProductId}`, payload);
            } else {
                await api.post('/products', payload);
            }
        }

        bootstrap.Modal.getInstance(document.getElementById('productModal')).hide();
        loadProducts(currentPage);
    } catch (e) {
        alert('Lỗi lưu sản phẩm: ' + e.message);
    }
}

async function deleteProduct(id) {
    if (!confirm('Bạn chắc chắn muốn xóa sản phẩm này không?')) return;
    try {
        await api.delete(`/products/${id}`);
        loadProducts(currentPage);
    } catch (e) {
        alert('Lỗi xóa sản phẩm: ' + e.message);
    }
}

function renderPagination({ page, totalPages }, navEl, onPageChange) {
    if (totalPages <= 1) { navEl.innerHTML = ''; return; }
    let html = '<ul class="pagination justify-content-center mt-3">';
    for (let i = 1; i <= totalPages; i++) {
        html += `<li class="page-item ${i === page ? 'active' : ''}"><a class="page-link" href="#" data-page="${i}">${i}</a></li>`;
    }
    html += '</ul>';
    navEl.innerHTML = html;
    navEl.querySelectorAll('a.page-link').forEach(a => {
        a.addEventListener('click', e => {
            e.preventDefault();
            onPageChange(parseInt(e.target.dataset.page));
        });
    });
}

document.addEventListener('DOMContentLoaded', () => {
    document.getElementById('add-product-btn').addEventListener('click', resetProductForm);
    document.getElementById('save-product-btn').addEventListener('click', saveProduct);
    document.getElementById('search-products').addEventListener('input', () => {
        clearTimeout(searchTimeout);
        searchTimeout = setTimeout(() => loadProducts(1), 400);
    });
    document.getElementById('filter-category').addEventListener('change', () => loadProducts(1));
    adminInit();
    loadCategories();
    loadStores();
    loadProducts();
});