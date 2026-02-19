import { NextRequest } from 'next/server';
import { disable2FA } from '@/controllers/authController';

export async function POST(request: NextRequest) {
  return disable2FA(request);
}
