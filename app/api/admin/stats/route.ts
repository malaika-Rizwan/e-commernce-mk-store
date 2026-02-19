import connectDB from '@/lib/db';
import User from '@/models/User';
import Product from '@/models/Product';
import Order from '@/models/Order';
import Contact from '@/models/Contact';
import { successResponse, serverErrorResponse } from '@/lib/api-response';

const MONTHS = 12;

export async function GET() {
  try {
    await connectDB();

    const now = new Date();
    const startOfThisMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const endOfThisMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999);

    const [
      totalUsers,
      totalProducts,
      totalOrders,
      totalRevenue,
      monthlyData,
      totalMessages,
      newMessages,
      repliedMessages,
      messagesThisMonth,
    ] = await Promise.all([
      User.countDocuments(),
      Product.countDocuments(),
      Order.countDocuments(),
      Order.aggregate([
        { $match: { isPaid: true } },
        { $group: { _id: null, total: { $sum: '$totalPrice' } } },
      ]).then((r) => (r[0]?.total ?? 0) as number),
      getMonthlySales(MONTHS),
      Contact.countDocuments(),
      Contact.countDocuments({ status: 'new' }),
      Contact.countDocuments({ status: 'replied' }),
      Contact.countDocuments({
        createdAt: { $gte: startOfThisMonth, $lte: endOfThisMonth },
      }),
    ]);

    return successResponse({
      totalUsers,
      totalProducts,
      totalOrders,
      totalRevenue: Math.round(totalRevenue * 100) / 100,
      monthlySales: monthlyData,
      contactStats: {
        totalMessages,
        newMessages,
        repliedMessages,
        messagesThisMonth,
      },
    });
  } catch (err) {
    console.error('Admin stats error:', err);
    return serverErrorResponse();
  }
}

async function getMonthlySales(months: number): Promise<Array<{ month: string; revenue: number; orders: number }>> {
  const result: Array<{ month: string; revenue: number; orders: number }> = [];
  const now = new Date();

  for (let i = months - 1; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const next = new Date(d.getFullYear(), d.getMonth() + 1, 1);
    const label = d.toLocaleDateString('en-US', { month: 'short', year: '2-digit' });

    const [revenue, orders] = await Promise.all([
      Order.aggregate([
        {
          $match: {
            isPaid: true,
            paidAt: { $gte: d, $lt: next },
          },
        },
        { $group: { _id: null, total: { $sum: '$totalPrice' } } },
      ]).then((r) => (r[0]?.total ?? 0) as number),
      Order.countDocuments({
        createdAt: { $gte: d, $lt: next },
      }),
    ]);

    result.push({
      month: label,
      revenue: Math.round(revenue * 100) / 100,
      orders,
    });
  }

  return result;
}
