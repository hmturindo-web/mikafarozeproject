/**
 * MIKAFAROZE — Custom JWT Middleware
 * Replaces Clerk — validates JWT Bearer tokens
 */

import { NextRequest, NextResponse } from 'next/server';
import { jwtVerify } from 'jose';

const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || 'mikafarozesecret-change-in-production-32ch'
);

// Protected route patterns
const PROTECTED_PATHS = [
  '/dashboard',
  '/admin',
];

const PROTECTED_API_PATHS = [
  '/api/orders',
  '/api/subscription',
  '/api/webhooks',
];

// Public routes — always accessible
const PUBLIC_PATHS = [
  '/',
  '/sign-in',
  '/sign-up',
  '/api/auth/signup',
  '/api/auth/signin',
  '/api/auth/verify',
  '/api/auth/resend',
];

function isProtectedPath(pathname: string): boolean {
  if (PUBLIC_PATHS.some(p => pathname === p || pathname.startsWith(p + '/'))) return false;
  return PROTECTED_PATHS.some(p => pathname.startsWith(p));
}

function isProtectedApiPath(pathname: string): boolean {
  return PROTECTED_API_PATHS.some(p => pathname.startsWith(p));
}

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Check if route needs protection
  const isProtected = isProtectedPath(pathname) || isProtectedApiPath(pathname);

  if (!isProtected) {
    return NextResponse.next();
  }

  // Extract Bearer token
  const authHeader = request.headers.get('Authorization');
  const token = authHeader?.startsWith('Bearer ')
    ? authHeader.slice(7)
    : null;

  if (!token) {
    if (isProtectedApiPath(pathname)) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }
    // For pages, redirect to sign-in
    const signInUrl = new URL('/sign-in', request.url);
    signInUrl.searchParams.set('redirect', pathname);
    return NextResponse.redirect(signInUrl);
  }

  // Verify JWT
  try {
    const { payload } = await jwtVerify(token, JWT_SECRET);
    // Attach user info to headers for downstream use
    const requestHeaders = new Headers(request.headers);
    requestHeaders.set('x-user-id', payload.userId as string);
    requestHeaders.set('x-user-email', payload.email as string);
    requestHeaders.set('x-user-role', payload.role as string);

    return NextResponse.next({ request: { headers: requestHeaders } });
  } catch {
    if (isProtectedApiPath(pathname)) {
      return NextResponse.json({ success: false, error: 'Invalid or expired token' }, { status: 401 });
    }
    const signInUrl = new URL('/sign-in', request.url);
    signInUrl.searchParams.set('redirect', pathname);
    return NextResponse.redirect(signInUrl);
  }
}

export const config = {
  matcher: [
    '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
    '/(api|trpc)(.*)',
  ],
};
