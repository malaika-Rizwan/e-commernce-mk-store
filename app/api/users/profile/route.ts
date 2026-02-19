import { NextRequest } from 'next/server';
import connectDB from '@/lib/db';
import User from '@/models/User';
import { getSession } from '@/lib/auth';
import {
  successResponse,
  errorResponse,
  unauthorizedResponse,
  serverErrorResponse,
} from '@/lib/api-response';
import { z } from 'zod';

const updateProfileSchema = z.object({
  name: z.string().min(1, 'Name is required').max(100).trim().optional(),
  phone: z.string().max(20).trim().optional().nullable(),
  address: z
    .object({
      street: z.string().max(200).optional(),
      city: z.string().max(100).optional(),
      state: z.string().max(100).optional(),
      postalCode: z.string().max(20).optional(),
      country: z.string().max(100).optional(),
    })
    .optional()
    .nullable(),
  avatar: z.string().url().optional().nullable(),
});

const changePasswordSchema = z.object({
  currentPassword: z.string().min(1, 'Current password is required'),
  newPassword: z.string().min(6, 'New password must be at least 6 characters').max(128),
});

export async function GET() {
  try {
    const session = await getSession();
    if (!session) return unauthorizedResponse();

    await connectDB();
    const user = await User.findById(session.userId)
      .select('name email role avatar phone address createdAt')
      .lean();
    if (!user) return unauthorizedResponse();

    return successResponse({
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      avatar: user.avatar,
      phone: user.phone,
      address: user.address,
      createdAt: user.createdAt,
    });
  } catch (err) {
    console.error('Profile GET error:', err);
    return serverErrorResponse();
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const session = await getSession();
    if (!session) return unauthorizedResponse();

    const body = await request.json();

    if (body.currentPassword !== undefined || body.newPassword !== undefined) {
      const parsed = changePasswordSchema.safeParse({
        currentPassword: body.currentPassword,
        newPassword: body.newPassword,
      });
      if (!parsed.success) {
        const msg = parsed.error.errors.map((e) => e.message).join('. ');
        return errorResponse(msg, 400);
      }
      const { currentPassword, newPassword } = parsed.data;
      await connectDB();
      const user = await User.findById(session.userId).select('+password');
      if (!user) return unauthorizedResponse();
      const valid = await user.comparePassword(currentPassword);
      if (!valid) return errorResponse('Current password is incorrect', 401);
      user.password = newPassword;
      await user.save();
      return successResponse({ message: 'Password updated successfully' });
    }

    const parsed = updateProfileSchema.safeParse(body);
    if (!parsed.success) {
      const msg = parsed.error.errors.map((e) => e.message).join('. ');
      return errorResponse(msg, 400);
    }

    await connectDB();
    const user = await User.findById(session.userId);
    if (!user) return unauthorizedResponse();

    if (parsed.data.name !== undefined) user.name = parsed.data.name;
    if (parsed.data.phone !== undefined) user.phone = parsed.data.phone ?? undefined;
    if (parsed.data.address !== undefined) {
      user.address = parsed.data.address
        ? {
            street: parsed.data.address.street,
            city: parsed.data.address.city,
            state: parsed.data.address.state,
            postalCode: parsed.data.address.postalCode,
            country: parsed.data.address.country,
          }
        : undefined;
    }
    if (parsed.data.avatar !== undefined) user.avatar = parsed.data.avatar ?? undefined;
    await user.save();

    return successResponse({
      name: user.name,
      email: user.email,
      avatar: user.avatar,
      phone: user.phone,
      address: user.address,
    });
  } catch (err) {
    console.error('Profile PATCH error:', err);
    return serverErrorResponse();
  }
}
