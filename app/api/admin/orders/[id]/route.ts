import { NextRequest } from 'next/server';
import connectDB from '@/lib/db';
import Order from '@/models/Order';
import {
  successResponse,
  errorResponse,
  notFoundResponse,
  serverErrorResponse,
} from '@/lib/api-response';
import { z } from 'zod';

const UpdateOrderSchema = z.object({
  isDelivered: z.boolean().optional(),
  status: z.enum(['pending', 'shipped', 'delivered', 'cancelled']).optional(),
});

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    await connectDB();

    const order = await Order.findById(id)
      .populate('user', 'email name')
      .lean();

    if (!order) return notFoundResponse('Order not found');

    return successResponse(order);
  } catch (err) {
    console.error('Admin order get error:', err);
    return serverErrorResponse();
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const parsed = UpdateOrderSchema.safeParse(body);

    if (!parsed.success) {
      return errorResponse('Invalid payload', 400);
    }

    await connectDB();

    const order = await Order.findById(id);
    if (!order) return notFoundResponse('Order not found');

    if (parsed.data.status !== undefined) {
      order.status = parsed.data.status;
      if (parsed.data.status === 'delivered') {
        order.isDelivered = true;
        order.deliveredAt = new Date();
      } else {
        order.isDelivered = false;
        order.deliveredAt = undefined;
      }
    }
    if (parsed.data.isDelivered === true) {
      order.isDelivered = true;
      order.deliveredAt = new Date();
      order.status = 'delivered';
    }
    await order.save();

    return successResponse(order);
  } catch (err) {
    console.error('Admin order update error:', err);
    return serverErrorResponse();
  }
}
