# Enable Card Payments (Stripe)

Card payments work as soon as Stripe keys are set. Follow these steps.

## 1. Get your Stripe keys

1. Go to **[Stripe Dashboard → API keys](https://dashboard.stripe.com/apikeys)** (log in or create a free account).
2. Copy:
   - **Secret key** (starts with `sk_test_` for test, `sk_live_` for production).

## 2. Add the key to `.env.local`

Open `.env.local` in the project root and set:

```env
STRIPE_SECRET_KEY=sk_test_your_actual_key_here
```

Replace `sk_test_your_actual_key_here` with the **Secret key** you copied. No quotes, no spaces.

Example (fake key):

```env
STRIPE_SECRET_KEY=sk_test_51ABC123...
```

## 3. Restart the dev server

Stop the current server (Ctrl+C), then start again:

```bash
npm run dev
```

After this, **Pay with Card** on checkout will redirect to Stripe’s payment page and card payments will work.

---

### Optional: webhooks (for order status updates)

For payment confirmation webhooks (e.g. mark order as paid):

1. In Stripe: **Developers → Webhooks → Add endpoint**.
2. Use your URL, e.g. `https://your-domain.com/api/webhooks/stripe`.
3. Copy the **Signing secret** (starts with `whsec_`) and add to `.env.local`:

```env
STRIPE_WEBHOOK_SECRET=whsec_your_signing_secret
```

---

### Test cards (test mode)

When using `sk_test_...` you can use [Stripe test cards](https://docs.stripe.com/testing#cards), e.g.:

- **Success:** `4242 4242 4242 4242`
- **Decline:** `4000 0000 0000 0002`
- Use any future expiry and any CVC.
