import { NextRequest } from 'next/server';
import { resetPassword as resetPasswordHandler } from '@/controllers/authController';

export async function POST(request: NextRequest) {
  return resetPasswordHandler(request);
}
