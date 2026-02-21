/**
 * Rate limiter: uses Upstash Redis when UPSTASH_REDIS_REST_URL and UPSTASH_REDIS_REST_TOKEN are set;
 * otherwise falls back to in-memory store (per-instance, resets on restart).
 */

const store = new Map<string, { count: number; resetAt: number }>();

const WINDOW_MS = 60 * 1000; // 1 minute
const MAX_REQUESTS = 100;

function getKey(identifier: string, prefix: string): string {
  return `${prefix}:${identifier}`;
}

function cleanup() {
  const now = Date.now();
  Array.from(store.entries()).forEach(([key, value]) => {
    if (value.resetAt < now) store.delete(key);
  });
}

if (typeof setInterval !== 'undefined') {
  setInterval(cleanup, 2 * 60 * 1000);
}

export interface RateLimitResult {
  success: boolean;
  remaining: number;
  resetAt: number;
}

let redisRatelimit: ((key: string, windowMs: number, max: number) => Promise<RateLimitResult>) | null = null;

function getRedisRatelimit(): typeof redisRatelimit {
  if (redisRatelimit !== null) return redisRatelimit;
  const url = process.env.UPSTASH_REDIS_REST_URL?.trim();
  const token = process.env.UPSTASH_REDIS_REST_TOKEN?.trim();
  if (!url || !token) return null;
  try {
    const { Redis } = require('@upstash/redis');
    const { Ratelimit } = require('@upstash/ratelimit');
    const redis = new Redis({ url, token });
    const limiters = new Map<string, InstanceType<typeof Ratelimit>>();
    redisRatelimit = async (key: string, windowMs: number, max: number): Promise<RateLimitResult> => {
      const limiterKey = `${windowMs}-${max}`;
      let limiter = limiters.get(limiterKey);
      if (!limiter) {
        const windowSec = Math.max(1, Math.ceil(windowMs / 1000));
        limiter = new Ratelimit({
          redis,
          limiter: Ratelimit.slidingWindow(max, `${windowSec} s`),
          analytics: false,
        });
        limiters.set(limiterKey, limiter);
      }
      const { success, remaining, reset } = await limiter.limit(key);
      return {
        success,
        remaining: remaining ?? 0,
        resetAt: reset ? new Date(reset).getTime() : Date.now() + windowMs,
      };
    };
    return redisRatelimit;
  } catch {
    redisRatelimit = null;
    return null;
  }
}

function inMemoryRateLimit(
  identifier: string,
  prefix: string,
  options: { windowMs?: number; max?: number }
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
    record.count = 1;
    record.resetAt = resetAt;
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

/**
 * Rate limit by identifier. Uses Redis when UPSTASH_REDIS_REST_URL and UPSTASH_REDIS_REST_TOKEN are set.
 * Call with: const result = await rateLimit(id, prefix, options);
 */
export async function rateLimit(
  identifier: string,
  prefix: string = 'global',
  options: { windowMs?: number; max?: number } = {}
): Promise<RateLimitResult> {
  const windowMs = options.windowMs ?? WINDOW_MS;
  const max = options.max ?? MAX_REQUESTS;
  const redis = getRedisRatelimit();
  if (redis) {
    const key = getKey(identifier, prefix);
    return redis(key, windowMs, max);
  }
  return inMemoryRateLimit(identifier, prefix, options);
}

/** Get client identifier from request (IP or x-forwarded-for). */
export function getClientIdentifier(request: Request): string {
  const forwarded = request.headers.get('x-forwarded-for');
  const ip = forwarded ? forwarded.split(',')[0].trim() : null;
  return ip ?? request.headers.get('x-real-ip') ?? 'anonymous';
}
