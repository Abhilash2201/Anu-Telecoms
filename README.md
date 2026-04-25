# Anu Telecom — E-Commerce Platform

A full-stack single-vendor e-commerce platform for **Anu Telecom, Nagamangala** — selling mobiles, televisions, and home appliances.

- **Frontend** → React + Vite + TypeScript + styled-components → deployed on **Vercel**
- **Backend** → Node.js + Express + Prisma → deployed on **Render**
- **Database** → PostgreSQL via **Neon** (serverless)

---

## Table of Contents

- [Business Flow](#business-flow)
- [Project Structure](#project-structure)
- [Database Schema](#database-schema)
- [API Reference](#api-reference)
- [Frontend Pages & Features](#frontend-pages--features)
- [Environment Variables](#environment-variables)
- [Local Development](#local-development)
- [Deployment](#deployment)

---

## Business Flow

### Customer Journey

```
Visit Home → Browse Products → Product Detail → Add to Cart → Login/Register → Checkout → Order Placed → Track Orders
```

1. **Discovery** — Hero banner, featured products, top deals, and category cards on the home page
2. **Browse** — Shop page with filters (price, brand, rating), sorting, search, and pagination
3. **Product Detail** — Image gallery, highlights, specs, quantity picker, add to cart / wishlist, customer reviews
4. **Cart** — Review items, adjust quantities, see subtotal
5. **Checkout** — Saved/new delivery address, payment method selection, order placement
6. **Post-Order** — Order history with status tracking (Pending → Confirmed → Shipped → Delivered)

### Admin Journey

```
Login as Admin → Dashboard → Manage Products / Orders / Customers
```

1. **Dashboard** — Revenue, order counts, recent orders overview
2. **Catalog** — Create, edit, activate/deactivate products with images, pricing, and stock
3. **Orders** — View all orders, update order status
4. **Customers** — View registered customer list

---

## Project Structure

```
anu-telecom/
├── client/                     # React frontend (Vite + TypeScript)
│   ├── src/
│   │   ├── api/                # Axios client (apiClient.ts)
│   │   ├── components/         # Reusable UI components
│   │   ├── context/            # React Context providers
│   │   ├── pages/              # Route-level page components
│   │   ├── styles/             # Global styles
│   │   ├── types/              # TypeScript interfaces
│   │   ├── utils/              # Helpers (formatCurrency, etc.)
│   │   └── App.tsx             # Router + provider tree
│   ├── .env                    # Local env (VITE_API_URL)
│   ├── .env.example
│   └── vite.config.ts
│
├── server/                     # Express backend
│   ├── src/
│   │   ├── controllers/        # Business logic per domain
│   │   ├── routes/             # Express route definitions
│   │   ├── middleware/         # auth, error handlers
│   │   ├── db.js               # Prisma client singleton
│   │   └── index.js            # App entry point
│   ├── prisma/
│   │   └── schema.prisma       # Database schema
│   └── .env                    # Server env vars
│
└── vercel.json                 # Vercel deployment config (client only)
```

---

## Database Schema

### Entity Relationship

```
User ──< Order ──< OrderItem >── Product >── Category
User ──  Cart  ──< CartItem  >── Product
User ──< Review >── Product
User ──< Address
```

### Tables

#### `User`
| Column | Type | Notes |
|--------|------|-------|
| id | String (cuid) | Primary key |
| name | String | Display name |
| email | String | Unique |
| password | String | bcrypt hashed |
| role | Enum | `USER` · `ADMIN` · `VENDOR` |
| createdAt | DateTime | Auto |

#### `Product`
| Column | Type | Notes |
|--------|------|-------|
| id | String (cuid) | Primary key |
| name | String | |
| description | String | |
| price | Float | Original MRP |
| discount | Float | Percentage, default 0 |
| stock | Int | Units available |
| categoryId | String | FK → Category |
| brand | String | |
| image | String | Primary image URL |
| images | String[] | Additional image URLs |
| rating | Float | Avg rating, default 0 |
| highlights | String[] | Bullet point features |
| tags | String[] | Search tags |
| isActive | Boolean | Soft-delete / visibility |
| createdAt | DateTime | |

#### `Category`
| Column | Type | Notes |
|--------|------|-------|
| id | String | Primary key (e.g. `cat-mobiles`) |
| name | String | Unique display name |

#### `Order`
| Column | Type | Notes |
|--------|------|-------|
| id | String (cuid) | Primary key |
| userId | String | FK → User |
| total | Float | Order total in INR |
| status | Enum | See order statuses below |
| paymentMethod | String | e.g. `COD`, `UPI` |
| paymentStatus | String | e.g. `PAID`, `PENDING` |
| trackingId | String | Courier tracking |
| address | Json | Snapshot of delivery address |
| createdAt | DateTime | |

**Order Statuses:** `PENDING` → `PAID` → `CONFIRMED` → `PACKED` → `SHIPPED` → `DELIVERED` · `CANCELLED`

#### `OrderItem`
| Column | Type | Notes |
|--------|------|-------|
| id | String (cuid) | Primary key |
| orderId | String | FK → Order |
| productId | String | FK → Product |
| quantity | Int | |
| price | Float | Price at time of order |

#### `Cart`
| Column | Type | Notes |
|--------|------|-------|
| id | String | Primary key |
| userId | String | Unique FK → User (1 cart per user) |

#### `CartItem`
| Column | Type | Notes |
|--------|------|-------|
| id | String | Primary key |
| cartId | String | FK → Cart |
| productId | String | FK → Product |
| quantity | Int | |

#### `Address`
| Column | Type | Notes |
|--------|------|-------|
| id | String | Primary key |
| userId | String | FK → User |
| street | String | |
| city | String | |
| state | String | |
| pincode | String | |

#### `Review`
| Column | Type | Notes |
|--------|------|-------|
| id | String | Primary key |
| userId | String | FK → User |
| productId | String | FK → Product |
| rating | Int | 1–5 |
| comment | String | |

---

## API Reference

Base URL (local): `http://localhost:4000/api`
Base URL (production): `https://anu-telecom.onrender.com/api`
Interactive docs: `/api/docs`

### Authentication

JWT Bearer token — include in header:
```
Authorization: Bearer <token>
```

---

### Auth — `/api/auth`

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/register` | Public | Create account |
| POST | `/login` | Public | Login, returns JWT |
| GET | `/me` | Required | Get current user |
| GET | `/profile` | Required | Get profile details |
| PATCH | `/profile` | Required | Update name/email |
| GET | `/addresses` | Required | List saved addresses |
| POST | `/addresses` | Required | Add new address |
| PATCH | `/addresses/:id` | Required | Update address |
| DELETE | `/addresses/:id` | Required | Delete address |

> Auth endpoints are rate-limited to **20 requests per 15 minutes**.

---

### Products — `/api/products`

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/` | Public | List products (paginated, filterable) |
| GET | `/:id` | Public | Get single product |

**GET `/products` query params:**

| Param | Type | Default | Description |
|-------|------|---------|-------------|
| page | number | 1 | Page number |
| limit | number | 12 | Items per page |
| search | string | — | Full-text search |
| category | string | all | Filter by category ID |
| brand | string | — | Comma-separated brands |
| minPrice | number | — | Min price filter |
| maxPrice | number | — | Max price filter |
| minRating | number | — | Min average rating |
| sortBy | string | createdAt | `price` · `name` · `rating` · `discount` · `createdAt` |
| sortOrder | string | desc | `asc` · `desc` |

---

### Categories — `/api/categories`

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/` | Public | List all categories |
| GET | `/:id` | Public | Get category |
| POST | `/` | Admin | Create category |
| PATCH | `/:id` | Admin | Update category |
| DELETE | `/:id` | Admin | Delete category |

---

### Cart — `/api/cart`

All cart endpoints require authentication.

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/` | Get current user's cart |
| POST | `/items` | Add item `{ productId, quantity }` |
| PATCH | `/items/:itemId` | Update quantity `{ quantity }` |
| DELETE | `/items/:itemId` | Remove item |

---

### Orders — `/api/orders`

All order endpoints require authentication.

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/` | Place order `{ addressId, paymentMethod }` |
| GET | `/` | Get user's order history |
| PATCH | `/:id/cancel` | Cancel an order |

---

### Reviews — `/api/products/:productId/reviews`

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/` | Public | Get reviews for a product |
| POST | `/` | Required | Submit a review `{ rating, comment }` |
| DELETE | `/:reviewId` | Required | Delete own review |

---

### Admin — `/api/admin`

All admin endpoints require `role: ADMIN`.

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/dashboard` | Revenue, order counts, recent activity |
| GET | `/customers` | List all registered customers |
| GET | `/orders` | List all orders (all users) |
| PATCH | `/orders/:id` | Update order status |
| POST | `/products` | Create / manage products |

---

### Storefront — `/api/storefront`

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/` | Public | Store info, categories, featured products |

---

## Frontend Pages & Features

### Pages

| Route | Page | Description |
|-------|------|-------------|
| `/` | HomePage | Hero, categories, promo banners, featured products, top deals, trust badges |
| `/shop` | ShopPage | Product grid with sidebar filters, sort, search, pagination |
| `/product/:id` | ProductDetailPage | Gallery, price, stock, quantity, add to cart, wishlist, reviews |
| `/cart` | CartPage | Cart items, quantities, subtotal |
| `/checkout` | CheckoutPage | Address selection, payment method, order placement |
| `/login` | LoginPage | Login + register tabs |
| `/account` | AccountPage | Profile details, saved addresses |
| `/orders` | OrdersPage | Order history with status |
| `/wishlist` | WishlistPage | Saved wishlist products |
| `/admin` | AdminDashboard | Dashboard, products, orders, customers tabs |
| `*` | NotFoundPage | 404 fallback |

### Key Components

| Component | Purpose |
|-----------|---------|
| `Layout` | Sticky header, desktop nav bar, mobile hamburger drawer, footer |
| `ProductCard` | Product tile — image, name, price, discount badge, wishlist heart, hover Add to Cart |
| `ProductCardSkeleton` | Shimmer loading placeholder matching card dimensions |
| `ErrorBoundary` | Catches React render errors — shows "Something went wrong / Refresh" |

### State Management

| Context | Persisted To | What it manages |
|---------|-------------|-----------------|
| `AuthContext` | localStorage (`auth_token`, `auth_user`) | Login state, user profile, JWT |
| `CartContext` | localStorage (guest) + server API (logged in) | Cart items, add/remove/update, guest→server merge on login, clear on logout |
| `WishlistContext` | localStorage (`anu_wishlist`) | Wishlist items, toggle, count |

### UI Features

- Responsive layout — 5-col product grid scales down to 4 → 3 → 2 → 1 col
- Mobile hamburger menu — full nav + search + account links in slide-down drawer
- Skeleton loaders on all product grids while data is loading
- Image hover zoom + hover-reveal Add to Cart button on product cards
- Sticky header (`z-index: 300`) always above all page content
- Discount badge, rating stars, and out-of-stock indicator on product cards
- Guest cart — works without login, merges to server cart on login
- Wishlist persisted in localStorage — survives page refresh
- Cart clears on logout, restores from localStorage for guest users

---

## Environment Variables

### Client (`client/.env`)

| Variable | Required | Description |
|----------|----------|-------------|
| `VITE_API_URL` | Yes | Backend base URL |

Example:
```
VITE_API_URL=http://localhost:4000
```

### Server (`server/.env`)

| Variable | Required | Description |
|----------|----------|-------------|
| `DATABASE_URL` | Yes | Neon PostgreSQL connection string with `sslmode=verify-full` |
| `JWT_SECRET` | Yes | Secret for signing JWTs (min 32 chars) |
| `PORT` | No | Server port, default `4000` |
| `CORS_ORIGIN` | No | Comma-separated allowed origins |

Example:
```
DATABASE_URL="postgresql://user:pass@host/db?sslmode=verify-full"
JWT_SECRET="your-secret-here"
PORT=4000
CORS_ORIGIN="http://localhost:5173,https://your-app.vercel.app"
```

---

## Local Development

### Prerequisites

- Node.js 18+
- A Neon (or any PostgreSQL) database

### 1. Clone and install

```bash
git clone <repo-url>
cd anu-telecom

cd server && npm install
cd ../client && npm install
```

### 2. Configure environment

```bash
cp client/.env.example client/.env
# Set VITE_API_URL=http://localhost:4000

# Create server/.env with DATABASE_URL, JWT_SECRET, PORT, CORS_ORIGIN
```

### 3. Set up database

```bash
cd server
npx prisma generate
npx prisma db push
npm run prisma:seed    # optional — seed sample data
```

### 4. Start servers

```bash
# Terminal 1 — backend (http://localhost:4000)
cd server && npm run dev

# Terminal 2 — frontend (http://localhost:5173)
cd client && npm run dev
```

---

## Deployment

### Frontend → Vercel

1. Push repo to GitHub and import on [vercel.com](https://vercel.com)
2. Add environment variable: `VITE_API_URL=https://anu-telecom.onrender.com`
3. Deploy — `vercel.json` at the repo root handles build config and SPA rewrites

### Backend → Render

1. New **Web Service** on [render.com](https://render.com), root directory: `server/`
2. Settings:

| Setting | Value |
|---------|-------|
| Build Command | `npm install && npx prisma generate` |
| Start Command | `node src/index.js` |

3. Environment variables in Render dashboard:

| Key | Value |
|-----|-------|
| `DATABASE_URL` | Neon connection string |
| `JWT_SECRET` | Your secret key |
| `CORS_ORIGIN` | `http://localhost:5173,https://your-app.vercel.app` |

### Database → Neon

1. Create project at [neon.tech](https://neon.tech)
2. Copy the connection string — use `sslmode=verify-full`
3. Set as `DATABASE_URL` in both local `.env` and Render environment

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 18, TypeScript, Vite, React Router v6 |
| Styling | styled-components, CSS custom properties |
| State | React Context API (Auth, Cart, Wishlist) |
| HTTP | Axios |
| Backend | Node.js, Express 4 |
| ORM | Prisma 7 |
| Database | PostgreSQL (Neon serverless) |
| Auth | JWT + bcrypt |
| Security | Helmet, CORS, express-rate-limit |
| API Docs | Swagger UI at `/api/docs` |
| Hosting | Vercel (client) + Render (server) |
