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
import { addressSchema } from '@/lib/validations/address';

export async function GET() {
  try {
    const session = await getSession();
    if (!session) return unauthorizedResponse();

    await connectDB();
    const user = await User.findById(session.userId).select('addresses').lean();
    if (!user) return unauthorizedResponse();

    const addresses = (user.addresses ?? []).map((a) => ({
      _id: (a as { _id?: { toString: () => string } })._id?.toString(),
      fullName: a.fullName,
      phone: a.phone,
      address: a.address,
      city: a.city,
      postalCode: a.postalCode,
      country: a.country,
      isDefault: a.isDefault ?? false,
    }));

    return successResponse({ addresses });
  } catch (err) {
    console.error('Addresses GET error:', err);
    return serverErrorResponse();
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getSession();
    if (!session) return unauthorizedResponse();

    const body = await request.json();
    const parsed = addressSchema.safeParse(body);
    if (!parsed.success) {
      const msg = parsed.error.errors.map((e) => e.message).join('. ');
      return errorResponse(msg, 400);
    }

    await connectDB();
    const user = await User.findById(session.userId);
    if (!user) return unauthorizedResponse();

    const { fullName, phone, address, city, postalCode, country, isDefault } = parsed.data;
    const newAddress = {
      fullName: fullName.trim(),
      phone: phone.trim(),
      address: address.trim(),
      city: city.trim(),
      postalCode: postalCode.trim(),
      country: country.trim(),
      isDefault: isDefault ?? false,
    };

    if (newAddress.isDefault && user.addresses && user.addresses.length > 0) {
      user.addresses.forEach((a) => {
        (a as { isDefault?: boolean }).isDefault = false;
      });
    }
    user.addresses = user.addresses ?? [];
    user.addresses.push(newAddress as never);
    await user.save();

    const added = user.addresses[user.addresses.length - 1];
    return successResponse(
      {
        _id: (added as { _id?: { toString: () => string } })._id?.toString(),
        fullName: (added as { fullName: string }).fullName,
        phone: (added as { phone: string }).phone,
        address: (added as { address: string }).address,
        city: (added as { city: string }).city,
        postalCode: (added as { postalCode: string }).postalCode,
        country: (added as { country: string }).country,
        isDefault: (added as { isDefault?: boolean }).isDefault ?? false,
      },
      201
    );
  } catch (err) {
    console.error('Addresses POST error:', err);
    return serverErrorResponse();
  }
}
