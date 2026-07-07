# KHÁNH STORE

This repository contains a full-stack e-commerce application for KHÁNH STORE with separate backend and frontend implementations.

## Contents
- `backend/` - Node.js + Express backend
- `frontend/` - Static frontend with user and admin interfaces
- `khanh_store.sql` - Database dump/schema

## Backend Setup
1. Install dependencies
   ```powershell
   cd "d:\chuyên đề 1\khanh_store\backend"
   npm install
   ```
2. Configure MySQL database
   - Create a MySQL database named `khanh_store`
   - Import `khanh_store.sql` into the database
   - Ensure MySQL is running and available at the host and port configured by `DB_HOST` and `DB_PORT`

3. Copy environment example and update values
   ```powershell
   copy .\backend\.env.example .\backend\.env
   ```
   Edit `backend/.env` with your database credentials and JWT secrets:
   ```env
   DB_HOST=your_mysql_host
   DB_PORT=3306
   DB_USER=root
   DB_PASSWORD=
   DB_NAME=khanh_store
   JWT_SECRET=your_jwt_secret
   REFRESH_TOKEN_SECRET=your_refresh_token_secret
   PORT=5000
   ```

4. Start backend
   ```powershell
   npm start
   ```

## Frontend Setup
The frontend is static and can be opened directly in the browser from the `frontend/` folder.

### Recommended
- Serve using a local static server
- Or open `frontend/index.html` directly if the browser allows local file access to static resources

## Application Flow
- Public user flows: product browsing, search, filter, cart, checkout, profile, order history
- Admin flows: dashboard, product/category/store/customer/staff/order management
- Authentication: JWT token stored in `localStorage`

## Important Notes
- The backend requires a running MySQL instance available at the host and port configured by `DB_HOST` and `DB_PORT`
- Current environment shows database connection failure: `ECONNREFUSED`
- Ensure MySQL service is enabled and the `khanh_store` database is imported before starting the backend

## Useful URLs
- User app: `frontend/index.html`
- Login/Register: `frontend/auth.html`
- Admin panel: `frontend/admin/index.html`
