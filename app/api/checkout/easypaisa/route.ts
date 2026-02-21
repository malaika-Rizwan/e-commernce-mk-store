/**
 * Easypaisa checkout – Pakistan. Creates order, calls Easypaisa API, returns payment redirect URL.
 * Env: EASYPAISA_API_URL, EASYPAISA_STORE_ID, EASYPAISA_HASH_KEY (or EASYPAISA_API_KEY)
 * Test: EASYPAISA_USE_SANDBOX=true
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

const EASYPAISA_API_URL =
  process.env.EASYPAISA_USE_SANDBOX === 'true'
    ? process.env.EASYPAISA_SANDBOX_URL?.trim()
    : process.env.EASYPAISA_API_URL?.trim();
const EASYPAISA_STORE_ID = process.env.EASYPAISA_STORE_ID?.trim();
const EASYPAISA_HASH_KEY = process.env.EASYPAISA_HASH_KEY?.trim() || process.env.EASYPAISA_API_KEY?.trim();

function isConfigured(): boolean {
  return Boolean(EASYPAISA_API_URL && EASYPAISA_STORE_ID && EASYPAISA_HASH_KEY);
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
        'Easypaisa is not configured. Set EASYPAISA_API_URL, EASYPAISA_STORE_ID, EASYPAISA_HASH_KEY in .env.local',
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
      'easypaisa'
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
    const returnUrl = `${APP_URL}/api/payments/easypaisa/callback?orderId=${order._id.toString()}`;
    const cancelUrl = `${APP_URL}/order/cancel?reason=cancelled`;

    const payload = {
      storeId: EASYPAISA_STORE_ID,
      orderId: order._id.toString(),
      transactionAmount: order.totalPrice,
      tokenExpiry: new Date(Date.now() + 30 * 60 * 1000).toISOString(),
      postBackURL: returnUrl,
      paymentMethod: 'MA',
      merchantPaymentMethod: 'MA',
      mobileAccount: '',
      emailAddress: session.email ?? '',
      customerName: parsed.data.shippingAddress.fullName,
      customerMobileNumber: parsed.data.shippingAddress.phone ?? '',
      hashKey: EASYPAISA_HASH_KEY,
    };

    const gatewayRes = await fetch(EASYPAISA_API_URL!, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });

    const gatewayData = await gatewayRes.json().catch(() => ({}));
    const paymentUrl =
      gatewayData.paymentUrl ??
      gatewayData.redirectUrl ??
      gatewayData.url ??
      gatewayData.authTokenUrl;

    if (!paymentUrl || typeof paymentUrl !== 'string') {
      console.error('Easypaisa response:', gatewayData);
      return errorResponse(
        gatewayData.message ?? gatewayData.error ?? 'Could not create Easypaisa payment.',
        400
      );
    }

    return successResponse({
      url: paymentUrl,
      orderId: order._id.toString(),
    });
  } catch (err) {
    console.error('Easypaisa checkout error:', err);
    return serverErrorResponse();
  }
}
