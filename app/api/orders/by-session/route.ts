import { NextRequest } from 'next/server';
import connectDB from '@/lib/db';
import Order from '@/models/Order';
import { getSession } from '@/lib/auth';
import { stripe } from '@/lib/stripe';
import {
  successResponse,
  errorResponse,
  unauthorizedResponse,
  notFoundResponse,
  serverErrorResponse,
} from '@/lib/api-response';

/**
 * Get order by Stripe Checkout session ID (for success page after Stripe redirect).
 */
export async function GET(request: NextRequest) {
  try {
    const session = await getSession();
    if (!session) return unauthorizedResponse();

    const { searchParams } = new URL(request.url);
    const sessionId = searchParams.get('session_id');
    if (!sessionId) return errorResponse('Missing session_id', 400);

    const stripeSession = await stripe.checkout.sessions.retrieve(sessionId, {
      expand: [],
    });
    const orderId =
      stripeSession.client_reference_id ??
      (stripeSession.metadata?.orderId as string | undefined);
    if (!orderId) return notFoundResponse('Order not found');

    await connectDB();
    const order = await Order.findOne({
      _id: orderId,
      user: session.userId,
    }).lean();

    if (!order) return notFoundResponse('Order not found');

    return successResponse(order);
  } catch (err) {
    console.error('Order by session error:', err);
    return serverErrorResponse();
  }
}
