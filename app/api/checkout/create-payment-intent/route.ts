import { NextRequest } from 'next/server';
import { z } from 'zod';
import connectDB from '@/lib/db';
import Product from '@/models/Product';
import { getSession } from '@/lib/auth';
import { stripe, formatAmountForStripe } from '@/lib/stripe';
import {
  successResponse,
  errorResponse,
  unauthorizedResponse,
  serverErrorResponse,
} from '@/lib/api-response';

const Schema = z.object({
  orderId: z.string().optional(),
  items: z.array(
    z.object({
      productId: z.string(),
      quantity: z.number().min(1),
    })
  ),
});

export async function POST(request: NextRequest) {
  try {
    const session = await getSession();
    if (!session) return unauthorizedResponse();

    const body = await request.json();
    const parsed = Schema.safeParse(body);
    if (!parsed.success) {
      return errorResponse('Invalid items', 400);
    }

    const { items, orderId } = parsed.data;
    await connectDB();

    let totalCents = 0;
    for (const item of items) {
      const product = await Product.findById(item.productId).lean();
      if (!product) return errorResponse(`Product not found: ${item.productId}`, 400);
      if (product.stock < item.quantity) {
        return errorResponse(`Insufficient stock for ${product.name}`, 400);
      }
      totalCents += formatAmountForStripe(product.price * item.quantity);
    }

    const shippingCents = totalCents >= 10000 ? 0 : 1000; // $10 or free over $100
    const taxCents = Math.round(totalCents * 0.1);
    const amount = totalCents + shippingCents + taxCents;

    if (amount < 50) {
      return errorResponse('Minimum order amount is $0.50', 400);
    }

    const paymentIntent = await stripe.paymentIntents.create({
      amount,
      currency: 'usd',
      automatic_payment_methods: { enabled: true },
      metadata: {
        userId: session.userId,
        email: session.email,
        ...(orderId && { orderId }),
      },
    });

    return successResponse({
      clientSecret: paymentIntent.client_secret,
    });
  } catch (err) {
    console.error('Create payment intent error:', err);
    return serverErrorResponse();
  }
}
