import { NextRequest } from 'next/server';
import { verifyTwoFactor } from '@/controllers/authController';
import { rateLimit, getClientIdentifier } from '@/lib/rate-limit';

export async function POST(request: NextRequest) {
  const id = getClientIdentifier(request);
  const { success } = rateLimit(id, 'auth:verify2fa', { windowMs: 60 * 1000, max: 10 });
  if (!success) {
    return new Response(
      JSON.stringify({ success: false, error: 'Too many attempts. Try again later.' }),
      { status: 429, headers: { 'Content-Type': 'application/json' } }
    );
  }
  return verifyTwoFactor(request);
}
