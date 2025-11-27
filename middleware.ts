import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const sitePassword = process.env.SITE_PASSWORD;

  // If no password is set, allow access
  if (!sitePassword) {
    return NextResponse.next();
  }

  // Check for auth cookie
  const authCookie = request.cookies.get('site-auth');
  if (authCookie?.value === sitePassword) {
    return NextResponse.next();
  }

  // Check if this is a password submission
  if (request.method === 'POST' && request.nextUrl.pathname === '/api/auth/site-password') {
    return NextResponse.next();
  }

  // Allow the password page itself
  if (request.nextUrl.pathname === '/password') {
    return NextResponse.next();
  }

  // Redirect to password page
  return NextResponse.redirect(new URL('/password', request.url));
}

export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};
