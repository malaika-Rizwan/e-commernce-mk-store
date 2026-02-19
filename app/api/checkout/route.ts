import { NextRequest } from 'next/server';
import connectDB from '@/lib/db';
import Order from '@/models/Order';
import Product from '@/models/Product';
import Coupon from '@/models/Coupon';
import { getSession } from '@/lib/auth';
import { rateLimit, getClientIdentifier } from '@/lib/rate-limit';
import { stripe, formatAmountForStripe } from '@/lib/stripe';
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
    const { success, remaining, resetAt } = rateLimit(id, 'checkout', { windowMs: 60 * 1000, max: 10 });
    if (!success) {
      return new Response(
        JSON.stringify({ success: false, error: 'Too many checkout attempts. Try again later.' }),
        { status: 429, headers: { 'Content-Type': 'application/json', 'X-RateLimit-Remaining': String(remaining), 'Retry-After': String(Math.ceil((resetAt - Date.now()) / 1000)) } }
      );
    }
    const session = await getSession();
    if (!session) return unauthorizedResponse();

    const body = await request.json();
    const parsed = createCheckoutSessionSchema.safeParse(body);
    if (!parsed.success) {
      const msg = parsed.error.errors.map((e) => e.message).join('. ');
      return errorResponse(msg, 400);
    }

    const { shippingAddress, items: cartItems, couponCode } = parsed.data;

    await connectDB();

    let discountAmount = 0;
    let appliedCouponCode: string | undefined;
    if (couponCode?.trim()) {
      const coupon = await Coupon.findOne({ code: couponCode.trim().toUpperCase() }).lean();
      if (coupon) {
        const now = new Date();
        const valid =
          (!coupon.expiresAt || now <= new Date(coupon.expiresAt)) &&
          (coupon.maxUses == null || coupon.usedCount < coupon.maxUses);
        const subtotal = cartItems.reduce((sum, i) => sum + i.price * i.quantity, 0);
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

    const orderItems: Array<{
      product: string;
      name: string;
      quantity: number;
      price: number;
      image?: string;
    }> = [];
    let itemsPriceCents = 0;

    for (const item of cartItems) {
      const product = await Product.findById(item.productId).lean();
      if (!product) {
        return errorResponse(`Product not found: ${item.productId}`, 400);
      }
      if (product.stock < item.quantity) {
        return errorResponse(`Insufficient stock for ${product.name}`, 400);
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
    });

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
