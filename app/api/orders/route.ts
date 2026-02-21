import { NextRequest } from 'next/server';
import { z } from 'zod';
import mongoose from 'mongoose';
import connectDB from '@/lib/db';
import Order, { assignOrderIds } from '@/models/Order';
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
      productId: z.string().min(1, 'Product ID is required'),
      quantity: z.number().min(1, 'Quantity must be at least 1'),
    })
  ).min(1, 'Cart is empty'),
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

    await connectDB();

    const body = await request.json();
    console.log('Orders POST body:', JSON.stringify({ ...body, items: body?.items?.length ?? 0 }));
    const parsed = CreateOrderSchema.safeParse(body);
    if (!parsed.success) {
      const msg = parsed.error.errors.map((e) => e.message).join(', ');
      return errorResponse(msg, 400);
    }

    const { items, shippingAddress, paymentMethod } = parsed.data;

    const orderItems: Array<{
      product: string;
      name: string;
      quantity: number;
      price: number;
      image?: string;
    }> = [];
    let itemsPrice = 0;
    const unavailableIds: string[] = [];

    for (const item of items) {
      if (!item.productId?.trim()) {
        return errorResponse('Product ID missing', 400);
      }
      const productId = item.productId.trim();
      if (!mongoose.Types.ObjectId.isValid(productId)) {
        return errorResponse(`Invalid product ID: ${productId}`, 400);
      }

      const product = await Product.findById(productId).lean();
      if (!product) {
        unavailableIds.push(productId);
        continue;
      }
      if (product.stock < item.quantity) {
        return errorResponse(`Insufficient stock for ${product.name}. Available: ${product.stock}`, 400);
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

    if (unavailableIds.length > 0) {
      return new Response(
        JSON.stringify({
          success: false,
          error: 'Some products are no longer available. Please remove them from your cart and try again.',
          unavailableProductIds: unavailableIds,
        }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    if (orderItems.length === 0) {
      return errorResponse('No valid items to order', 400);
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
      orderStatus: 'Processing',
    });
    await assignOrderIds(order);
    await order.save();

    return successResponse(order, 201);
  } catch (err) {
    console.error('Order create error:', err);
    return serverErrorResponse();
  }
}
