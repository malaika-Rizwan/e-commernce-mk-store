import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { verifyTokenEdge } from '@/lib/verifyTokenEdge';

const publicPaths = [
  '/',
  '/login',
  '/register',
  '/forgot-password',
  '/reset-password',
  '/verify-email',
  '/products',
  '/about',
  '/contact',
  '/cart',
  '/order',
  '/api/auth/login',
  '/api/auth/register',
  '/api/auth/forgot-password',
  '/api/auth/reset-password',
  '/api/auth/verify-email',
  '/api/auth/verify-otp',
  '/api/auth/resend-verification',
  '/api/auth/verify-2fa',
];

const authApiPaths = [
  '/api/auth/login',
  '/api/auth/register',
  '/api/auth/forgot-password',
  '/api/auth/reset-password',
  '/api/auth/verify-email',
  '/api/auth/verify-otp',
  '/api/auth/resend-verification',
  '/api/auth/verify-2fa',
];

function isPublicPath(pathname: string): boolean {
  return publicPaths.some((p) => pathname === p || pathname.startsWith(p + '/'));
}

function isAuthApi(pathname: string): boolean {
  return authApiPaths.some((p) => pathname.startsWith(p));
}

function isProtectedApi(pathname: string): boolean {
  return (
    pathname.startsWith('/api/orders') ||
    pathname.startsWith('/api/users/profile') ||
    pathname.startsWith('/api/upload') ||
    pathname.startsWith('/api/checkout') ||
    pathname.startsWith('/api/cart') ||
    pathname.startsWith('/api/wishlist')
  );
}

function isAdminApi(pathname: string): boolean {
  return pathname.startsWith('/api/admin');
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const authToken = request.cookies.get('auth-token')?.value;

  if (isAuthApi(pathname)) {
    return NextResponse.next();
  }

  if (isAdminApi(pathname)) {
    if (!authToken) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized', code: 'UNAUTHORIZED' },
        { status: 401 }
      );
    }
    const payload = await verifyTokenEdge(authToken);
    if (!payload || payload.role !== 'admin') {
      return NextResponse.json(
        { success: false, error: 'Forbidden', code: 'FORBIDDEN' },
        { status: 403 }
      );
    }
    return NextResponse.next();
  }

  if (isProtectedApi(pathname) && !authToken) {
    return NextResponse.json(
      { success: false, error: 'Unauthorized', code: 'UNAUTHORIZED' },
      { status: 401 }
    );
  }

  const protectedPaths = ['/checkout', '/account', '/orders', '/wishlist'];
  const isProtectedPage = protectedPaths.some((p) => pathname.startsWith(p));

  if (isProtectedPage && !authToken) {
    const loginUrl = new URL('/login', request.url);
    loginUrl.searchParams.set('from', pathname);
    return NextResponse.redirect(loginUrl);
  }

  // Admin routes: require auth + role === 'admin'
  if (pathname.startsWith('/admin')) {
    if (!authToken) {
      const loginUrl = new URL('/login', request.url);
      loginUrl.searchParams.set('from', pathname);
      return NextResponse.redirect(loginUrl);
    }
    const payload = await verifyTokenEdge(authToken);
    if (!payload || payload.role !== 'admin') {
      return NextResponse.redirect(new URL('/', request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)'],
};
