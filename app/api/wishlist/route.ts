import { NextRequest } from 'next/server';
import connectDB from '@/lib/db';
import Wishlist from '@/models/Wishlist';
import Product from '@/models/Product';
import { getSession } from '@/lib/auth';
import {
  successResponse,
  errorResponse,
  unauthorizedResponse,
  serverErrorResponse,
} from '@/lib/api-response';

export async function GET() {
  try {
    const session = await getSession();
    if (!session) return unauthorizedResponse();

    await connectDB();
    const items = await Wishlist.find({ user: session.userId })
      .populate('product', 'name slug price compareAtPrice images category averageRating reviewCount')
      .sort({ createdAt: -1 })
      .lean();

    const products = items
      .map((i) => (i as { product: unknown }).product)
      .filter(Boolean);

    return successResponse({ products });
  } catch (err) {
    console.error('Wishlist GET error:', err);
    return serverErrorResponse();
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getSession();
    if (!session) return unauthorizedResponse();

    const body = await request.json();
    const productId = typeof body?.productId === 'string' ? body.productId.trim() : null;
    if (!productId) return errorResponse('productId is required', 400);

    await connectDB();
    const product = await Product.findById(productId).select('_id').lean();
    if (!product) return errorResponse('Product not found', 404);

    await Wishlist.findOneAndUpdate(
      { user: session.userId, product: productId },
      { $setOnInsert: { user: session.userId, product: productId } },
      { upsert: true, new: true }
    );

    return successResponse({ added: true });
  } catch (err) {
    console.error('Wishlist POST error:', err);
    return serverErrorResponse();
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const session = await getSession();
    if (!session) return unauthorizedResponse();

    const productId = request.nextUrl.searchParams.get('productId');
    if (!productId) return errorResponse('productId is required', 400);

    await connectDB();
    await Wishlist.deleteOne({ user: session.userId, product: productId });

    return successResponse({ removed: true });
  } catch (err) {
    console.error('Wishlist DELETE error:', err);
    return serverErrorResponse();
  }
}
