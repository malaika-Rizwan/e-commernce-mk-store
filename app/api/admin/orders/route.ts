import { NextRequest } from 'next/server';
import connectDB from '@/lib/db';
import Order from '@/models/Order';
import {
  successResponse,
  serverErrorResponse,
} from '@/lib/api-response';

export async function GET(request: NextRequest) {
  try {
    await connectDB();

    const { searchParams } = new URL(request.url);
    const page = Math.max(1, parseInt(searchParams.get('page') ?? '1', 10));
    const limit = Math.min(50, Math.max(1, parseInt(searchParams.get('limit') ?? '20', 10)));
    const skip = (page - 1) * limit;
    const status = searchParams.get('status'); // pending | shipped | delivered | cancelled | paid (payment filter)

    const filter: Record<string, unknown> = {};
    if (status === 'pending' || status === 'shipped' || status === 'delivered' || status === 'cancelled') {
      filter.status = status;
    } else if (status === 'paid') {
      filter.isPaid = true;
    }

    const [orders, total] = await Promise.all([
      Order.find(filter)
        .populate('user', 'email name')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      Order.countDocuments(filter),
    ]);

    return successResponse({
      orders,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit) || 1,
      },
    });
  } catch (err) {
    console.error('Admin orders list error:', err);
    return serverErrorResponse();
  }
}
