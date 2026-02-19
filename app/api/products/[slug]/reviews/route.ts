import { NextRequest } from 'next/server';
import { z } from 'zod';
import mongoose from 'mongoose';
import connectDB from '@/lib/db';
import Product from '@/models/Product';
import Order from '@/models/Order';
import User from '@/models/User';
import { getSession } from '@/lib/auth';
import {
  successResponse,
  errorResponse,
  unauthorizedResponse,
  notFoundResponse,
  forbiddenResponse,
  serverErrorResponse,
} from '@/lib/api-response';

const AddReviewSchema = z.object({
  rating: z.number().int().min(1, 'Rating must be 1–5').max(5),
  comment: z.string().min(1, 'Comment is required').max(1000, 'Comment too long').trim(),
});

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const session = await getSession();
    if (!session) return unauthorizedResponse();

    const { slug } = await params;
    const body = await request.json();
    const parsed = AddReviewSchema.safeParse(body);
    if (!parsed.success) {
      const msg = parsed.error.errors.map((e) => e.message).join('. ');
      return errorResponse(msg, 400);
    }

    const { rating, comment } = parsed.data;

    await connectDB();

    const product = await Product.findOne({ slug });
    if (!product) return notFoundResponse('Product not found');

    const hasPurchased = await Order.exists({
      user: session.userId,
      isPaid: true,
      'items.product': product._id,
    });
    if (!hasPurchased) {
      return forbiddenResponse('Only verified buyers can leave a review. Purchase this product first.');
    }

    const existingReviewIndex = product.reviews?.findIndex(
      (r) => r.user.toString() === session.userId
    );
    if (existingReviewIndex !== undefined && existingReviewIndex >= 0) {
      return errorResponse('You have already reviewed this product.', 400);
    }

    const user = await User.findById(session.userId).select('name').lean();
    const userName = user?.name ?? 'Customer';

    product.reviews = product.reviews ?? [];
    product.reviews.push({
      user: new mongoose.Types.ObjectId(session.userId),
      userName,
      rating,
      comment,
      createdAt: new Date(),
    });

    const sum = product.reviews.reduce((acc, r) => acc + r.rating, 0);
    product.averageRating = Math.round((sum / product.reviews.length) * 10) / 10;
    product.reviewCount = product.reviews.length;
    await product.save();

    const added = product.reviews[product.reviews.length - 1];
    return successResponse(
      {
        review: {
          _id: added._id,
          user: added.user,
          userName: added.userName ?? userName,
          rating: added.rating,
          comment: added.comment,
          createdAt: added.createdAt,
        },
        averageRating: product.averageRating,
        reviewCount: product.reviewCount,
      },
      201
    );
  } catch (err) {
    console.error('Add review error:', err);
    return serverErrorResponse();
  }
}
