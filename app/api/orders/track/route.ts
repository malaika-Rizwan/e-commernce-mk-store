import { NextRequest } from 'next/server';
import connectDB from '@/lib/db';
import Order from '@/models/Order';
import { successResponse, errorResponse, notFoundResponse, serverErrorResponse } from '@/lib/api-response';

export const dynamic = 'force-dynamic';

/** Public: get order tracking info by tracking number. No auth. */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const tracking = searchParams.get('tracking')?.trim();
    if (!tracking) {
      return errorResponse('Tracking number is required', 400);
    }

    await connectDB();
    const order = await Order.findOne({
      trackingNumber: new RegExp(`^${tracking.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}$`, 'i'),
    })
      .select('orderId trackingNumber orderStatus estimatedDelivery createdAt items shippingAddress totalPrice')
      .lean();

    if (!order) {
      return notFoundResponse('Order not found for this tracking number');
    }

    return successResponse({
      orderId: order.orderId,
      trackingNumber: order.trackingNumber,
      orderStatus: order.orderStatus ?? 'Processing',
      estimatedDelivery: order.estimatedDelivery,
      createdAt: order.createdAt,
      items: (order.items ?? []).map((i: { name: string; quantity: number; price: number }) => ({
        name: i.name,
        quantity: i.quantity,
        price: i.price,
      })),
      shippingAddress: order.shippingAddress,
      totalPrice: order.totalPrice,
    });
  } catch (err) {
    console.error('Track order error:', err);
    return serverErrorResponse();
  }
}
