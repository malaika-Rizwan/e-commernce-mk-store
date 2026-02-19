import { NextRequest } from 'next/server';
import { login as loginHandler } from '@/controllers/authController';
import { rateLimit, getClientIdentifier } from '@/lib/rate-limit';

export async function POST(request: NextRequest) {
  const id = getClientIdentifier(request);
  const { success, remaining, resetAt } = rateLimit(id, 'auth:login', { windowMs: 60 * 1000, max: 20 });
  if (!success) {
    return new Response(
      JSON.stringify({ success: false, error: 'Too many attempts. Try again later.' }),
      { status: 429, headers: { 'Content-Type': 'application/json', 'X-RateLimit-Remaining': String(remaining), 'Retry-After': String(Math.ceil((resetAt - Date.now()) / 1000)) } }
    );
  }
  return loginHandler(request);
}
