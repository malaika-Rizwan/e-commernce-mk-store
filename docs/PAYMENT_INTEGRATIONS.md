# Payment Integration Guide – Next.js (Pakistan & International)

This document lists **ready-to-use payment options** for your MK Store Next.js project, with a focus on **Pakistan (JazzCash, Easypaisa)** and **Stripe**. It explains how to **add**, **remove**, or **replace** payment methods in the codebase, with **Next.js code snippets** you can use immediately.

---

## Table of contents

1. [Payment options overview](#1-payment-options-overview)
2. [Where payments live in your code](#2-where-payments-live-in-your-code)
3. [How to add a new payment method](#3-how-to-add-a-new-payment-method)
4. [How to remove or replace Stripe](#4-how-to-remove-or-replace-stripe)
5. [Pakistan gateways: JazzCash & Easypaisa](#5-pakistan-gateways-jazzcash--easypaisa)
6. [Shared types and config](#6-shared-types-and-config)

---

## 1. Payment options overview

| Gateway        | Region        | Type              | Best for                    | Docs / signup |
|----------------|---------------|-------------------|-----------------------------|----------------|
| **Stripe**     | Global        | Card, redirect    | International cards         | [dashboard.stripe.com](https://dashboard.stripe.com) |
| **JazzCash**   | Pakistan      | Wallet, OTC, card | PKR, mobile wallet          | [payments.jazzcash.com.pk](https://payments.jazzcash.com.pk/SandboxDocumentation/) |
| **Easypaisa**  | Pakistan      | Wallet, OTC, card | PKR, mobile wallet          | [easypay.easypaisa.com.pk](https://easypay.easypaisa.com.pk/easypay-merchant/faces/pg/site/IntegrationGuides.jsf) |
| **Cash on Delivery (COD)** | Any | Offline         | Already in project          | N/A |
| **PayFast**    | Pakistan      | Card, wallet      | PKR                         | [payfast.com.pk](https://www.payfast.com.pk/) |
| **2Checkout / Verifone** | Global | Card           | Alternative to Stripe       | [verifone.com](https://www.verifone.com/) |

Your project **already has**:

- **Stripe** – `/api/checkout` (card), `/api/webhooks/stripe`, `/api/checkout/create-payment-intent`
- **Cash on Delivery** – `/api/checkout/cod`

You can **add** JazzCash, Easypaisa, or others by adding new API routes and buttons as below.

---

## 2. Where payments live in your code

Use this map when adding, removing, or replacing a method.

| What | File(s) | Purpose |
|------|---------|--------|
| **Stripe config** | `lib/stripe.ts` | Secret key, `isStripeConfigured()` |
| **Card checkout** | `app/api/checkout/route.ts` | Creates Stripe session, creates order, returns redirect URL |
| **COD checkout** | `app/api/checkout/cod/route.ts` | Creates order, no redirect |
| **Payment intent** | `app/api/checkout/create-payment-intent/route.ts` | Optional; used if you use Stripe Elements |
| **Stripe webhook** | `app/api/webhooks/stripe/route.ts` | Marks order paid, updates stock |
| **Order by session** | `app/api/orders/by-session/route.ts` | Fetches order by Stripe `session_id` for success page |
| **Checkout UI** | `app/checkout/page.tsx` | “Pay with Card” → `handlePayWithCard` (Stripe), “Cash on Delivery” → `handleCashOnDelivery` |
| **Success page** | `app/order/success/page.tsx` | Handles `?session_id=` (Stripe) and `?order_id=` (COD) |
| **Order model** | `models/Order.ts` | `paymentMethod`, `stripeSessionId`, `paymentResult`, `isPaid` |

---

## 3. How to add a new payment method

High-level steps:

1. **Create an API route** that validates cart, creates the order, calls the gateway (e.g. JazzCash/Easypaisa), returns redirect URL or payment token.
2. **Add a button** on the checkout page that calls this route and redirects.
3. **Add a callback/return URL route** (and optionally a webhook) to verify payment and update the order (`isPaid`, `paymentResult`).

### 3.1 New API route (example: “JazzCash” style)

Create `app/api/checkout/jazzcash/route.ts` (or `easypaisa`, etc.):

```ts
// app/api/checkout/jazzcash/route.ts
import { NextRequest } from 'next/server';
import mongoose from 'mongoose';
import connectDB from '@/lib/db';
import Order, { assignOrderIds } from '@/models/Order';
import Product from '@/models/Product';
import Coupon from '@/models/Coupon';
import { getSession } from '@/lib/auth';
import { createCheckoutSessionSchema } from '@/lib/validations/checkout';
import { successResponse, errorResponse, unauthorizedResponse, serverErrorResponse } from '@/lib/api-response';

const APP_URL = process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000';

export async function POST(request: NextRequest) {
  try {
    const session = await getSession();
    if (!session) return unauthorizedResponse();

    await connectDB();

    const body = await request.json();
    const parsed = createCheckoutSessionSchema.safeParse(body);
    if (!parsed.success) {
      const msg = parsed.error.errors.map((e) => e.message).join('. ');
      return errorResponse(msg, 400);
    }

    const { shippingAddress, items: cartItems, couponCode } = parsed.data;

    // 1) Validate items & build order (same logic as COD – fetch product, check stock, use DB price)
    const orderItems: Array<{ product: string; name: string; quantity: number; price: number; image?: string }> = [];
    let itemsPrice = 0;
    for (const item of cartItems) {
      if (!item.productId?.trim()) return errorResponse('Product ID missing', 400);
      if (!mongoose.Types.ObjectId.isValid(item.productId.trim())) {
        return errorResponse(`Invalid product ID: ${item.productId}`, 400);
      }
      const product = await Product.findById(item.productId.trim()).lean();
      if (!product) return errorResponse('Product not found in database', 404);
      if (product.stock < item.quantity) {
        return errorResponse(`Insufficient stock for ${product.name}`, 400);
      }
      itemsPrice += product.price * item.quantity;
      orderItems.push({
        product: product._id.toString(),
        name: product.name,
        quantity: item.quantity,
        price: product.price,
        image: typeof product.images?.[0] === 'string' ? product.images[0] : product.images?.[0]?.url,
      });
    }

    const shippingPrice = itemsPrice >= 100 ? 0 : 10;
    const taxPrice = Math.round(itemsPrice * 0.1 * 100) / 100;
    const totalPrice = itemsPrice + shippingPrice + taxPrice;

    const order = await Order.create({
      user: session.userId,
      items: orderItems,
      shippingAddress,
      paymentMethod: 'jazzcash',
      itemsPrice,
      shippingPrice,
      taxPrice,
      totalPrice,
      isPaid: false,
      isDelivered: false,
      orderStatus: 'Processing',
    });
    await assignOrderIds(order);
    await order.save();

    // 2) Call gateway API (replace with real JazzCash/Easypaisa request)
    const gatewayResponse = await fetch(process.env.JAZZCASH_PAYMENT_URL!, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        merchantId: process.env.JAZZCASH_MERCHANT_ID,
        amount: totalPrice,
        orderId: order._id.toString(),
        returnUrl: `${APP_URL}/api/payments/jazzcash/callback?orderId=${order._id}`,
        // ... other required fields per JazzCash docs
      }),
    });
    const data = await gatewayResponse.json();

    if (!data.paymentUrl) {
      return errorResponse(data.message ?? 'Could not create payment', 400);
    }

    return successResponse({ url: data.paymentUrl, orderId: order._id.toString() });
  } catch (err) {
    console.error('JazzCash checkout error:', err);
    return serverErrorResponse();
  }
}
```

### 3.2 Callback route (verify payment and update order)

Create `app/api/payments/jazzcash/callback/route.ts`:

```ts
// app/api/payments/jazzcash/callback/route.ts
import { NextRequest } from 'next/server';
import connectDB from '@/lib/db';
import Order, { assignOrderIds } from '@/models/Order';
import Product from '@/models/Product';
import { redirect } from 'next/navigation';

const APP_URL = process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const orderId = searchParams.get('orderId');
  const status = searchParams.get('status'); // gateway-specific
  const transactionId = searchParams.get('transactionId');

  if (!orderId) {
    return Response.redirect(`${APP_URL}/order/cancel?reason=missing_order`);
  }

  try {
    await connectDB();
    const order = await Order.findById(orderId);
    if (!order) {
      return Response.redirect(`${APP_URL}/order/cancel?reason=order_not_found`);
    }

    if (order.isPaid) {
      return Response.redirect(`${APP_URL}/order/success?order_id=${orderId}`);
    }

    // Verify with gateway (e.g. server-to-server) that transactionId is actually paid
    // const verified = await verifyWithJazzCash(transactionId);
    const verified = status === 'success'; // replace with real verification

    if (verified) {
      if (!order.orderId) await assignOrderIds(order);
      order.isPaid = true;
      order.paidAt = new Date();
      order.paymentResult = { id: transactionId ?? '', status: 'paid', email: undefined };
      await order.save();

      for (const item of order.items) {
        await Product.findByIdAndUpdate(item.product, { $inc: { stock: -item.quantity } });
      }
    }

    if (verified) {
      return Response.redirect(`${APP_URL}/order/success?order_id=${orderId}`);
    }
  } catch (e) {
    console.error('JazzCash callback error:', e);
  }

  return Response.redirect(`${APP_URL}/order/cancel?reason=payment_failed`);
}
```

### 3.3 Add button on checkout page

In `app/checkout/page.tsx`, add state and handler, then a new button:

```tsx
// Add state
const [jazzLoading, setJazzLoading] = useState(false);

// Add handler
async function handleJazzCash(e: React.FormEvent) {
  e.preventDefault();
  setError('');
  setFieldErrors({});
  const payload = getPayload();
  if (!payload) return;
  setJazzLoading(true);
  try {
    const res = await fetch('/api/checkout/jazzcash', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify(payload),
    });
    const data = await res.json();
    if (!res.ok) {
      setError(data.error ?? 'Payment failed');
      toast.error(data.error);
      return;
    }
    if (data.data?.url) {
      window.location.href = data.data.url;
      return;
    }
    toast.error('Invalid response');
  } catch {
    setError('Network error');
    toast.error('Network error');
  } finally {
    setJazzLoading(false);
  }
}

// In the form, add button (e.g. after "Pay with Card"):
<Button
  type="button"
  variant="outline"
  fullWidth
  onClick={handleJazzCash}
  isLoading={jazzLoading}
  disabled={anyLoading}
>
  Pay with JazzCash
</Button>
```

Your success page already supports `?order_id=` so JazzCash/Easypaisa redirects to ` /order/success?order_id=...` will work.

---

## 4. How to remove or replace Stripe

### Option A: Keep COD only (disable card)

1. **Hide “Pay with Card”**  
   In `app/checkout/page.tsx`, either remove the “Pay with Card” button or wrap it in a check:
   ```tsx
   {isStripeConfigured && (
     <Button ... onClick={handlePayWithCard}>Pay with Card</Button>
   )}
   ```
   You’d need to expose `isStripeConfigured` from an API (e.g. `/api/config` returns `{ stripe: boolean }`) or from an env-based client config.

2. **Optional: delete Stripe routes**  
   You can delete or stop using:
   - `app/api/checkout/route.ts` (Stripe checkout)
   - `app/api/checkout/create-payment-intent/route.ts`
   - `app/api/webhooks/stripe/route.ts`
   - `app/api/orders/by-session/route.ts`  
   If you remove `by-session`, the success page should rely only on `order_id` (COD and other gateways).

### Option B: Replace Stripe with another card gateway

1. Implement the new gateway (e.g. PayFast, 2Checkout) in a new route, e.g. `app/api/checkout/payfast/route.ts`, following the same pattern as the JazzCash example (create order → get payment URL → return redirect).
2. Point “Pay with Card” to the new handler instead of `handlePayWithCard` (e.g. `handlePayWithCard` calls `/api/checkout/payfast`).
3. Add the new gateway’s callback/webhook to set `order.isPaid` and update stock (same idea as `app/api/webhooks/stripe/route.ts`).
4. Remove or leave unused: `app/api/checkout/route.ts`, Stripe webhook, `lib/stripe.ts`, and Stripe env vars.

### Option C: Keep Stripe and add Pakistan gateways

Keep all existing Stripe code. Add JazzCash and Easypaisa as **additional** routes and buttons (as in section 3). Order model already has `paymentMethod: String` so you can set `'stripe' | 'cod' | 'jazzcash' | 'easypaisa'`.

---

## 5. Pakistan gateways: JazzCash & Easypaisa

### JazzCash

- **Docs (sandbox):** [payments.jazzcash.com.pk Sandbox](https://payments.jazzcash.com.pk/SandboxDocumentation/)
- **Methods:** Mobile wallet, OTC voucher, card, bank account.
- **Flow:** Merchant gets credentials → create payment (POST or API) → customer redirected to JazzCash → return URL + optional webhook for status.
- **Env vars (example):**
  ```env
  JAZZCASH_MERCHANT_ID=your_merchant_id
  JAZZCASH_PASSWORD=your_password
  JAZZCASH_SECURE_HASH=your_hash_key
  JAZZCASH_PAYMENT_URL=https://sandbox.jazzcash.com.pk/CustomerPortal/transactionmanagement/merchantform/
  ```
- **Verification:** Verify callback/webhook with secure hash per [JazzCash API references](https://sandbox.jazzcash.com.pk/SandboxDocumentation/v4.2/ApiReferences.html).

### Easypaisa

- **Docs:** [Easypay Merchant Integration](https://easypay.easypaisa.com.pk/easypay-merchant/faces/pg/site/IntegrationGuides.jsf)
- **Methods:** OTC, Mobile Account, Credit Card, Internet Banking, etc.
- **Flow:** POST or REST API; redirect to Easypaisa; return URL + callback for confirmation. TLS 1.2+ required.
- **Support:** businesspartnersupport@telenorbank.pk; merchant hotline 62632.

Use the same pattern as the JazzCash example: one route to create order and get payment link, one callback route to verify and set `isPaid`, then add a “Pay with Easypaisa” (or JazzCash) button on checkout.

---

## 6. Shared types and config

Centralizing payment method ids helps when adding/removing methods. Add a small config and use it in the checkout page and order display.

**Create `lib/payments/config.ts`:**

```ts
export const PAYMENT_METHODS = {
  stripe: {
    id: 'stripe',
    label: 'Pay with Card',
    description: 'Secure payment via Stripe',
    route: '/api/checkout',
    enabled: true, // or read from env
  },
  cod: {
    id: 'cod',
    label: 'Cash on Delivery',
    description: 'Pay when you receive',
    route: '/api/checkout/cod',
    enabled: true,
  },
  jazzcash: {
    id: 'jazzcash',
    label: 'JazzCash',
    description: 'Pay with JazzCash wallet',
    route: '/api/checkout/jazzcash',
    enabled: Boolean(process.env.JAZZCASH_MERCHANT_ID),
  },
  easypaisa: {
    id: 'easypaisa',
    label: 'Easypaisa',
    description: 'Pay with Easypaisa wallet',
    route: '/api/checkout/easypaisa',
    enabled: Boolean(process.env.EASYPAISA_MERCHANT_ID),
  },
} as const;

export type PaymentMethodId = keyof typeof PAYMENT_METHODS;
```

Use `PAYMENT_METHODS` in the checkout page to render buttons and call the correct `route` for each method. You can add or remove entries to add or remove payment options without changing component logic.

**In this project:**

- **Config:** `lib/payments/config.ts` – defines `PAYMENT_METHODS` and `getEnabledPaymentMethods()`. JazzCash/Easypaisa are enabled when `JAZZCASH_MERCHANT_ID` / `EASYPAISA_MERCHANT_ID` are set.
- **API:** `GET /api/config/payments` – returns `{ paymentMethods: [{ id, label, description, route }] }` for enabled methods only (no secrets). Use this in the checkout page to render buttons dynamically.

---

## Quick reference: add / remove / replace

| Goal | Action |
|------|--------|
| **Add JazzCash** | Add `app/api/checkout/jazzcash/route.ts`, callback route, env vars, button + handler in checkout. |
| **Add Easypaisa** | Same as JazzCash with Easypaisa API and callback. |
| **Remove Stripe** | Hide or remove “Pay with Card”, optionally delete Stripe routes and webhook; success page can use only `order_id`. |
| **Replace Stripe** | New route for new gateway; point card button to it; new webhook/callback to set `isPaid`. |
| **Keep Stripe, add PK gateways** | Keep all Stripe code; add JazzCash/Easypaisa routes + buttons; set `paymentMethod` per gateway. |

If you want, the next step can be a concrete JazzCash or Easypaisa integration (exact request/response and verification) based on the PDF/API docs you have from the gateway.
