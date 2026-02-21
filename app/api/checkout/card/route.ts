/**
 * Generic card/wallet gateway – Pakistan / South Africa.
 * Creates order via shared helper, calls CARD_PAYMENT_* API, returns redirect URL.
 */
import { NextRequest } from 'next/server';
import { getSession } from '@/lib/auth';
import { rateLimit, getClientIdentifier } from '@/lib/rate-limit';
import {
  successResponse,
  errorResponse,
  unauthorizedResponse,
  serverErrorResponse,
} from '@/lib/api-response';
import { createCheckoutSessionSchema } from '@/lib/validations/checkout';
import { createOrderForGateway } from '@/lib/payments/createOrder';

const APP_URL = process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000';

const CARD_API_URL = process.env.CARD_PAYMENT_API_URL?.trim();
const CARD_MERCHANT_ID = process.env.CARD_PAYMENT_MERCHANT_ID?.trim();
const CARD_API_KEY = process.env.CARD_PAYMENT_API_KEY?.trim();

function isConfigured(): boolean {
  return Boolean(CARD_API_URL && CARD_MERCHANT_ID && CARD_API_KEY);
}

export async function POST(request: NextRequest) {
  try {
    const id = getClientIdentifier(request);
    const { success, remaining, resetAt } = await rateLimit(id, 'checkout', {
      windowMs: 60 * 1000,
      max: 10,
    });
    if (!success) {
      return new Response(
        JSON.stringify({ success: false, error: 'Too many requests. Try again later.' }),
        {
          status: 429,
          headers: {
            'Content-Type': 'application/json',
            'X-RateLimit-Remaining': String(remaining),
            'Retry-After': String(Math.ceil((resetAt - Date.now()) / 1000)),
          },
        }
      );
    }

    const session = await getSession();
    if (!session) return unauthorizedResponse();

    if (!isConfigured()) {
      return errorResponse(
        'Card payment is not configured. Add CARD_PAYMENT_API_URL, CARD_PAYMENT_MERCHANT_ID, CARD_PAYMENT_API_KEY to .env.local',
        503
      );
    }

    const body = await request.json();
    const parsed = createCheckoutSessionSchema.safeParse(body);
    if (!parsed.success) {
      const msg = parsed.error.errors.map((e) => e.message).join('. ');
      return errorResponse(msg, 400);
    }

    const result = await createOrderForGateway(
      session.userId,
      parsed.data,
      'card'
    );

    if ('status' in result) {
      if (result.unavailableProductIds?.length) {
        return new Response(
          JSON.stringify({
            success: false,
            error: result.message,
            unavailableProductIds: result.unavailableProductIds,
          }),
          { status: result.status, headers: { 'Content-Type': 'application/json' } }
        );
      }
      return errorResponse(result.message, result.status);
    }

    const { order } = result;
    const returnUrl = `${APP_URL}/api/payments/card/callback?orderId=${order._id.toString()}`;
    const cancelUrl = `${APP_URL}/order/cancel?reason=cancelled`;

    const gatewayPayload = {
      merchantId: CARD_MERCHANT_ID,
      amount: order.totalPrice,
      currency: process.env.CARD_PAYMENT_CURRENCY ?? 'PKR',
      orderId: order._id.toString(),
      orderRef: order.orderId ?? order._id.toString(),
      returnUrl,
      cancelUrl,
      customerEmail: session.email ?? undefined,
      customerName: parsed.data.shippingAddress.fullName,
      customerPhone: parsed.data.shippingAddress.phone ?? undefined,
      description: `Order ${order.orderId ?? order._id}`,
    };

    const gatewayRes = await fetch(CARD_API_URL!, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${CARD_API_KEY}`,
        ...(process.env.CARD_PAYMENT_API_HEADER_KEY && {
          [process.env.CARD_PAYMENT_API_HEADER_KEY]: CARD_API_KEY,
        }),
      },
      body: JSON.stringify(gatewayPayload),
    });

    const gatewayData = await gatewayRes.json().catch(() => ({}));
    const paymentUrl =
      gatewayData.paymentUrl ??
      gatewayData.redirectUrl ??
      gatewayData.url ??
      gatewayData.checkout_url ??
      gatewayData.data?.paymentUrl;

    if (!paymentUrl || typeof paymentUrl !== 'string') {
      console.error('Card gateway response:', gatewayData);
      return errorResponse(
        gatewayData.message ?? gatewayData.error ?? 'Could not create payment. Please try again or use Cash on Delivery.',
        400
      );
    }

    return successResponse({
      url: paymentUrl,
      orderId: order._id.toString(),
    });
  } catch (err) {
    console.error('Card checkout error:', err);
    return serverErrorResponse();
  }
}
