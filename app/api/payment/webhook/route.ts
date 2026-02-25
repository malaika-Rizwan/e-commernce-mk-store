/**
 * Safepay webhook – verify signature, update order payment status, send emails.
 * Configure this URL in Safepay dashboard. Never mark order paid without verification.
 */
import { NextRequest } from 'next/server';
import crypto from 'crypto';
import connectDB from '@/lib/db';
import Order from '@/models/Order';
import Product from '@/models/Product';
import Coupon from '@/models/Coupon';
import User from '@/models/User';
import { sendOrderConfirmation, sendAdminNewOrderAlert } from '@/lib/nodemailer';

export const dynamic = 'force-dynamic';

const SAFEPAY_SECRET = process.env.SAFEPAY_SECRET_KEY?.trim() || process.env.SAFEPAY_WEBHOOK_SECRET?.trim();

function verifySignature(rawBody: string, signature: string | null): boolean {
  if (!SAFEPAY_SECRET || !signature) return false;
  const expected = crypto
    .createHmac('sha256', SAFEPAY_SECRET)
    .update(rawBody)
    .digest('hex');
  return crypto.timingSafeEqual(Buffer.from(signature, 'hex'), Buffer.from(expected, 'hex'));
}

export async function POST(request: NextRequest) {
  let rawBody: string;
  try {
    rawBody = await request.text();
  } catch {
    return new Response('Bad request', { status: 400 });
  }

  const signature =
    request.headers.get('x-safepay-signature') ??
    request.headers.get('x-webhook-signature') ??
    request.headers.get('x-signature') ??
    null;

  if (SAFEPAY_SECRET && !verifySignature(rawBody, signature)) {
    return new Response('Invalid signature', { status: 401 });
  }

  let body: Record<string, unknown>;
  try {
    body = JSON.parse(rawBody) as Record<string, unknown>;
  } catch {
    return new Response('Invalid JSON', { status: 400 });
  }

  const orderId =
    (body.order_id as string) ??
    (body.orderId as string) ??
    (body.reference_id as string) ??
    (body.meta as { orderId?: string })?.orderId;
  const transactionId =
    (body.transaction_id as string) ??
    (body.transactionId as string) ??
    (body.payment_id as string) ??
    '';
  const status = String(
    body.status ?? body.payment_status ?? body.state ?? ''
  ).toLowerCase();

  if (!orderId) {
    return new Response('Missing order_id', { status: 400 });
  }

  try {
    await connectDB();
    const order = await Order.findById(orderId);
    if (!order) {
      return new Response('Order not found', { status: 404 });
    }

    if (order.isPaid) {
      return new Response('OK', { status: 200 });
    }

    const isPaid = ['paid', 'success', 'completed', '1', 'true', '000', '00'].includes(status);

    if (isPaid) {
      order.isPaid = true;
      order.paidAt = new Date();
      (order as { paymentStatus?: string }).paymentStatus = 'paid';
      (order as { transactionId?: string }).transactionId = transactionId || undefined;
      order.paymentResult = {
        id: transactionId || orderId,
        status: 'paid',
        email: undefined,
      };
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

      const orderUser = await User.findById(order.user).select('email name').lean();
      const email = orderUser?.email;
      const displayOrderId = (order as { orderId?: string }).orderId ?? order._id.toString();
      const estimatedDeliveryStr = order.estimatedDelivery?.toLocaleDateString('en-US', {
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
            items: order.items.map((i) => ({ name: i.name, quantity: i.quantity, price: i.price })),
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
          paymentMethod: 'Safepay',
          orderTime: order.createdAt ?? new Date(),
          shippingAddress: order.shippingAddress,
        });
      } catch (e) {
        console.error('Admin new order alert failed:', e);
      }
    } else {
      (order as { paymentStatus?: string }).paymentStatus = 'failed';
      await order.save();
    }

    return new Response('OK', { status: 200 });
  } catch (e) {
    console.error('Safepay webhook error:', e);
    return new Response('Internal error', { status: 500 });
  }
}
