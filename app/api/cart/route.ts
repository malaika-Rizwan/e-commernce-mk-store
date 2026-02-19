import { NextRequest } from 'next/server';
import { z } from 'zod';
import connectDB from '@/lib/db';
import Cart from '@/models/Cart';
import { getSession } from '@/lib/auth';
import {
  successResponse,
  unauthorizedResponse,
  errorResponse,
  serverErrorResponse,
} from '@/lib/api-response';

const cartItemSchema = z.object({
  productId: z.string(),
  slug: z.string().optional(),
  name: z.string(),
  quantity: z.number().int().min(1),
  price: z.number().min(0),
  image: z.string().optional(),
});

const saveCartSchema = z.object({
  items: z.array(cartItemSchema),
});

export async function GET() {
  try {
    const session = await getSession();
    if (!session) return unauthorizedResponse();

    await connectDB();
    const cart = await Cart.findOne({ user: session.userId }).lean();
    const items = cart?.items ?? [];

    return successResponse({ items });
  } catch (err) {
    console.error('Cart GET error:', err);
    return serverErrorResponse();
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getSession();
    if (!session) return unauthorizedResponse();

    const body = await request.json();
    const parsed = saveCartSchema.safeParse(body);
    if (!parsed.success) {
      return errorResponse('Invalid cart payload', 400);
    }

    await connectDB();
    await Cart.findOneAndUpdate(
      { user: session.userId },
      { items: parsed.data.items, updatedAt: new Date() },
      { upsert: true, new: true }
    );

    return successResponse({ message: 'Cart saved' });
  } catch (err) {
    console.error('Cart POST error:', err);
    return serverErrorResponse();
  }
}
