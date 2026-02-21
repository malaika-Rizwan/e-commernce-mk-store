import { NextRequest } from 'next/server';
import mongoose from 'mongoose';
import connectDB from '@/lib/db';
import User from '@/models/User';
import { getSession } from '@/lib/auth';
import {
  successResponse,
  errorResponse,
  unauthorizedResponse,
  serverErrorResponse,
  notFoundResponse,
} from '@/lib/api-response';
import { addressUpdateSchema } from '@/lib/validations/address';

interface RouteParams {
  params: Promise<{ id: string }>;
}

export async function PATCH(request: NextRequest, { params }: RouteParams) {
  try {
    const session = await getSession();
    if (!session) return unauthorizedResponse();

    const { id } = await params;
    if (!id || !mongoose.Types.ObjectId.isValid(id)) {
      return errorResponse('Invalid address ID', 400);
    }

    const body = await request.json();
    const parsed = addressUpdateSchema.safeParse(body);
    if (!parsed.success) {
      const msg = parsed.error.errors.map((e) => e.message).join('. ');
      return errorResponse(msg, 400);
    }

    await connectDB();
    const user = await User.findById(session.userId);
    if (!user) return unauthorizedResponse();

    const subdoc = user.addresses?.find((a) => a._id?.toString() === id);
    if (!subdoc) return notFoundResponse('Address not found');

    const data = parsed.data;
    if (data.fullName !== undefined) (subdoc as { fullName: string }).fullName = data.fullName.trim();
    if (data.phone !== undefined) (subdoc as { phone: string }).phone = data.phone.trim();
    if (data.address !== undefined) (subdoc as { address: string }).address = data.address.trim();
    if (data.city !== undefined) (subdoc as { city: string }).city = data.city.trim();
    if (data.postalCode !== undefined) (subdoc as { postalCode: string }).postalCode = data.postalCode.trim();
    if (data.country !== undefined) (subdoc as { country: string }).country = data.country.trim();
    if (data.isDefault === true) {
      user.addresses?.forEach((a) => {
        (a as { isDefault?: boolean }).isDefault = false;
      });
      (subdoc as { isDefault?: boolean }).isDefault = true;
    }

    await user.save();

    const updated = user.addresses?.find((a) => a._id?.toString() === id);
    return successResponse({
      _id: (updated as { _id?: { toString: () => string } })?._id?.toString(),
      fullName: (updated as { fullName: string })?.fullName,
      phone: (updated as { phone: string })?.phone,
      address: (updated as { address: string })?.address,
      city: (updated as { city: string })?.city,
      postalCode: (updated as { postalCode: string })?.postalCode,
      country: (updated as { country: string })?.country,
      isDefault: (updated as { isDefault?: boolean })?.isDefault ?? false,
    });
  } catch (err) {
    console.error('Address PATCH error:', err);
    return serverErrorResponse();
  }
}

export async function DELETE(_request: NextRequest, { params }: RouteParams) {
  try {
    const session = await getSession();
    if (!session) return unauthorizedResponse();

    const { id } = await params;
    if (!id || !mongoose.Types.ObjectId.isValid(id)) {
      return errorResponse('Invalid address ID', 400);
    }

    await connectDB();
    const user = await User.findById(session.userId);
    if (!user) return unauthorizedResponse();

    const subdoc = user.addresses?.find((a) => a._id?.toString() === id);
    if (!subdoc) return notFoundResponse('Address not found');

    (user.addresses as unknown as mongoose.Types.DocumentArray<mongoose.Types.Subdocument>).pull(id);
    await user.save();

    return successResponse({ message: 'Address deleted' });
  } catch (err) {
    console.error('Address DELETE error:', err);
    return serverErrorResponse();
  }
}
