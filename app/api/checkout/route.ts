import { NextRequest } from 'next/server';
import mongoose from 'mongoose';
import connectDB from '@/lib/db';
import Order, { assignOrderIds } from '@/models/Order';
import Product from '@/models/Product';
import Coupon from '@/models/Coupon';
import { getSession } from '@/lib/auth';
import { rateLimit, getClientIdentifier } from '@/lib/rate-limit';
import { stripe, formatAmountForStripe, isStripeConfigured } from '@/lib/stripe';
import {
  successResponse,
  errorResponse,
  unauthorizedResponse,
  serverErrorResponse,
} from '@/lib/api-response';
import { createCheckoutSessionSchema } from '@/lib/validations/checkout';

const APP_URL = process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000';
const SHIPPING_FLAT_CENTS = 1000; // $10
const FREE_SHIPPING_THRESHOLD_CENTS = 10000; // $100
const TAX_RATE = 0.1;

export async function POST(request: NextRequest) {
  try {
    const id = getClientIdentifier(request);
    const { success, remaining, resetAt } = await rateLimit(id, 'checkout', { windowMs: 60 * 1000, max: 10 });
    if (!success) {
      return new Response(
        JSON.stringify({ success: false, error: 'Too many checkout attempts. Try again later.' }),
        { status: 429, headers: { 'Content-Type': 'application/json', 'X-RateLimit-Remaining': String(remaining), 'Retry-After': String(Math.ceil((resetAt - Date.now()) / 1000)) } }
      );
    }
    const session = await getSession();
    if (!session) return unauthorizedResponse();
    if (!isStripeConfigured()) {
      return errorResponse('Card payments are not configured. Use Cash on Delivery or add STRIPE_SECRET_KEY to .env.local', 503);
    }

    await connectDB();

    const body = await request.json();
    // Temporary debug – remove after testing
    console.log('Checkout body (Stripe):', JSON.stringify({ ...body, items: body?.items?.length ?? 0 }));
    const parsed = createCheckoutSessionSchema.safeParse(body);
    if (!parsed.success) {
      const msg = parsed.error.errors.map((e) => e.message).join('. ');
      return errorResponse(msg, 400);
    }

    const { shippingAddress, items: cartItems, couponCode } = parsed.data;
    console.log('Cart items (Stripe):', cartItems);

    const orderItems: Array<{
      product: string;
      name: string;
      quantity: number;
      price: number;
      image?: string;
    }> = [];
    let itemsPriceCents = 0;
    const unavailableIds: string[] = [];

    for (const item of cartItems) {
      if (!item.productId || typeof item.productId !== 'string' || !item.productId.trim()) {
        return errorResponse('Product ID missing', 400);
      }
      const productId = item.productId.trim();
      if (!mongoose.Types.ObjectId.isValid(productId)) {
        return errorResponse(`Invalid product ID: ${productId}`, 400);
      }

      const product = await Product.findById(productId).lean();
      if (!product) {
        unavailableIds.push(productId);
        continue;
      }
      if (product.stock < item.quantity) {
        return errorResponse(`Insufficient stock for ${product.name}. Available: ${product.stock}`, 400);
      }
      const priceCents = formatAmountForStripe(product.price) * item.quantity;
      itemsPriceCents += priceCents;
      orderItems.push({
        product: product._id.toString(),
        name: product.name,
        quantity: item.quantity,
        price: product.price,
        image: typeof product.images?.[0] === 'string' ? product.images[0] : product.images?.[0]?.url,
      });
    }

    if (unavailableIds.length > 0) {
      return new Response(
        JSON.stringify({
          success: false,
          error: 'Some products are no longer available. Please remove them from your cart and try again.',
          unavailableProductIds: unavailableIds,
        }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    if (orderItems.length === 0) {
      return errorResponse('No valid items to order', 400);
    }

    let discountAmount = 0;
    let appliedCouponCode: string | undefined;
    if (couponCode?.trim()) {
      const coupon = await Coupon.findOne({ code: couponCode.trim().toUpperCase() }).lean();
      if (coupon) {
        const now = new Date();
        const subtotal = itemsPriceCents / 100;
        const valid =
          (!coupon.expiresAt || now <= new Date(coupon.expiresAt)) &&
          (coupon.maxUses == null || coupon.usedCount < coupon.maxUses);
        const minOk = coupon.minOrder == null || subtotal >= coupon.minOrder;
        if (valid && minOk) {
          if (coupon.type === 'percent') {
            discountAmount = Math.round((subtotal * Math.min(coupon.value, 100) / 100) * 100) / 100;
          } else {
            discountAmount = Math.min(coupon.value, subtotal);
            discountAmount = Math.round(discountAmount * 100) / 100;
          }
          appliedCouponCode = coupon.code;
        }
      }
    }

    const shippingCents =
      itemsPriceCents >= FREE_SHIPPING_THRESHOLD_CENTS ? 0 : SHIPPING_FLAT_CENTS;
    const taxCents = Math.round(itemsPriceCents * TAX_RATE);
    const discountCents = Math.round(discountAmount * 100);
    const totalCents = Math.max(0, itemsPriceCents + shippingCents + taxCents - discountCents);

    const itemsPrice = itemsPriceCents / 100;
    const shippingPrice = shippingCents / 100;
    const taxPrice = taxCents / 100;
    const totalPrice = totalCents / 100;

    const order = await Order.create({
      user: session.userId,
      items: orderItems,
      shippingAddress,
      paymentMethod: 'stripe',
      itemsPrice,
      shippingPrice,
      taxPrice,
      discountAmount: discountAmount > 0 ? discountAmount : undefined,
      couponCode: appliedCouponCode,
      totalPrice,
      isPaid: false,
      isDelivered: false,
      orderStatus: 'Processing',
    });
    await assignOrderIds(order);
    await order.save();

    const lineItems: Array<{
      price_data: {
        currency: string;
        product_data: { name: string; images?: string[] };
        unit_amount: number;
      };
      quantity: number;
    }> = orderItems.map((i) => ({
      price_data: {
        currency: 'usd',
        product_data: {
          name: i.name,
          ...(i.image ? { images: [i.image] } : {}),
        },
        unit_amount: formatAmountForStripe(i.price),
      },
      quantity: i.quantity,
    }));

    if (shippingCents > 0) {
      lineItems.push({
        price_data: {
          currency: 'usd',
          product_data: { name: 'Shipping' },
          unit_amount: shippingCents,
        },
        quantity: 1,
      });
    }

    if (taxCents > 0) {
      lineItems.push({
        price_data: {
          currency: 'usd',
          product_data: { name: 'Tax' },
          unit_amount: taxCents,
        },
        quantity: 1,
      });
    }

    if (discountCents > 0) {
      lineItems.push({
        price_data: {
          currency: 'usd',
          product_data: {
            name: `Discount${appliedCouponCode ? ` (${appliedCouponCode})` : ''}`,
          },
          unit_amount: -discountCents,
        },
        quantity: 1,
      });
    }

    const stripeSession = await stripe.checkout.sessions.create({
      mode: 'payment',
      payment_method_types: ['card'],
      line_items: lineItems,
      client_reference_id: order._id.toString(),
      customer_email: session.email,
      success_url: `${APP_URL}/order/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${APP_URL}/order/cancel`,
      metadata: {
        orderId: order._id.toString(),
      },
    });

    if (!stripeSession.url) {
      return errorResponse('Failed to create checkout session', 500);
    }

    return successResponse({
      url: stripeSession.url,
      sessionId: stripeSession.id,
      orderId: order._id.toString(),
    });
  } catch (err) {
    console.error('Checkout error:', err);
    return serverErrorResponse();
  }
}
