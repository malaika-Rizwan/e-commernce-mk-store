/**
 * Safepay payment session – creates order, calls Safepay API, returns redirect_url.
 * Env: SAFEPAY_BASE_URL, SAFEPAY_SECRET_KEY. Never expose secret to client.
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
import connectDB from '@/lib/db';
import Order from '@/models/Order';

export const dynamic = 'force-dynamic';

const APP_URL = process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000';

const SAFEPAY_BASE =
  process.env.SAFEPAY_USE_SANDBOX === 'true'
    ? (process.env.SAFEPAY_SANDBOX_URL ?? process.env.SAFEPAY_BASE_URL)?.trim()
    : (process.env.SAFEPAY_BASE_URL ?? process.env.SAFEPAY_API_URL)?.trim();
const SAFEPAY_SECRET =
  process.env.SAFEPAY_SECRET_KEY?.trim() || process.env.SAFEPAY_API_KEY?.trim();

function isConfigured(): boolean {
  return Boolean(SAFEPAY_BASE && SAFEPAY_SECRET);
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
        'Safepay is not configured. Set SAFEPAY_BASE_URL and SAFEPAY_SECRET_KEY in .env.local',
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
    const orderIdStr = order._id.toString();
    const generatedOrderId = (order as { orderId?: string }).orderId ?? orderIdStr;

    const successUrl = `${APP_URL}/payment/success?orderId=${orderIdStr}`;
    const cancelUrl = `${APP_URL}/payment/cancel?orderId=${orderIdStr}`;

    const payload = {
      amount: order.totalPrice,
      currency: process.env.SAFEPAY_CURRENCY ?? 'PKR',
      order_id: generatedOrderId,
      reference_id: orderIdStr,
      customer_email: session.email ?? undefined,
      success_url: successUrl,
      cancel_url: cancelUrl,
      redirect_url: successUrl,
      customer: {
        email: session.email ?? undefined,
        name: parsed.data.shippingAddress.fullName,
        phone: parsed.data.shippingAddress.phone ?? undefined,
      },
      meta: { orderId: orderIdStr },
    };

    const base = SAFEPAY_BASE as string;
    const endpoint = base.endsWith('/order') ? base : `${base.replace(/\/$/, '')}/order`;
    const gatewayRes = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${SAFEPAY_SECRET}`,
      },
      body: JSON.stringify(payload),
    });

    const gatewayData = await gatewayRes.json().catch(() => ({}));
    const paymentUrl =
      gatewayData.data?.redirect_url ??
      gatewayData.redirect_url ??
      gatewayData.paymentUrl ??
      gatewayData.url;
    const safepayOrderId =
      gatewayData.data?.tracker_id ??
      gatewayData.data?.order_id ??
      gatewayData.tracker_id ??
      gatewayData.token;

    if (!paymentUrl || typeof paymentUrl !== 'string') {
      console.error('Safepay response:', gatewayData);
      return errorResponse(
        gatewayData.message ?? gatewayData.error ?? 'Could not create Safepay payment.',
        400
      );
    }

    if (safepayOrderId && typeof safepayOrderId === 'string') {
      await connectDB();
      await Order.findByIdAndUpdate(orderIdStr, {
        safepayOrderId: String(safepayOrderId),
        paymentStatus: 'pending',
      });
    }

    return successResponse({
      redirect_url: paymentUrl,
      url: paymentUrl,
      orderId: orderIdStr,
    });
  } catch (err) {
    console.error('Payment create error:', err);
    return serverErrorResponse();
  }
}
