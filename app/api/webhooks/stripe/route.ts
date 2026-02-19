import { NextRequest } from 'next/server';
import { headers } from 'next/headers';
import Stripe from 'stripe';
import connectDB from '@/lib/db';
import Order from '@/models/Order';
import Product from '@/models/Product';
import Coupon from '@/models/Coupon';
import User from '@/models/User';
import { stripe } from '@/lib/stripe';
import { sendOrderConfirmation, sendAdminNewOrderAlert } from '@/lib/nodemailer';

export async function POST(request: NextRequest) {
  const body = await request.text();
  const headersList = await headers();
  const signature = headersList.get('stripe-signature');

  if (!signature || !process.env.STRIPE_WEBHOOK_SECRET) {
    console.error('Stripe webhook: missing signature or STRIPE_WEBHOOK_SECRET');
    return new Response('Webhook error', { status: 400 });
  }

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET
    );
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    console.error('Stripe webhook signature verification failed:', message);
    return new Response(`Webhook Error: ${message}`, { status: 400 });
  }

  if (event.type === 'checkout.session.completed') {
    const session = event.data.object as Stripe.Checkout.Session;
    const orderId = session.client_reference_id ?? session.metadata?.orderId;

    if (!orderId) {
      console.error('Webhook: no orderId in session');
      return new Response(JSON.stringify({ received: true }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    try {
      await connectDB();

      const order = await Order.findById(orderId);
      if (!order) {
        console.error('Webhook: order not found', orderId);
        return new Response(JSON.stringify({ received: true }), {
          status: 200,
          headers: { 'Content-Type': 'application/json' },
        });
      }

      if (order.isPaid) {
        return new Response(JSON.stringify({ received: true }), {
          status: 200,
          headers: { 'Content-Type': 'application/json' },
        });
      }

      order.isPaid = true;
      order.paidAt = new Date();
      order.stripeSessionId = session.id;
      order.paymentResult = {
        id: typeof session.payment_intent === 'string' ? session.payment_intent : session.id,
        status: 'paid',
        email: session.customer_email ?? (session.customer_details as { email?: string } | null)?.email ?? undefined,
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

      const user = await User.findById(order.user).select('email name').lean();
      const email = session.customer_email ?? user?.email;
      if (email) {
        try {
          await sendOrderConfirmation({
            to: email,
            userName: user?.name ?? 'Customer',
            orderId: order._id.toString(),
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
          orderId: order._id.toString(),
          customerName: user?.name ?? 'Customer',
          customerEmail: user?.email ?? email ?? '',
          items: order.items.map((i) => ({ name: i.name, quantity: i.quantity, price: i.price })),
          totalPrice: order.totalPrice,
          paymentMethod: 'Stripe',
          orderTime: order.paidAt ?? order.createdAt ?? new Date(),
          shippingAddress: order.shippingAddress,
        });
      } catch (e) {
        console.error('Admin new order alert failed:', e);
      }
    } catch (e) {
      console.error('Webhook: failed to process checkout.session.completed', e);
      return new Response(
        JSON.stringify({ error: 'Processing failed' }),
        { status: 500, headers: { 'Content-Type': 'application/json' } }
      );
    }
  }

  return new Response(JSON.stringify({ received: true }), {
    status: 200,
    headers: { 'Content-Type': 'application/json' },
  });
}
