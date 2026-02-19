import { NextRequest } from 'next/server';
import { enable2FA } from '@/controllers/authController';

export async function POST(request: NextRequest) {
  return enable2FA(request);
}
