# Anu Telecom

Single-vendor electronics commerce scaffold with a storefront for customers and one admin console for store operations.

## Architecture

This repo is aligned to a single-store model rather than a marketplace.

- Roles: `customer`, `admin`
- Storefront modules: catalog, product detail, cart, checkout, account, orders
- Admin modules: dashboard, product operations, inventory visibility, order processing
- Order lifecycle: `Placed -> Confirmed -> Packed -> Shipped -> Delivered`

What is intentionally removed from the architecture:

- vendor onboarding
- vendor product ownership
- vendor payouts and earnings
- seller split orders
- marketplace settlement logic

## Project Structure

- `client`: React + Vite + MUI storefront/admin shell
- `server`: Express API with single-vendor storefront, catalog, auth, orders, and admin endpoints

## API Shape

- `GET /api/storefront`: store profile, architecture summary, categories, featured products
- `GET /api/products`: catalog list with optional `search` and `category`
- `GET /api/products/:id`: product detail
- `POST /api/auth/register`: customer signup only
- `POST /api/auth/login`: customer or admin login
- `GET /api/auth/me`: authenticated profile
- `POST /api/orders`: create order from validated store inventory
- `GET /api/orders`: authenticated customer orders
- `GET /api/admin/dashboard`: admin metrics for products, stock, orders, revenue

## Demo Access

- Admin email: `admin@anutelecom.local`
- Admin password: `admin123`

## Get Started

Frontend:

```bash
cd "d:\Career\Anu Telecom\client"
npm install
npm run dev
```

Backend:

```bash
cd "d:\Career\Anu Telecom\server"
npm install
npm run dev
```

## Production Follow-Up

The scaffold still needs real Neon tables and proper persistence for:

- users and password hashes
- addresses
- products, variants, and inventory
- orders, payments, and shipment tracking
- admin mutations and audit history
