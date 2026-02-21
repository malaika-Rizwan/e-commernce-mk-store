# Pay with Card – Pakistan / South Africa Setup

When the user clicks **Pay with Card** on checkout, the app calls your payment gateway API (Pakistan / South Africa cards and wallets), then redirects the user to the gateway to complete payment.

## Flow

1. User clicks **Pay with Card** → frontend POSTs to `/api/checkout/card` with shipping address and cart items.
2. Backend creates the order (unpaid), then calls your **gateway API** with amount, order ref, and return URL.
3. Gateway returns a **payment URL**; backend returns it to the frontend; user is redirected to the gateway.
4. User pays on the gateway; gateway redirects to `/api/payments/card/callback?orderId=...&status=...&transactionId=...`.
5. Callback marks the order paid, updates stock, sends confirmation email, redirects to `/order/success?order_id=...`.

## Env vars (.env.local)

```env
CARD_PAYMENT_API_URL=https://your-gateway.com/api/v1/create-payment
CARD_PAYMENT_MERCHANT_ID=your_merchant_id
CARD_PAYMENT_API_KEY=your_api_key
```

Optional:

- `CARD_PAYMENT_CURRENCY` – default `PKR`
- `CARD_PAYMENT_API_HEADER_KEY` – if the gateway expects the API key in a custom header (e.g. `X-Api-Key`), set this to the header name; otherwise `Authorization: Bearer <key>` is sent.

## Gateway API contract

Your gateway endpoint must:

1. **Accept** POST with JSON body. We send:
   - `merchantId`, `amount`, `currency`, `orderId`, `orderRef`
   - `returnUrl` – where to redirect after payment (our callback)
   - `cancelUrl` – where to redirect if user cancels
   - `customerEmail`, `customerName`, `customerPhone`, `description`

2. **Return** JSON with a redirect URL in one of these fields (first found wins):
   - `paymentUrl`
   - `redirectUrl`
   - `url`
   - `checkout_url`
   - `data.paymentUrl`

3. **Redirect** the user after payment to:
   `returnUrl?orderId=<orderId>&status=success&transactionId=<gateway_ref>`

   We treat `status` as success if it is (case-insensitive): `success`, `completed`, `paid`, `PAID`, `SUCCESS`, `1`, `true`.  
   We also read `transaction_id`, `ref`, or `payment_id` as the transaction reference.

If your gateway uses different parameter names, you can either:

- Add a small adapter in `app/api/checkout/card/route.ts` to map our body to the gateway’s request shape and map the gateway response to `paymentUrl`, or
- Use serverless/middleware to translate request/response.

## Callback URL to give your gateway

Use this as the “return URL” or “success URL” in your gateway dashboard (or in the API request we send):

```
https://your-domain.com/api/payments/card/callback
```

We append `?orderId=<id>` when calling the gateway; the gateway should redirect back to the same URL and can add `&status=...&transactionId=...`.

## Testing without a real gateway

To test the flow without a real API:

1. Use a request mock (e.g. Postman or a small Express server) that responds with `{ "paymentUrl": "https://example.com/success?orderId=XXX&status=success&transactionId=test123" }`.
2. Set `CARD_PAYMENT_API_URL` to your mock URL.
3. After “payment”, the user will hit the callback with `status=success` and the order will be marked paid.
