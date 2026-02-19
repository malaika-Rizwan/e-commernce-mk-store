/**
 * In-memory rate limiter. For production at scale, use Redis (e.g. @upstash/ratelimit).
 */

const store = new Map<string, { count: number; resetAt: number }>();

const WINDOW_MS = 60 * 1000; // 1 minute
const MAX_REQUESTS = 100; // per window per key

function getKey(identifier: string, prefix: string): string {
  return `${prefix}:${identifier}`;
}

function cleanup() {
  const now = Date.now();
  Array.from(store.entries()).forEach(([key, value]) => {
    if (value.resetAt < now) store.delete(key);
  });
}

// Run cleanup every 2 minutes
if (typeof setInterval !== 'undefined') {
  setInterval(cleanup, 2 * 60 * 1000);
}

export interface RateLimitResult {
  success: boolean;
  remaining: number;
  resetAt: number;
}

export function rateLimit(
  identifier: string,
  prefix: string = 'global',
  options: { windowMs?: number; max?: number } = {}
): RateLimitResult {
  const windowMs = options.windowMs ?? WINDOW_MS;
  const max = options.max ?? MAX_REQUESTS;
  const key = getKey(identifier, prefix);
  const now = Date.now();
  const record = store.get(key);

  if (!record) {
    const resetAt = now + windowMs;
    store.set(key, { count: 1, resetAt });
    return { success: true, remaining: max - 1, resetAt };
  }

  if (now >= record.resetAt) {
    const resetAt = now + windowMs;
    store.set(key, { count: 1, resetAt });
    return { success: true, remaining: max - 1, resetAt };
  }

  record.count += 1;
  const success = record.count <= max;
  return {
    success,
    remaining: Math.max(0, max - record.count),
    resetAt: record.resetAt,
  };
}

/** Get client identifier from request (IP or x-forwarded-for). */
export function getClientIdentifier(request: Request): string {
  const forwarded = request.headers.get('x-forwarded-for');
  const ip = forwarded ? forwarded.split(',')[0].trim() : null;
  return ip ?? request.headers.get('x-real-ip') ?? 'anonymous';
}
