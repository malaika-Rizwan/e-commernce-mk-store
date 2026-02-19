import { NextRequest } from 'next/server';
import connectDB from '@/lib/db';
import Order from '@/models/Order';
import { successResponse, serverErrorResponse } from '@/lib/api-response';

export async function GET(request: NextRequest) {
  try {
    await connectDB();

    const { searchParams } = new URL(request.url);
    const period = searchParams.get('period'); // all | month | week

    const dateFilter: Record<string, unknown> = {};
    if (period === 'month') {
      const start = new Date();
      start.setMonth(start.getMonth() - 1);
      dateFilter.createdAt = { $gte: start };
    } else if (period === 'week') {
      const start = new Date();
      start.setDate(start.getDate() - 7);
      dateFilter.createdAt = { $gte: start };
    }

    const paidFilter = { isPaid: true, ...dateFilter };

    const [totalRevenue, totalOrders, paidOrders, deliveredOrders] = await Promise.all([
      Order.aggregate([
        { $match: paidFilter },
        { $group: { _id: null, total: { $sum: '$totalPrice' } } },
      ]).then((r) => (r[0]?.total ?? 0) as number),
      Order.countDocuments(dateFilter),
      Order.countDocuments(paidFilter),
      Order.countDocuments({ isDelivered: true, ...dateFilter }),
    ]);

    return successResponse({
      totalRevenue: Math.round(totalRevenue * 100) / 100,
      totalOrders,
      paidOrders,
      deliveredOrders,
    });
  } catch (err) {
    console.error('Admin orders stats error:', err);
    return serverErrorResponse();
  }
}
