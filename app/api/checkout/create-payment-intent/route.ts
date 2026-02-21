import { NextRequest } from 'next/server';
import { z } from 'zod';
import mongoose from 'mongoose';
import connectDB from '@/lib/db';
import Product from '@/models/Product';
import { getSession } from '@/lib/auth';
import { stripe, formatAmountForStripe, isStripeConfigured } from '@/lib/stripe';
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
      productId: z.string().min(1),
      quantity: z.number().min(1),
    })
  ).min(1),
});

export async function POST(request: NextRequest) {
  try {
    const session = await getSession();
    if (!session) return unauthorizedResponse();
    if (!isStripeConfigured()) {
      return errorResponse('Card payments are not configured', 503);
    }

    const body = await request.json();
    console.log('Create payment intent body:', JSON.stringify({ ...body, items: body?.items?.length ?? 0 }));
    const parsed = Schema.safeParse(body);
    if (!parsed.success) {
      return errorResponse('Invalid items', 400);
    }

    const { items, orderId } = parsed.data;
    await connectDB();

    let totalCents = 0;
    for (const item of items) {
      if (!item.productId?.trim()) return errorResponse('Product ID missing', 400);
      if (!mongoose.Types.ObjectId.isValid(item.productId.trim())) {
        return errorResponse(`Invalid product ID: ${item.productId}`, 400);
      }
      const product = await Product.findById(item.productId.trim()).lean();
      if (!product) return errorResponse('Product not found in database', 404);
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
