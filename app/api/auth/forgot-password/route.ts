import { NextRequest } from 'next/server';
import { forgotPassword as forgotPasswordHandler } from '@/controllers/authController';

export async function POST(request: NextRequest) {
  return forgotPasswordHandler(request);
}
