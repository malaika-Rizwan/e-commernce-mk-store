/**
 * Shared gateway callback logic: verify status, mark order paid, update stock, send emails.
 * Used by /api/payments/<gateway>/callback routes.
 */
import connectDB from '@/lib/db';
import Order, { assignOrderIds } from '@/models/Order';
import Product from '@/models/Product';
import Coupon from '@/models/Coupon';
import User from '@/models/User';
import { sendOrderConfirmation, sendAdminNewOrderAlert } from '@/lib/nodemailer';

const SUCCESS_STATUSES = [
  'success',
  'completed',
  'paid',
  'PAID',
  'SUCCESS',
  '1',
  'true',
  '000',
  '00',
];

export function isSuccessStatus(status: string | null): boolean {
  if (status == null) return false;
  return SUCCESS_STATUSES.includes(String(status).toLowerCase().trim());
}

export function getTransactionId(params: Record<string, string | null>): string {
  return (
    params.transactionId ??
    params.transaction_id ??
    params.ref ??
    params.payment_id ??
    params.paymentId ??
    params.pp_TxnRef ??
    params.pp_RefID ??
    ''
  );
}

export function getOrderId(params: Record<string, string | null>): string | null {
  return (
    params.orderId ??
    params.order_id ??
    params.merchantOrderId ??
    params.pp_BillReference ??
    null
  );
}

export function getStatusParam(params: Record<string, string | null>): string | null {
  return (
    params.status ??
    params.Status ??
    params.payment_status ??
    params.pp_ResponseCode ??
    params.response_code ??
    null
  );
}

export interface HandleCallbackResult {
  success: boolean;
  redirectSuccess: string;
  redirectFailure: string;
}

const APP_URL = process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000';

export async function handleGatewayCallback(
  orderId: string | null,
  status: string | null,
  transactionId: string,
  paymentMethodLabel: string
): Promise<HandleCallbackResult> {
  const redirectSuccess = `${APP_URL}/order/success?order_id=${orderId}`;
  const redirectFailure = `${APP_URL}/order/cancel?reason=payment_failed`;
  const redirectNoOrder = `${APP_URL}/order/cancel?reason=order_not_found`;
  const redirectMissing = `${APP_URL}/order/cancel?reason=missing_order`;

  if (!orderId) {
    return { success: false, redirectSuccess: redirectMissing, redirectFailure: redirectMissing };
  }

  try {
    await connectDB();
    const order = await Order.findById(orderId);
    if (!order) {
      return { success: false, redirectSuccess: redirectNoOrder, redirectFailure: redirectNoOrder };
    }

    if (order.isPaid) {
      return { success: true, redirectSuccess: `${APP_URL}/order/success?order_id=${orderId}`, redirectFailure };
    }

    if (!isSuccessStatus(status)) {
      return { success: false, redirectSuccess, redirectFailure };
    }

    if (!order.orderId) await assignOrderIds(order);
    order.isPaid = true;
    order.paidAt = new Date();
    order.paymentResult = {
      id: transactionId,
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
    const displayOrderId = order.orderId ?? order._id.toString();
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
        paymentMethod: paymentMethodLabel,
        orderTime: order.createdAt ?? new Date(),
        shippingAddress: order.shippingAddress,
      });
    } catch (e) {
      console.error('Admin new order alert failed:', e);
    }

    return { success: true, redirectSuccess: `${APP_URL}/order/success?order_id=${orderId}`, redirectFailure };
  } catch (e) {
    console.error('Gateway callback error:', e);
    return { success: false, redirectSuccess, redirectFailure };
  }
}
