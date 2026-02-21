import { NextRequest } from 'next/server';
import { register as registerHandler } from '@/controllers/authController';
import { rateLimit, getClientIdentifier } from '@/lib/rate-limit';

export async function POST(request: NextRequest) {
  const id = getClientIdentifier(request);
  const { success, remaining, resetAt } = await rateLimit(id, 'auth:register', { windowMs: 60 * 1000, max: 5 });
  if (!success) {
    return new Response(
      JSON.stringify({ success: false, error: 'Too many registrations. Try again later.' }),
      { status: 429, headers: { 'Content-Type': 'application/json', 'X-RateLimit-Remaining': String(remaining), 'Retry-After': String(Math.ceil((resetAt - Date.now()) / 1000)) } }
    );
  }
  return registerHandler(request);
}
