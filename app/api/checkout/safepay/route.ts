/**
 * Safepay checkout – Pakistan. Creates order, calls Safepay API, returns payment redirect URL.
 * Env: SAFEPAY_API_URL, SAFEPAY_API_KEY (or SAFEPAY_SECRET_KEY)
 * Test: SAFEPAY_USE_SANDBOX=true
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

const SAFEPAY_API_URL =
  process.env.SAFEPAY_USE_SANDBOX === 'true'
    ? process.env.SAFEPAY_SANDBOX_URL?.trim()
    : process.env.SAFEPAY_API_URL?.trim();
const SAFEPAY_API_KEY = process.env.SAFEPAY_API_KEY?.trim() || process.env.SAFEPAY_SECRET_KEY?.trim();

function isConfigured(): boolean {
  return Boolean(SAFEPAY_API_URL && SAFEPAY_API_KEY);
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
        'Safepay is not configured. Set SAFEPAY_API_URL, SAFEPAY_API_KEY in .env.local',
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
      'safepay'
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
    const returnUrl = `${APP_URL}/api/payments/safepay/callback?orderId=${order._id.toString()}`;
    const cancelUrl = `${APP_URL}/order/cancel?reason=cancelled`;

    const payload = {
      amount: order.totalPrice,
      currency: process.env.SAFEPAY_CURRENCY ?? 'PKR',
      reference_id: order._id.toString(),
      order_id: order.orderId ?? order._id.toString(),
      redirect_url: returnUrl,
      cancel_url: cancelUrl,
      customer: {
        email: session.email ?? undefined,
        name: parsed.data.shippingAddress.fullName,
        phone: parsed.data.shippingAddress.phone ?? undefined,
      },
      meta: { orderId: order._id.toString() },
    };

    const gatewayRes = await fetch(SAFEPAY_API_URL!, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${SAFEPAY_API_KEY}`,
      },
      body: JSON.stringify(payload),
    });

    const gatewayData = await gatewayRes.json().catch(() => ({}));
    const paymentUrl =
      gatewayData.data?.redirect_url ??
      gatewayData.redirect_url ??
      gatewayData.paymentUrl ??
      gatewayData.url;

    if (!paymentUrl || typeof paymentUrl !== 'string') {
      console.error('Safepay response:', gatewayData);
      return errorResponse(
        gatewayData.message ?? gatewayData.error ?? 'Could not create Safepay payment.',
        400
      );
    }

    return successResponse({
      url: paymentUrl,
      orderId: order._id.toString(),
    });
  } catch (err) {
    console.error('Safepay checkout error:', err);
    return serverErrorResponse();
  }
}
