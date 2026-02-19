import { NextRequest } from 'next/server';
import connectDB from '@/lib/db';
import Coupon from '@/models/Coupon';
import { successResponse, errorResponse, serverErrorResponse } from '@/lib/api-response';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const code = typeof body?.code === 'string' ? body.code.trim().toUpperCase() : '';
    const subtotal = typeof body?.subtotal === 'number' ? body.subtotal : 0;

    if (!code) {
      return errorResponse('Coupon code is required', 400);
    }

    await connectDB();
    const coupon = await Coupon.findOne({ code }).lean();
    if (!coupon) {
      return successResponse({
        valid: false,
        message: 'Invalid coupon code',
        discount: 0,
      });
    }

    if (coupon.expiresAt && new Date() > new Date(coupon.expiresAt)) {
      return successResponse({
        valid: false,
        message: 'This coupon has expired',
        discount: 0,
      });
    }

    if (coupon.maxUses != null && coupon.usedCount >= coupon.maxUses) {
      return successResponse({
        valid: false,
        message: 'This coupon has reached its usage limit',
        discount: 0,
      });
    }

    if (coupon.minOrder != null && subtotal < coupon.minOrder) {
      return successResponse({
        valid: false,
        message: `Minimum order amount is $${coupon.minOrder.toFixed(2)}`,
        discount: 0,
      });
    }

    let discount = 0;
    if (coupon.type === 'percent') {
      discount = Math.round((subtotal * Math.min(coupon.value, 100) / 100) * 100) / 100;
    } else {
      discount = Math.min(coupon.value, subtotal);
      discount = Math.round(discount * 100) / 100;
    }

    return successResponse({
      valid: true,
      message: 'Coupon applied',
      discount,
      code: coupon.code,
    });
  } catch (err) {
    console.error('Coupon validate error:', err);
    return serverErrorResponse();
  }
}
