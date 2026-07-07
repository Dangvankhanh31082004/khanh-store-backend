let editingProductId = null;
let searchTimeout;
let currentPage = 1;


// ===============================
// LẤY DATA AN TOÀN
// ===============================
function getListResponse(res) {
    if (Array.isArray(res.data)) {
        return res.data;
    }

    if (Array.isArray(res.data?.data)) {
        return res.data.data;
    }

    if (Array.isArray(res.products)) {
        return res.products;
    }

    return [];
}


// ===============================
// LOAD DANH MỤC
// ===============================
async function loadCategories() {
    try {
        const res = await api.get('/categories');

        const categories = getListResponse(res);

        const filter = document.getElementById('filter-category');
        const select = document.getElementById('p-category');


        filter.innerHTML =
            `<option value="">Tất cả danh mục</option>`;

        select.innerHTML =
            `<option value="">Chọn danh mục</option>`;


        categories.forEach(cat => {

            filter.innerHTML += `
            <option value="${cat.id}">
                ${cat.name}
            </option>`;

            select.innerHTML += `
            <option value="${cat.id}">
                ${cat.name}
            </option>`;
        });


    } catch(error){

        console.log(error);

    }
}



// ===============================
// LOAD STORE
// ===============================
async function loadStores(){

    try{

        const res = await api.get('/stores');

        const stores = getListResponse(res);

        const select =
        document.getElementById('p-store');


        select.innerHTML =
        `<option value="">Chọn cửa hàng</option>`;


        stores.forEach(store=>{

            select.innerHTML += `
            <option value="${store.id}">
                ${store.name}
            </option>`;

        });


    }catch(error){

        console.log(error);

    }

}



// ===============================
// LOAD PRODUCT
// ===============================
async function loadProducts(page=1){

    currentPage = page;


    const search =
    document.getElementById('search-products').value;


    const category =
    document.getElementById('filter-category').value;



    let url =
    `/products?page=${page}&limit=10`;


    if(search){
        url +=
        `&search=${encodeURIComponent(search)}`;
    }


    if(category){
        url +=
        `&category_id=${category}`;
    }



    const tbody =
    document.getElementById('products-tbody');


    tbody.innerHTML = `
    <tr>
    <td colspan="7" class="text-center">
    Loading...
    </td>
    </tr>`;



    try{


        const res =
        await api.get(url);


        console.log("PRODUCT API:",res);



        const products =
        getListResponse(res);



        tbody.innerHTML="";



        if(products.length===0){

            tbody.innerHTML=`
            <tr>
            <td colspan="7"
            class="text-center text-muted">
            Không có sản phẩm
            </td>
            </tr>`;

            return;
        }



        products.forEach(product=>{


            const image =
            product.image_url ||
            product.image ||
            product.image_path ||
            "";



            tbody.innerHTML += `

            <tr>

            <td>
            #${product.id}
            </td>


            <td>
            <img 
            src="${getProductImageUrl(image)}"
            width="60"
            height="60"
            style="object-fit:contain">
            </td>


            <td>
            <b>${product.name || "Không tên"}</b>
            </td>


            <td>
            ${product.category_name || "---"}
            </td>


            <td>
            ${formatPrice(product.price || 0)}
            </td>


            <td>

            ${
            product.stock_quantity ?? 0
            }

            </td>


            <td>


            <button
            class="btn btn-sm btn-primary"
            onclick="openEditModal(${product.id})">

            Sửa

            </button>


            <button
            class="btn btn-sm btn-danger"
            onclick="deleteProduct(${product.id})">

            Xóa

            </button>


            </td>


            </tr>

            `;


        });



    }catch(error){


        tbody.innerHTML=`

        <tr>
        <td colspan="7"
        class="text-danger text-center">

        ${error.message}

        </td>
        </tr>`;


    }


}



// ===============================
// DELETE
// ===============================
async function deleteProduct(id){


    if(!confirm(
    "Xóa sản phẩm này?"
    )) return;



    try{


        await api.delete(
        `/products/${id}`
        );


        loadProducts(currentPage);



    }catch(error){

        alert(error.message);

    }

}



// ===============================
// RESET FORM
// ===============================
function resetProductForm(){

    editingProductId=null;

    document
    .getElementById('product-form')
    .reset();

}



// ===============================
// EVENT
// ===============================

document.addEventListener(
'DOMContentLoaded',
()=>{


    loadCategories();

    loadStores();

    loadProducts();



    document
    .getElementById(
    'search-products'
    )
    .addEventListener(
    'input',
    ()=>{

        clearTimeout(searchTimeout);

        searchTimeout=setTimeout(
        ()=>{
            loadProducts(1);
        },500);

    });



});