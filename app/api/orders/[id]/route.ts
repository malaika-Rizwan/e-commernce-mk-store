import { NextRequest } from 'next/server';
import connectDB from '@/lib/db';
import Order from '@/models/Order';
import { getSession } from '@/lib/auth';
import {
  successResponse,
  unauthorizedResponse,
  notFoundResponse,
  serverErrorResponse,
} from '@/lib/api-response';

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getSession();
    if (!session) return unauthorizedResponse();

    const { id } = await params;
    await connectDB();

    const order = await Order.findOne({
      _id: id,
      user: session.userId,
    }).lean();

    if (!order) return notFoundResponse('Order not found');

    return successResponse(order);
  } catch (err) {
    console.error('Order get error:', err);
    return serverErrorResponse();
  }
}
