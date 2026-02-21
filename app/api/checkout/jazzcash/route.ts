/**
 * JazzCash checkout – Pakistan. Creates order, calls JazzCash API, returns payment redirect URL.
 * Env: JAZZCASH_API_URL, JAZZCASH_MERCHANT_ID, JAZZCASH_PASSWORD (or JAZZCASH_API_KEY), JAZZCASH_SECURE_HASH (optional)
 * Test: JAZZCASH_USE_SANDBOX=true uses sandbox URL if set in env.
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

const JAZZCASH_API_URL =
  process.env.JAZZCASH_USE_SANDBOX === 'true'
    ? process.env.JAZZCASH_SANDBOX_URL?.trim()
    : process.env.JAZZCASH_API_URL?.trim();
const JAZZCASH_MERCHANT_ID = process.env.JAZZCASH_MERCHANT_ID?.trim();
const JAZZCASH_PASSWORD = process.env.JAZZCASH_PASSWORD?.trim() || process.env.JAZZCASH_API_KEY?.trim();

function isConfigured(): boolean {
  return Boolean(JAZZCASH_API_URL && JAZZCASH_MERCHANT_ID && JAZZCASH_PASSWORD);
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
        'JazzCash is not configured. Set JAZZCASH_API_URL, JAZZCASH_MERCHANT_ID, JAZZCASH_PASSWORD in .env.local',
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
      'jazzcash'
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
    const returnUrl = `${APP_URL}/api/payments/jazzcash/callback?orderId=${order._id.toString()}`;
    const cancelUrl = `${APP_URL}/order/cancel?reason=cancelled`;

    const payload = {
      pp_MerchantID: JAZZCASH_MERCHANT_ID,
      pp_Password: JAZZCASH_PASSWORD,
      pp_Amount: Math.round(order.totalPrice * 100),
      pp_TxnRefNo: order.orderId ?? order._id.toString(),
      pp_ReturnURL: returnUrl,
      pp_SecureHash: process.env.JAZZCASH_SECURE_HASH?.trim() || '',
      pp_TxnDateTime: new Date().toISOString().replace(/[-:]/g, '').slice(0, 14),
      pp_BillReference: order._id.toString(),
      pp_Description: `Order ${order.orderId ?? order._id}`,
    };

    const gatewayRes = await fetch(JAZZCASH_API_URL!, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });

    const gatewayData = await gatewayRes.json().catch(() => ({}));
    const paymentUrl =
      gatewayData.paymentUrl ??
      gatewayData.pp_RedirectURL ??
      gatewayData.redirect_url ??
      gatewayData.url;

    if (!paymentUrl || typeof paymentUrl !== 'string') {
      console.error('JazzCash response:', gatewayData);
      return errorResponse(
        gatewayData.pp_ResponseMessage ?? gatewayData.message ?? 'Could not create JazzCash payment.',
        400
      );
    }

    return successResponse({
      url: paymentUrl,
      orderId: order._id.toString(),
    });
  } catch (err) {
    console.error('JazzCash checkout error:', err);
    return serverErrorResponse();
  }
}
