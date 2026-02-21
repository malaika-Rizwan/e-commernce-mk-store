# Pakistan Payment Integration – Complete Guide

This project supports **dynamic payment gateways** for Pakistan (and generic card/wallet APIs). Gateways are **enabled or disabled via `.env`**. The checkout page loads payment options from **`GET /api/config/payments`** and shows one button per enabled method.

---

## 1. Architecture

| Layer | Purpose |
|-------|--------|
| **Dynamic config** | `lib/payments/config.ts` – reads env and exposes enabled methods. `GET /api/config/payments` returns `{ paymentMethods: [{ id, label, description, route }] }`. |
| **Checkout routes** | `POST /api/checkout/<gateway>` – validate cart, create order (unpaid), call gateway API, return `{ url }` or `{ orderId }`. |
| **Callback routes** | `GET /api/payments/<gateway>/callback` – gateway redirects here with `orderId`, `status`, `transactionId`; we mark order paid, update stock, send emails, redirect to success or cancel. |
| **Checkout UI** | Fetches `/api/config/payments`, renders one button per method; each button POSTs to that method’s `route`. |

---

## 2. Gateways and env vars

Enable a gateway by setting its env vars. **Test/sandbox** vs **live** is controlled by the URLs you set (and optional `*_USE_SANDBOX` flags).

### 2.1 Cash on Delivery (always on)

No env needed. Route: `/api/checkout/cod`. Response: `{ orderId }` → frontend redirects to `/order/success?order_id=...`.

---

### 2.2 Generic card/wallet (Pakistan / South Africa)

| Env var | Required | Description |
|--------|----------|-------------|
| `CARD_PAYMENT_API_URL` | Yes | Gateway endpoint (e.g. create payment). |
| `CARD_PAYMENT_MERCHANT_ID` | Yes | Merchant ID. |
| `CARD_PAYMENT_API_KEY` | Yes | API key or secret. |
| `CARD_PAYMENT_CURRENCY` | No | Default `PKR`. |
| `CARD_PAYMENT_API_HEADER_KEY` | No | If key is sent in a custom header instead of `Authorization: Bearer`. |

Route: `/api/checkout/card`. Callback: `/api/payments/card/callback?orderId=...`.

---

### 2.3 JazzCash (Pakistan)

| Env var | Required | Test/Live | Description |
|--------|----------|-----------|-------------|
| `JAZZCASH_API_URL` | Yes (live) | Live | Production API URL. |
| `JAZZCASH_SANDBOX_URL` | No | Test | Sandbox API URL. |
| `JAZZCASH_USE_SANDBOX` | No | Test | Set `true` to use `JAZZCASH_SANDBOX_URL`. |
| `JAZZCASH_MERCHANT_ID` | Yes | Both | Merchant ID. |
| `JAZZCASH_PASSWORD` or `JAZZCASH_API_KEY` | Yes | Both | Password or API key. |
| `JAZZCASH_SECURE_HASH` | No | Both | Secure hash key if required by API. |

Route: `/api/checkout/jazzcash`. Callback: `/api/payments/jazzcash/callback`.  
Docs: [JazzCash Sandbox](https://payments.jazzcash.com.pk/SandboxDocumentation/).

---

### 2.4 Easypaisa (Pakistan)

| Env var | Required | Test/Live | Description |
|--------|----------|-----------|-------------|
| `EASYPAISA_API_URL` | Yes (live) | Live | Production API URL. |
| `EASYPAISA_SANDBOX_URL` | No | Test | Sandbox API URL. |
| `EASYPAISA_USE_SANDBOX` | No | Test | Set `true` to use sandbox. |
| `EASYPAISA_STORE_ID` | Yes | Both | Store ID. |
| `EASYPAISA_HASH_KEY` or `EASYPAISA_API_KEY` | Yes | Both | Hash key or API key. |

Route: `/api/checkout/easypaisa`. Callback: `/api/payments/easypaisa/callback`.  
Docs: [Easypaisa Integration](https://easypay.easypaisa.com.pk/easypay-merchant/faces/pg/site/IntegrationGuides.jsf).

---

### 2.5 Safepay (Pakistan)

| Env var | Required | Test/Live | Description |
|--------|----------|-----------|-------------|
| `SAFEPAY_API_URL` | Yes (live) | Live | Production API URL. |
| `SAFEPAY_SANDBOX_URL` | No | Test | Sandbox API URL. |
| `SAFEPAY_USE_SANDBOX` | No | Test | Set `true` to use sandbox. |
| `SAFEPAY_API_KEY` or `SAFEPAY_SECRET_KEY` | Yes | Both | API key. |
| `SAFEPAY_CURRENCY` | No | Both | Default `PKR`. |

Route: `/api/checkout/safepay`. Callback: `/api/payments/safepay/callback`.

---

### 2.6 Stripe (optional – international)

| Env var | Description |
|--------|-------------|
| `STRIPE_SECRET_KEY` | If set, Stripe appears as “Pay with Card (Stripe)” and uses `/api/checkout`. |

To **remove Stripe** and use only local gateways, see Section 5.

---

## 3. Success / failure handling

### 3.1 Success

- **Redirect gateways (card, JazzCash, Easypaisa, Safepay):** Gateway redirects to our callback; we mark the order paid and redirect to:
  - **Success:** `/order/success?order_id=<orderId>`
- **COD:** Backend returns `{ orderId }`; frontend does `router.push(\`/order/success?order_id=${orderId}\`)`.

**Success page** (`app/order/success/page.tsx`):

- Reads `order_id` or `session_id` from the URL.
- Fetches order via `GET /api/orders/<orderId>` (or by-session for Stripe).
- Clears cart, shows order summary and estimated delivery.

```tsx
// Already in place: success page uses order_id
const orderIdParam = searchParams.get('order_id');
if (orderIdParam) {
  const res = await fetch(`/api/orders/${orderIdParam}`, { credentials: 'include' });
  const data = await res.json();
  if (data.success && data.data) setOrder(data.data);
}
```

### 3.2 Failure / cancel

- **Redirect gateways:** We redirect to `/order/cancel?reason=...` (e.g. `payment_failed`, `cancelled`, `missing_order`, `order_not_found`).
- **Checkout page:** On API error we show `data.error` and toast; no redirect.

**Cancel page** (`app/order/cancel/page.tsx`):

- Shows “Checkout cancelled” and “Back to checkout” / “Continue shopping”.
- Optional: read `reason` from query and show a short message:

```tsx
const searchParams = useSearchParams();
const reason = searchParams.get('reason');
const message =
  reason === 'payment_failed'
    ? 'Payment could not be completed. Please try again or choose another method.'
    : reason === 'cancelled'
      ? 'You cancelled the payment.'
      : 'Your payment was not completed. Your cart has been preserved.';
```

---

## 4. Example `.env.local` (test mode)

```env
# App
NEXT_PUBLIC_APP_URL=http://localhost:3000

# COD – always available (no vars)

# Generic card gateway (if you have one)
# CARD_PAYMENT_API_URL=https://api.example.com/payments
# CARD_PAYMENT_MERCHANT_ID=your_merchant_id
# CARD_PAYMENT_API_KEY=your_key

# JazzCash – sandbox
JAZZCASH_USE_SANDBOX=true
JAZZCASH_SANDBOX_URL=https://sandbox.jazzcash.com.pk/...
JAZZCASH_MERCHANT_ID=your_merchant_id
JAZZCASH_PASSWORD=your_password

# Easypaisa – sandbox
EASYPAISA_USE_SANDBOX=true
EASYPAISA_SANDBOX_URL=https://sandbox.easypay.com.pk/...
EASYPAISA_STORE_ID=your_store_id
EASYPAISA_HASH_KEY=your_hash_key

# Safepay – sandbox
SAFEPAY_USE_SANDBOX=true
SAFEPAY_SANDBOX_URL=https://sandbox.safepay.com.pk/...
SAFEPAY_API_KEY=your_key

# Stripe – omit to hide “Pay with Card (Stripe)”
# STRIPE_SECRET_KEY=sk_test_...
```

---

## 5. Removing Stripe completely (use only local gateways)

1. **Stop using Stripe in config**  
   Do not set `STRIPE_SECRET_KEY`. The dynamic config already hides Stripe when that var is unset, so “Pay with Card (Stripe)” will not appear.

2. **Optional – delete Stripe code**  
   If you want to remove Stripe from the codebase:
   - Delete or stop using: `app/api/checkout/route.ts` (Stripe session), `app/api/checkout/create-payment-intent/route.ts`, `app/api/webhooks/stripe/route.ts`, `app/api/orders/by-session/route.ts`.
   - Remove Stripe from `lib/payments/config.ts` (delete the `stripe` entry).
   - In `app/order/success/page.tsx` you can remove the `session_id` / `by-session` branch if you only use `order_id` (all local gateways and COD use `order_id`).
   - Remove `lib/stripe.ts` and any Stripe-related env from `.env.example`.
   - Uninstall: `npm uninstall stripe`.

3. **Keep**  
   - All `/api/checkout/<gateway>` and `/api/payments/<gateway>/callback` routes.  
   - `GET /api/config/payments` and the checkout page that uses it.  
   - COD, card, JazzCash, Easypaisa, Safepay env vars as needed.

After this, checkout shows only the payment methods that have their env vars set (COD + any local gateways you configure).
