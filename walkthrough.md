# Walkthrough

## Overview
KHÁNH STORE is a full-stack solution built with:
- Backend: Node.js, Express, MySQL, JWT auth, multer image uploads
- Frontend: static HTML/CSS/Bootstrap/JavaScript
- Admin panel: CRUD management for products, categories, stores, customers, staff, and orders

## Backend Architecture
- `server.js` - entry point with global middleware, route mounting, and DB connectivity validation
- `config/db.js` - MySQL connection pool using `mysql2/promise`
- `controllers/` - request handling, validation, business logic
- `models/` - database queries and transaction support
- `middlewares/authMiddleware.js` - JWT authentication and role-based authorization
- `middlewares/uploadMiddleware.js` - image upload with multer

## Key Implementations
### Authentication
- `POST /api/auth/register` - customer registration
- `POST /api/auth/login` - login returns access token, refresh token, and user profile
- `GET /api/auth/me` - return authenticated user profile
- `PUT /api/auth/profile` - update profile and password

### Product Management
- `GET /api/products` - list products with pagination, search, category/store/id filters, min/max price
- `GET /api/products/:id` - product detail
- `POST /api/products` - create product with optional image upload
- `PUT /api/products/:id` - update product, including image replacement
- `DELETE /api/products/:id` - delete product

### Order Flow
- `POST /api/orders/validate-cart` - validate cart items against stock and current prices
- `POST /api/orders/checkout` - checkout for authenticated customers
- `GET /api/orders/history` - customer order history
- `GET /api/orders/:id` - order details with ownership check
- `PUT /api/orders/:id/cancel` - customer order cancellation
- `GET /api/orders/admin/all` - admin order listing with filter and pagination
- `PUT /api/orders/:id/status` - admin order status update

### Admin & Customer Data
- `GET /api/customers` - admin-only customer/staff list with pagination, search, role filtering
- `GET /api/categories` - category listing
- `GET /api/stores` - store listing

## Frontend Integration
### Public site
- `frontend/index.html` - featured products loading from `/api/products`
- `frontend/products.html` - product catalog, search, filters, pagination
- `frontend/detail.html` - product detail page and add-to-cart
- `frontend/cart.html` - cart review with server-side validation
- `frontend/checkout.html` - checkout form and order placement
- `frontend/auth.html` - login/register flows
- `frontend/profile.html` - authenticated profile update
- `frontend/orders.html` - user order history and detail view

### Admin site
- `frontend/admin/index.html` - dashboard and pending order preview
- `frontend/admin/products.html` - admin product CRUD with upload support
- `frontend/admin/categories.html` - category management
- `frontend/admin/customers.html` - customer listing and search
- `frontend/admin/staff.html` - staff/manager/admin listing
- `frontend/admin/stores.html` - store CRUD
- `frontend/admin/orders.html` - order management, detail, and status updates

## Known Runtime Issue
- Current backend verification shows MySQL connection refused on the configured database host and port.
- Make sure MySQL is running and the database `khanh_store` is available.

## Notes
- `frontend/assets/api.js` centralizes API calls and handles JWT authorization
- `frontend/assets/main.js` manages shared UI state, cart badge, and auth menu
- Admin authentication now supports `ADMIN`, `STAFF`, `MANAGER`, and `OWNER` roles
