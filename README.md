# E-Commerce Full Stack App

Production-ready e-commerce web application built with **Next.js 14** (App Router), **MongoDB**, **Stripe**, and **Cloudinary**.

## Tech Stack

- **Frontend & Backend:** Next.js 14 (App Router), React 18, TypeScript
- **Styling:** Tailwind CSS
- **Database:** MongoDB with Mongoose
- **Auth:** JWT (httpOnly cookies, `jose`)
- **Payments:** Stripe (Payment Intents)
- **Images:** Cloudinary

## Project Structure

```
├── app/
│   ├── api/                 # API routes
│   │   ├── auth/            # register, login, logout, me
│   │   ├── products/        # list, create, get by slug
│   │   ├── orders/          # list, create, get by id
│   │   ├── upload/          # Cloudinary image upload
│   │   ├── checkout/        # Stripe payment intent
│   │   └── webhooks/stripe/ # Stripe webhook
│   ├── account/             # User profile (protected)
│   ├── cart/                # Shopping cart
│   ├── checkout/            # Checkout (protected)
│   ├── login/               # Login page
│   ├── register/            # Register page
│   ├── orders/              # Order history (protected)
│   ├── products/            # Product listing & detail
│   ├── layout.tsx
│   ├── page.tsx
│   ├── error.tsx            # Error boundary
│   └── not-found.tsx
├── components/
│   ├── layout/              # Header, Footer
│   ├── product/             # ProductCard
│   ├── providers/           # Auth + Cart providers
│   └── ui/                  # Button, Input, Card
├── context/
│   ├── AuthContext.tsx
│   └── CartContext.tsx
├── lib/
│   ├── db.ts                # MongoDB connection
│   ├── auth.ts              # JWT create/verify, cookies
│   ├── cloudinary.ts        # Image upload
│   ├── stripe.ts            # Stripe client
│   └── api-response.ts      # Response helpers
├── models/
│   ├── User.ts
│   ├── Product.ts
│   └── Order.ts
├── types/
│   └── index.ts
├── middleware.ts            # Auth & route protection
└── .env.local.example
```

## Setup

### 1. Install dependencies

```bash
npm install
```

### 2. Environment variables

```bash
cp .env.local.example .env.local
```

Edit `.env.local` and set:

- **MONGODB_URI** – MongoDB connection string (local or Atlas)
- **JWT_SECRET** – Random secret for JWT signing
- **STRIPE_SECRET_KEY** – Stripe secret key
- **STRIPE_WEBHOOK_SECRET** – Stripe webhook signing secret (for production)
- **CLOUDINARY_*** – Cloudinary credentials for image upload

### 3. Run development server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Features

- **Auth:** Register, login, logout with JWT in httpOnly cookies
- **Products:** List, filter, product detail, add to cart
- **Cart:** Persisted in localStorage, quantity update, remove
- **Checkout:** Create order, Stripe Payment Intent (integrate Stripe Elements on frontend)
- **Orders:** Order history and order detail (protected)
- **Upload:** Authenticated image upload to Cloudinary
- **Middleware:** Protects `/checkout`, `/account`, `/orders` and relevant API routes

## API Overview

| Method | Route | Description |
|--------|-------|-------------|
| POST | /api/auth/register | Register user |
| POST | /api/auth/login | Login |
| POST | /api/auth/logout | Logout |
| GET | /api/auth/me | Current user (requires auth) |
| GET | /api/products | List products (query: page, limit, category, featured, q) |
| POST | /api/products | Create product |
| GET | /api/products/[slug] | Get product by slug |
| GET | /api/orders | List user orders (auth) |
| POST | /api/orders | Create order (auth) |
| GET | /api/orders/[id] | Get order (auth) |
| POST | /api/upload | Upload image (auth) |
| POST | /api/checkout/create-payment-intent | Create Stripe Payment Intent (auth) |
| POST | /api/webhooks/stripe | Stripe webhook |

## Stripe Webhook (local)

```bash
stripe listen --forward-to localhost:3000/api/webhooks/stripe
```

Use the printed webhook signing secret in `.env.local` as `STRIPE_WEBHOOK_SECRET`.

## Build & Start

```bash
npm run build
npm start
```

## Security

- Passwords hashed with bcrypt
- JWT in httpOnly, sameSite cookies
- Protected API routes and pages via middleware and session checks
- Environment variables for secrets; never commit `.env.local`

## License

MIT
