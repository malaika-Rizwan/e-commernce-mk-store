import { NextRequest } from 'next/server';
import { z } from 'zod';
import connectDB from '@/lib/db';
import Order from '@/models/Order';
import Product from '@/models/Product';
import { getSession } from '@/lib/auth';
import {
  successResponse,
  errorResponse,
  unauthorizedResponse,
  serverErrorResponse,
} from '@/lib/api-response';

const CreateOrderSchema = z.object({
  items: z.array(
    z.object({
      productId: z.string(),
      quantity: z.number().min(1),
    })
  ),
  shippingAddress: z.object({
    fullName: z.string().min(1),
    address: z.string().min(1),
    city: z.string().min(1),
    postalCode: z.string().min(1),
    country: z.string().min(1),
    phone: z.string().optional(),
  }),
  paymentMethod: z.string().default('stripe'),
});

export async function GET(request: NextRequest) {
  try {
    const session = await getSession();
    if (!session) return unauthorizedResponse();

    await connectDB();

    const { searchParams } = new URL(request.url);
    const page = Math.max(1, parseInt(searchParams.get('page') ?? '1', 10));
    const limit = Math.min(20, Math.max(1, parseInt(searchParams.get('limit') ?? '10', 10)));
    const skip = (page - 1) * limit;

    const [orders, total] = await Promise.all([
      Order.find({ user: session.userId })
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      Order.countDocuments({ user: session.userId }),
    ]);

    return successResponse({
      orders,
      pagination: { page, limit, total, pages: Math.ceil(total / limit) },
    });
  } catch (err) {
    console.error('Orders list error:', err);
    return serverErrorResponse();
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getSession();
    if (!session) return unauthorizedResponse();

    const body = await request.json();
    const parsed = CreateOrderSchema.safeParse(body);
    if (!parsed.success) {
      const msg = parsed.error.errors.map((e) => e.message).join(', ');
      return errorResponse(msg, 400);
    }

    const { items, shippingAddress, paymentMethod } = parsed.data;

    await connectDB();

    const orderItems: Array<{
      product: string;
      name: string;
      quantity: number;
      price: number;
      image?: string;
    }> = [];
    let itemsPrice = 0;

    for (const item of items) {
      const product = await Product.findById(item.productId).lean();
      if (!product) {
        return errorResponse(`Product not found: ${item.productId}`, 400);
      }
      if (product.stock < item.quantity) {
        return errorResponse(`Insufficient stock for ${product.name}`, 400);
      }
      const linePrice = product.price * item.quantity;
      itemsPrice += linePrice;
      orderItems.push({
        product: product._id.toString(),
        name: product.name,
        quantity: item.quantity,
        price: product.price,
        image: typeof product.images?.[0] === 'string' ? product.images[0] : product.images?.[0]?.url,
      });
    }

    const shippingPrice = itemsPrice > 100 ? 0 : 10;
    const taxPrice = Math.round(itemsPrice * 0.1 * 100) / 100;
    const totalPrice = itemsPrice + shippingPrice + taxPrice;

    const order = await Order.create({
      user: session.userId,
      items: orderItems,
      shippingAddress,
      paymentMethod,
      itemsPrice,
      shippingPrice,
      taxPrice,
      totalPrice,
      isPaid: false,
      isDelivered: false,
    });

    return successResponse(order, 201);
  } catch (err) {
    console.error('Order create error:', err);
    return serverErrorResponse();
  }
}
