# Production Deployment Guide

This guide covers deploying the e-commerce Next.js app to production using **MongoDB Atlas**, **Vercel** (recommended), and **Render** as an alternative. The app is full-stack: frontend and API routes run together.

---

## Table of Contents

1. [Prerequisites](#1-prerequisites)
2. [MongoDB Atlas Setup](#2-mongodb-atlas-setup)
3. [Environment Variables](#3-environment-variables)
4. [Production Build & Optimize](#4-production-build--optimize)
5. [Deploy Frontend & API on Vercel](#5-deploy-frontend--api-on-vercel)
6. [Deploy on Render (Alternative)](#6-deploy-on-render-alternative)
7. [Stripe Webhook (Production)](#7-stripe-webhook-production)
8. [Security Checklist](#8-security-checklist)

---

## 1. Prerequisites

- **Node.js** 18+
- **Git** repository (GitHub/GitLab/Bitbucket)
- Accounts: [MongoDB Atlas](https://www.mongodb.com/cloud/atlas), [Vercel](https://vercel.com), [Stripe](https://stripe.com), [Cloudinary](https://cloudinary.com)
- (Optional) [Render](https://render.com) if not using Vercel

---

## 2. MongoDB Atlas Setup

### 2.1 Create cluster and database user

1. Log in to [MongoDB Atlas](https://cloud.mongodb.com).
2. **Create a project** (e.g. "E-Commerce Prod") if needed.
3. **Build a cluster**: Choose a tier (M0 Free is fine to start). Pick a region close to your app (e.g. same as Vercel).
4. **Database Access** → Add New Database User:
   - Authentication: Password
   - Username: `ecom-prod` (or similar)
   - Password: Generate a strong password and **save it** (e.g. in a secrets manager).
   - Database User Privileges: **Atlas admin** or **Read and write to any database**.
5. **Network Access** → Add IP Address:
   - For **Vercel**: Add `0.0.0.0/0` (Vercel uses dynamic IPs) or use [Vercel’s IP allowlist](https://vercel.com/docs/security/ip-allowlist) if on a plan that supports it.
   - For **Render**: Add `0.0.0.0/0` or Render’s outbound IPs.
   - For local only: add your current IP.

### 2.2 Get connection string

1. In Atlas, go to your **Cluster** → **Connect** → **Drivers**.
2. Choose **Node.js**, copy the connection string. It looks like:
   ```txt
   mongodb+srv://<username>:<password>@<cluster>.mongodb.net/<dbname>?retryWrites=true&w=majority
   ```
3. Replace `<username>`, `<password>`, and optionally `<dbname>` (e.g. `ecommerce`).  
   **Important:** If the password contains special characters, URL-encode them (e.g. `@` → `%40`).

Example:

```txt
MONGODB_URI=mongodb+srv://ecom-prod:MyP%40ssw0rd@cluster0.xxxxx.mongodb.net/ecommerce?retryWrites=true&w=majority
```

---

## 3. Environment Variables

### 3.1 Required variables

| Variable | Description | Example |
|----------|-------------|---------|
| `NEXT_PUBLIC_APP_URL` | Full app URL (no trailing slash) | `https://your-app.vercel.app` |
| `MONGODB_URI` | Atlas connection string | `mongodb+srv://...` |
| `JWT_SECRET` | Secret for JWT signing (min 32 chars) | `openssl rand -base64 32` |
| `STRIPE_SECRET_KEY` | Stripe secret key (live: `sk_live_...`) | `sk_live_...` |
| `STRIPE_WEBHOOK_SECRET` | Webhook signing secret (see [§7](#7-stripe-webhook-production)) | `whsec_...` |
| `CLOUDINARY_CLOUD_NAME` | Cloudinary cloud name | |
| `CLOUDINARY_API_KEY` | Cloudinary API key | |
| `CLOUDINARY_API_SECRET` | Cloudinary API secret | |

### 3.2 Optional but recommended

| Variable | Description |
|----------|-------------|
| `SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`, `SMTP_PASS`, `SMTP_FROM` | For order confirmation emails (Nodemailer). |
| `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` | If you use Stripe.js on the client. |

### 3.3 Generate JWT_SECRET

```bash
openssl rand -base64 32
```

Use the output as `JWT_SECRET` in production.

### 3.4 Local reference

Copy `.env.example` to `.env.local` and fill values for local runs. Never commit `.env.local`.

---

## 4. Production Build & Optimize

### 4.1 Install and build

```bash
npm ci
npm run build
```

Fix any TypeScript or build errors before deploying.

### 4.2 Run production locally

```bash
npm run start
```

Open `http://localhost:3000` and test login, products, cart, checkout (use Stripe test mode).

### 4.3 Optimizations (already applied in the project)

- **Next.js Image**: `next/image` with Cloudinary in `remotePatterns` for optimized images.
- **SSR**: Product list and product detail pages are server-rendered.
- **Caching**: `revalidate` on product and category fetches.
- **Rate limiting**: Login, register, and checkout APIs are rate-limited.
- **Bundle**: Next.js tree-shaking and code splitting are used by default.

### 4.4 Optional: Analyze bundle

```bash
npm install -D @next/bundle-analyzer
```

In `next.config.js` (optional):

```js
const withBundleAnalyzer = require('@next/bundle-analyzer')({ enabled: process.env.ANALYZE === 'true' });
module.exports = withBundleAnalyzer(nextConfig);
```

Run: `ANALYZE=true npm run build`.

---

## 5. Deploy Frontend & API on Vercel

This app is full-stack: the same deployment serves both the frontend and API routes. No separate “backend” server is required.

### 5.1 Connect repository

1. Go to [Vercel](https://vercel.com) → Add New → Project.
2. Import your Git repository (GitHub/GitLab/Bitbucket).
3. **Framework Preset:** Next.js (auto-detected).
4. **Root Directory:** Leave default (or set if the app is in a subfolder).
5. **Build Command:** `npm run build` (default).
6. **Output Directory:** leave default.
7. **Install Command:** `npm install` or `npm ci`.

### 5.2 Environment variables in Vercel

1. Project → **Settings** → **Environment Variables**.
2. Add every variable from [§3](#3-environment-variables) (required + any optional).
3. Set **NEXT_PUBLIC_APP_URL** to your Vercel URL, e.g. `https://your-project.vercel.app`.
4. For production Stripe, use **live** keys and the **production** webhook secret (see [§7](#7-stripe-webhook-production)).
5. Scope variables to **Production** (and Preview if you want).

### 5.3 Deploy

- Push to the main branch or click **Deploy** in Vercel. Each push to main can trigger a production deployment.
- After deploy, open your Vercel URL and confirm: home, products, login, cart, checkout (test mode first).

### 5.4 Custom domain (optional)

- **Settings** → **Domains** → add your domain and follow DNS instructions.
- Set **NEXT_PUBLIC_APP_URL** (and Stripe success/cancel URLs if used) to the custom domain.

---

## 6. Deploy on Render (Alternative)

You can run the same Next.js app on Render as a **Web Service** (Node server). Use this if you prefer Render over Vercel.

### 6.1 Create Web Service

1. [Render](https://render.com) → **New** → **Web Service**.
2. Connect the same Git repository.
3. **Settings:**
   - **Runtime:** Node.
   - **Build Command:** `npm install && npm run build`
   - **Start Command:** `npm run start`
   - **Instance type:** Free or paid.

### 6.2 Environment variables

In **Environment** tab, add the same variables as in [§3](#3-environment-variables). Set **NEXT_PUBLIC_APP_URL** to your Render URL (e.g. `https://your-service.onrender.com`).

### 6.3 Deploy and test

- Save; Render will build and start the app.
- Open the service URL and test as in [§5.3](#53-deploy).

### 6.4 Note on cold starts

On the free tier, the service may spin down after inactivity. First request after idle can be slow. Paid plans avoid this.

---

## 7. Stripe Webhook (Production)

Webhooks mark orders as paid and decrement stock. They must use a **production** endpoint and secret.

### 7.1 Create production webhook in Stripe

1. [Stripe Dashboard](https://dashboard.stripe.com) → **Developers** → **Webhooks**.
2. **Add endpoint.**
3. **Endpoint URL:**  
   `https://<your-production-domain>/api/webhooks/stripe`  
   (e.g. `https://your-app.vercel.app/api/webhooks/stripe`).
4. **Events to send:** Select **checkout.session.completed** (or enable all and filter in code).
5. **Add endpoint.** Copy the **Signing secret** (`whsec_...`).

### 7.2 Set webhook secret in production

- In Vercel (or Render): add environment variable **STRIPE_WEBHOOK_SECRET** with that `whsec_...` value.
- Redeploy so the new env is applied.

### 7.3 Verify

1. In Stripe Dashboard, open the webhook → **Send test webhook** (e.g. `checkout.session.completed`).
2. Check **Recent deliveries** for 200 OK.
3. Optionally run a real test checkout in production (Stripe test mode or live) and confirm the order is marked paid and stock updates.

### 7.4 Stripe live keys

- For real payments, switch to **Live** mode in Stripe and use:
  - **STRIPE_SECRET_KEY**: `sk_live_...`
  - **STRIPE_WEBHOOK_SECRET**: from the **live** webhook endpoint (same URL, create under Live mode).
- Update **NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY** to `pk_live_...` if used on the client.

---

## 8. Security Checklist

Use this before and after going live.

### 8.1 Environment & secrets

- [ ] No secrets in the repo (`.env.local` and `.env*.local` in `.gitignore`).
- [ ] `JWT_SECRET` is strong (e.g. 32+ chars from `openssl rand -base64 32`) and unique to production.
- [ ] Production uses **live** Stripe keys only in production env; test keys only in dev/preview.

### 8.2 MongoDB Atlas

- [ ] DB user has minimum required privileges (not necessarily Atlas admin if you can use a scoped user).
- [ ] Network access is restricted where possible (e.g. Vercel IP allowlist if available); if using `0.0.0.0/0`, rely on strong password and auth.

### 8.3 Application

- [ ] **HTTPS only:** Vercel/Render provide TLS; ensure `NEXT_PUBLIC_APP_URL` is `https://`.
- [ ] **Cookies:** Auth cookie is `httpOnly`, `secure` in production, `sameSite: 'lax'` (already set in `lib/auth.ts`).
- [ ] **Admin routes:** `/admin` and `/api/admin/*` are protected by middleware (admin role). No admin UI or API exposed without auth.
- [ ] **Rate limiting:** Login, register, and checkout are rate-limited to reduce abuse.
- [ ] **CORS:** Next.js API routes are same-origin by default; no extra CORS needed unless you add a separate frontend domain.

### 8.4 Dependencies and build

- [ ] `npm audit` and fix high/critical issues.
- [ ] Dependencies are up to date; upgrade Next.js and React when feasible.

### 8.5 Stripe

- [ ] Webhook endpoint uses **HTTPS** and **STRIPE_WEBHOOK_SECRET** for signature verification (already implemented in `app/api/webhooks/stripe/route.ts`).
- [ ] No Stripe secret key in client-side code or in `NEXT_PUBLIC_*` variables.

### 8.6 Headers (optional)

For stricter security you can add headers in `next.config.js` (e.g. `X-Frame-Options`, `X-Content-Type-Options`, CSP). The app works without them; add as needed for compliance or policy.

---

## Quick Reference

| Step | Action |
|------|--------|
| 1 | Create MongoDB Atlas cluster, user, and allowlist IPs; get `MONGODB_URI`. |
| 2 | Set all env vars (see §3) in Vercel or Render. |
| 3 | Run `npm run build` and `npm run start` locally; test. |
| 4 | Deploy to Vercel (or Render); set `NEXT_PUBLIC_APP_URL` to production URL. |
| 5 | Create Stripe production webhook; set `STRIPE_WEBHOOK_SECRET` and redeploy. |
| 6 | Go through the [Security checklist](#8-security-checklist). |

For issues, check Vercel/Render build and runtime logs, Stripe webhook delivery logs, and MongoDB Atlas metrics and logs.
