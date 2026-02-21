import { NextRequest } from 'next/server';
import mongoose from 'mongoose';
import connectDB from '@/lib/db';
import Order, { assignOrderIds } from '@/models/Order';
import Product from '@/models/Product';
import Coupon from '@/models/Coupon';
import User from '@/models/User';
import { getSession } from '@/lib/auth';
import { rateLimit, getClientIdentifier } from '@/lib/rate-limit';
import {
  successResponse,
  errorResponse,
  unauthorizedResponse,
  serverErrorResponse,
} from '@/lib/api-response';
import { createCheckoutSessionSchema } from '@/lib/validations/checkout';
import { sendOrderConfirmation, sendAdminNewOrderAlert } from '@/lib/nodemailer';

const SHIPPING_FLAT = 10;
const FREE_SHIPPING_THRESHOLD = 100;
const TAX_RATE = 0.1;

export async function POST(request: NextRequest) {
  try {
    const id = getClientIdentifier(request);
    const { success, remaining, resetAt } = await rateLimit(id, 'checkout', {
      windowMs: 60 * 1000,
      max: 10,
    });
    if (!success) {
      return new Response(
        JSON.stringify({
          success: false,
          error: 'Too many requests. Try again later.',
        }),
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

    await connectDB();

    const body = await request.json();
    // Temporary debug – remove after testing
    console.log('Checkout body (COD):', JSON.stringify({ ...body, items: body?.items?.length ?? 0 }));

    const parsed = createCheckoutSessionSchema.safeParse(body);
    if (!parsed.success) {
      const msg = parsed.error.errors.map((e) => e.message).join('. ');
      return errorResponse(msg, 400);
    }

    const { shippingAddress, items: cartItems, couponCode } = parsed.data;
    console.log('Cart items (COD):', cartItems);

    const orderItems: Array<{
      product: string;
      name: string;
      quantity: number;
      price: number;
      image?: string;
    }> = [];
    let itemsPrice = 0;
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
        return errorResponse(
          `Insufficient stock for ${product.name}. Available: ${product.stock}`,
          400
        );
      }
      itemsPrice += product.price * item.quantity;
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
      const coupon = await Coupon.findOne({
        code: couponCode.trim().toUpperCase(),
      }).lean();
      if (coupon) {
        const now = new Date();
        const valid =
          (!coupon.expiresAt || now <= new Date(coupon.expiresAt)) &&
          (coupon.maxUses == null || coupon.usedCount < coupon.maxUses);
        const subtotal = itemsPrice;
        const minOk = coupon.minOrder == null || subtotal >= coupon.minOrder;
        if (valid && minOk) {
          if (coupon.type === 'percent') {
            discountAmount =
              Math.round(
                (subtotal * Math.min(coupon.value, 100)) / 100 * 100
              ) / 100;
          } else {
            discountAmount = Math.min(coupon.value, subtotal);
            discountAmount = Math.round(discountAmount * 100) / 100;
          }
          appliedCouponCode = coupon.code;
        }
      }
    }

    const subtotal = itemsPrice;
    const shipping =
      subtotal >= FREE_SHIPPING_THRESHOLD ? 0 : SHIPPING_FLAT;
    const tax = Math.round(subtotal * TAX_RATE * 100) / 100;
    const totalPrice = Math.max(
      0,
      Math.round((subtotal + shipping + tax - discountAmount) * 100) / 100
    );

    const order = await Order.create({
      user: session.userId,
      items: orderItems,
      shippingAddress,
      paymentMethod: 'cod',
      itemsPrice: subtotal,
      shippingPrice: shipping,
      taxPrice: tax,
      discountAmount: discountAmount > 0 ? discountAmount : undefined,
      couponCode: appliedCouponCode,
      totalPrice,
      isPaid: false,
      isDelivered: false,
      status: 'pending',
      orderStatus: 'Processing',
    });
    await assignOrderIds(order);
    await order.save();

    for (const item of order.items) {
      await Product.findByIdAndUpdate(item.product, {
        $inc: { stock: -item.quantity },
      });
    }

    if (order.couponCode) {
      await Coupon.findOneAndUpdate(
        { code: order.couponCode },
        { $inc: { usedCount: 1 } }
      );
    }

    const orderUser = await User.findById(order.user)
      .select('email name')
      .lean();
    const email = orderUser?.email;
    const displayOrderId = order.orderId ?? order._id.toString();
    const estimatedDeliveryStr =
      order.estimatedDelivery?.toLocaleDateString('en-US', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      });
    if (email) {
      try {
        await sendOrderConfirmation({
          to: email,
          userName: orderUser?.name ?? 'Customer',
          orderId: displayOrderId,
          trackingNumber: order.trackingNumber,
          estimatedDelivery: estimatedDeliveryStr,
          totalPrice: order.totalPrice,
          items: order.items.map((i) => ({
            name: i.name,
            quantity: i.quantity,
            price: i.price,
          })),
          shippingAddress: order.shippingAddress,
        });
      } catch (e) {
        console.error('Order confirmation email failed:', e);
      }
    }
    try {
      await sendAdminNewOrderAlert({
        orderId: displayOrderId,
        customerName: orderUser?.name ?? 'Customer',
        customerEmail: orderUser?.email ?? email ?? '',
        items: order.items.map((i) => ({ name: i.name, quantity: i.quantity, price: i.price })),
        totalPrice: order.totalPrice,
        paymentMethod: 'Cash on Delivery',
        orderTime: order.createdAt ?? new Date(),
        shippingAddress: order.shippingAddress,
      });
    } catch (e) {
      console.error('Admin new order alert failed:', e);
    }

    return successResponse({
      orderId: order._id.toString(),
      displayOrderId: displayOrderId,
      trackingNumber: order.trackingNumber,
      estimatedDelivery: order.estimatedDelivery,
    });
  } catch (err) {
    console.error('COD checkout error:', err);
    return serverErrorResponse();
  }
}
