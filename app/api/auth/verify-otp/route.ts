import { NextRequest } from 'next/server';
import { verifyOtp } from '@/controllers/authController';
import { rateLimit, getClientIdentifier } from '@/lib/rate-limit';

export async function POST(request: NextRequest) {
  const id = getClientIdentifier(request);
  const { success, remaining, resetAt } = rateLimit(id, 'auth:verify-otp', {
    windowMs: 60 * 1000,
    max: 10,
  });
  if (!success) {
    return new Response(
      JSON.stringify({ success: false, error: 'Too many attempts. Try again later.' }),
      {
        status: 429,
        headers: {
          'Content-Type': 'application/json',
          'X-RateLimit-Remaining': String(remaining),
          'Retry-After': String(Math.ceil((resetAt - Date.now()) / 1000)),
        },
      }
    );
  }
  return verifyOtp(request);
}
