import { SignJWT, jwtVerify } from 'jose';
import { cookies } from 'next/headers';

const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET ?? 'fallback-change-in-production'
);

const COOKIE_NAME = 'auth-token';
const COOKIE_OPTIONS = {
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: 'lax' as const,
  path: '/',
  maxAge: 60 * 60 * 24 * 7, // 7 days
};

export type UserRole = 'user' | 'admin';

export interface JWTPayload {
  userId: string;
  email: string;
  role: UserRole;
  purpose?: 'auth' | '2fa_challenge';
  iat?: number;
  exp?: number;
}

export async function createToken(payload: Omit<JWTPayload, 'iat' | 'exp'>): Promise<string> {
  return new SignJWT({ ...payload })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('7d')
    .sign(JWT_SECRET);
}

/** Short-lived token for 2FA step only (e.g. 5 min). Do not use as session. */
export async function create2FAChallengeToken(userId: string): Promise<string> {
  return new SignJWT({ userId, purpose: '2fa_challenge' })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('5m')
    .sign(JWT_SECRET);
}

export async function verify2FAChallengeToken(token: string): Promise<{ userId: string } | null> {
  try {
    const { payload } = await jwtVerify(token, JWT_SECRET);
    const p = payload as unknown as JWTPayload;
    if (p.purpose !== '2fa_challenge' || !p.userId) return null;
    return { userId: p.userId };
  } catch {
    return null;
  }
}

export async function verifyToken(token: string): Promise<JWTPayload | null> {
  try {
    const { payload } = await jwtVerify(token, JWT_SECRET);
    return payload as unknown as JWTPayload;
  } catch {
    return null;
  }
}

export async function setAuthCookie(token: string): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.set(COOKIE_NAME, token, COOKIE_OPTIONS);
}

export async function getAuthCookie(): Promise<string | undefined> {
  const cookieStore = await cookies();
  return cookieStore.get(COOKIE_NAME)?.value;
}

export async function removeAuthCookie(): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.delete(COOKIE_NAME);
}

export async function getSession(): Promise<JWTPayload | null> {
  const token = await getAuthCookie();
  if (!token) return null;
  return verifyToken(token);
}

/** Use in API routes: returns session or null. Throw or return 401 if you need required auth. */
export async function getSessionOrNull(): Promise<JWTPayload | null> {
  return getSession();
}

/** Require admin role. Use after getSession(); returns 403 if not admin. */
export function requireAdmin(session: JWTPayload | null): session is JWTPayload {
  return session?.role === 'admin';
}
