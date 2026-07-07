let currentPage = 1;
let currentCategoryId = '';
let currentSearch = '';
let searchTimeout;
const LIMIT = 9;

async function loadCategories() {
    try {
        const res = await api.get('/categories');
        const list = document.getElementById('category-list');
        list.innerHTML = `<li class="mb-2">
            <a href="#" class="text-decoration-none text-dark fw-medium category-link active" data-id="">Tất cả</a>
        </li>`;

        res.data.forEach(cat => {
            const li = document.createElement('li');
            li.className = 'mb-2';
            li.innerHTML = `<a href="#" class="text-decoration-none text-secondary category-link" data-id="${cat.id}">${cat.name}</a>`;
            list.appendChild(li);
        });

        document.querySelectorAll('.category-link').forEach(link => {
            link.addEventListener('click', e => {
                e.preventDefault();
                document.querySelectorAll('.category-link').forEach(l => l.classList.remove('active', 'text-dark', 'fw-medium'));
                e.target.classList.add('active', 'text-dark', 'fw-medium');
                currentCategoryId = e.target.dataset.id;
                currentPage = 1;
                loadProducts();
            });
        });
    } catch (e) {
        console.error('Lỗi tải danh mục:', e);
    }
}

async function loadProducts() {
    const container = document.getElementById('products-container');
    container.innerHTML = '<div class="text-center py-5"><div class="spinner-border text-primary" role="status"></div></div>';

    try {
        const minPrice = document.getElementById('minPrice').value;
        const maxPrice = document.getElementById('maxPrice').value;
        let url = `/products?page=${currentPage}&limit=${LIMIT}`;
        if (currentCategoryId) url += `&category_id=${currentCategoryId}`;
        if (currentSearch) url += `&search=${encodeURIComponent(currentSearch)}`;
        if (minPrice) url += `&min_price=${minPrice}`;
        if (maxPrice) url += `&max_price=${maxPrice}`;

        const res = await api.get(url);
        const { data, pagination } = res;

        document.getElementById('product-count').textContent = `(${pagination.total} sản phẩm)`;
        if (!data || data.length === 0) {
            container.innerHTML = '<div class="col-12 text-center py-5 text-muted"><i class="bi bi-box-seam fs-1"></i><p class="mt-3">Không tìm thấy sản phẩm nào phù hợp.</p></div>';
            renderPagination(pagination);
            return;
        }

        container.innerHTML = '';
        data.forEach(product => {
            const col = document.createElement('div');
            col.className = 'col-lg-4 col-md-6';
            col.innerHTML = `
                <div class="card product-card h-100">
                    <img src="${getProductImageUrl(product.image_url)}" class="card-img-top" alt="${product.name}" loading="lazy">
                    <div class="card-body text-center d-flex flex-column justify-content-between">
                        <h6 class="card-title fw-semibold text-truncate" title="${product.name}">${product.name}</h6>
                        <div>
                            <p class="price-tag">${formatPrice(product.price)}</p>
                            <p class="text-muted small mb-2">Còn: ${product.stock_quantity > 0 ? product.stock_quantity + ' sản phẩm' : '<span class="text-danger">Hết hàng</span>'}</p>
                            <a href="detail.html?id=${product.id}" class="btn btn-primary-custom w-100">Chi tiết</a>
                        </div>
                    </div>
                </div>`;
            container.appendChild(col);
        });

        renderPagination(pagination);
    } catch (e) {
        console.error('Lỗi tải sản phẩm:', e);
        container.innerHTML = '<div class="col-12 text-center py-5 text-danger">Lỗi tải dữ liệu sản phẩm.</div>';
    }
}

function renderPagination({ page, totalPages }) {
    const nav = document.getElementById('pagination-container');
    if (totalPages <= 1) { nav.innerHTML = ''; return; }

    let html = '<ul class="pagination justify-content-center">';
    html += `<li class="page-item ${page <= 1 ? 'disabled' : ''}"><a class="page-link" href="#" data-page="${page - 1}">Trước</a></li>`;
    for (let i = 1; i <= totalPages; i++) {
        html += `<li class="page-item ${i === page ? 'active' : ''}"><a class="page-link" href="#" data-page="${i}">${i}</a></li>`;
    }
    html += `<li class="page-item ${page >= totalPages ? 'disabled' : ''}"><a class="page-link" href="#" data-page="${page + 1}">Sau</a></li>`;
    html += '</ul>';
    nav.innerHTML = html;
    nav.querySelectorAll('a.page-link').forEach(a => {
        a.addEventListener('click', e => {
            e.preventDefault();
            const p = parseInt(e.target.dataset.page);
            if (p && p !== currentPage) {
                currentPage = p;
                loadProducts();
                window.scrollTo(0, 0);
            }
        });
    });
}

document.addEventListener('DOMContentLoaded', () => {
    loadCategories();
    loadProducts();
    document.getElementById('searchInput').addEventListener('input', e => {
        clearTimeout(searchTimeout);
        searchTimeout = setTimeout(() => {
            currentSearch = e.target.value.trim();
            currentPage = 1;
            loadProducts();
        }, 500);
    });
    document.getElementById('applyFilter').addEventListener('click', () => { currentPage = 1; loadProducts(); });
    document.getElementById('clearFilter').addEventListener('click', () => {
        document.getElementById('minPrice').value = '';
        document.getElementById('maxPrice').value = '';
        currentPage = 1;
        loadProducts();
    });
});