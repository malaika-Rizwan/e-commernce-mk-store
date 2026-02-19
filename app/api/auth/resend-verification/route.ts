import { NextRequest } from 'next/server';
import { resendVerificationCode } from '@/controllers/authController';
import { rateLimit, getClientIdentifier } from '@/lib/rate-limit';

export async function POST(request: NextRequest) {
  const id = getClientIdentifier(request);
  const { success, remaining, resetAt } = rateLimit(id, 'auth:resend-verification', {
    windowMs: 60 * 1000,
    max: 5,
  });
  if (!success) {
    return new Response(
      JSON.stringify({ success: false, error: 'Too many requests. Try again in a minute.' }),
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
  return resendVerificationCode(request);
}
