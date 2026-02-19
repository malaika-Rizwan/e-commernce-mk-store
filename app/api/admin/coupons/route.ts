import { NextRequest } from 'next/server';
import connectDB from '@/lib/db';
import Coupon from '@/models/Coupon';
import { getSession } from '@/lib/auth';
import {
  successResponse,
  errorResponse,
  unauthorizedResponse,
  serverErrorResponse,
} from '@/lib/api-response';

const createCouponSchema = {
  code: (v: unknown) => typeof v === 'string' && v.trim().length > 0,
  type: (v: unknown) => v === 'percent' || v === 'fixed',
  value: (v: unknown) => typeof v === 'number' && v >= 0,
  minOrder: (v: unknown) => v == null || (typeof v === 'number' && v >= 0),
  maxUses: (v: unknown) => v == null || (typeof v === 'number' && v >= 0),
  expiresAt: (v: unknown) => v == null || (typeof v === 'string' && !isNaN(Date.parse(v))),
};

export async function POST(request: NextRequest) {
  try {
    const session = await getSession();
    if (!session || session.role !== 'admin') return unauthorizedResponse();

    const body = await request.json();
    const code = typeof body?.code === 'string' ? body.code.trim().toUpperCase() : '';
    if (!createCouponSchema.code(code)) return errorResponse('Valid code is required', 400);
    if (!createCouponSchema.type(body?.type)) return errorResponse('type must be percent or fixed', 400);
    if (!createCouponSchema.value(body?.value)) return errorResponse('value must be a non-negative number', 400);
    if (body?.type === 'percent' && body?.value > 100) return errorResponse('Percent value cannot exceed 100', 400);
    if (!createCouponSchema.minOrder(body?.minOrder)) return errorResponse('Invalid minOrder', 400);
    if (!createCouponSchema.maxUses(body?.maxUses)) return errorResponse('Invalid maxUses', 400);
    if (!createCouponSchema.expiresAt(body?.expiresAt)) return errorResponse('Invalid expiresAt', 400);

    await connectDB();
    const existing = await Coupon.findOne({ code }).lean();
    if (existing) return errorResponse('Coupon code already exists', 400);

    const coupon = await Coupon.create({
      code,
      type: body.type,
      value: body.value,
      minOrder: body.minOrder ?? undefined,
      maxUses: body.maxUses ?? undefined,
      expiresAt: body.expiresAt ? new Date(body.expiresAt) : undefined,
    });

    return successResponse({
      coupon: {
        _id: coupon._id,
        code: coupon.code,
        type: coupon.type,
        value: coupon.value,
        minOrder: coupon.minOrder,
        maxUses: coupon.maxUses,
        expiresAt: coupon.expiresAt,
      },
    });
  } catch (err) {
    console.error('Admin create coupon error:', err);
    return serverErrorResponse();
  }
}
