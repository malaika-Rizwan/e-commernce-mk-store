/**
 * JWT verification for Edge (middleware). Uses same secret as lib/auth.
 * Kept separate to avoid pulling in next/headers (cookies) in Edge.
 */
import { jwtVerify } from 'jose';

const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET ?? 'fallback-change-in-production'
);

export interface JWTPayloadEdge {
  userId: string;
  email: string;
  role: string;
}

export async function verifyTokenEdge(token: string): Promise<JWTPayloadEdge | null> {
  try {
    const { payload } = await jwtVerify(token, JWT_SECRET);
    return payload as unknown as JWTPayloadEdge;
  } catch {
    return null;
  }
}
