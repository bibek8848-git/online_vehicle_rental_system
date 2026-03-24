import { NextRequest, NextResponse } from 'next/server';
import { jwtVerify } from 'jose';

const JWT_SECRET = process.env.JWT_SECRET || 'MySuperSecretKeyPass12345';
const secret = new TextEncoder().encode(JWT_SECRET);

export async function middleware(request: NextRequest) {
  const token = request.headers.get('authorization')?.split(' ')[1] || request.cookies.get('token')?.value;

  const { pathname } = request.nextUrl;

  // 1. Handle Public Routes when authenticated
  if (pathname === '/login' || pathname === '/register') {
    if (token) {
      try {
        const { payload } = await jwtVerify(token, secret);
        const decoded = payload as any;
        const userRole = (decoded.role || '').toUpperCase();
        const dashboard = `/dashboard/${userRole.toLowerCase()}`;
        return NextResponse.redirect(new URL(dashboard, request.url));
      } catch (error) {
        // Invalid token, allow access to login/register
      }
    }
    return NextResponse.next();
  }

  // 2. Handle Root Route
  if (pathname === '/') {
    // If there's a token in search params, let it pass to SearchParamHandler
    if (request.nextUrl.searchParams.has('token')) {
      return NextResponse.next();
    }

    if (!token) {
      return NextResponse.redirect(new URL('/login', request.url));
    }
    try {
      const { payload } = await jwtVerify(token, secret);
      const decoded = payload as any;
      const userRole = (decoded.role || '').toUpperCase();
      const dashboard = `/dashboard/${userRole.toLowerCase()}`;
      return NextResponse.redirect(new URL(dashboard, request.url));
    } catch (error) {
      return NextResponse.redirect(new URL('/login', request.url));
    }
  }

  // 3. Define protected routes and their allowed roles
  const protectedRoutes = [
    { path: '/dashboard/admin', roles: ['ADMIN'] },
    { path: '/dashboard/provider', roles: ['PROVIDER'] },
    { path: '/dashboard/user', roles: ['USER'] },
    { path: '/api/admin', roles: ['ADMIN'] },
    // Provider specific API protections could be added here if needed
  ];

  const matchedRoute = protectedRoutes.find(route => pathname.startsWith(route.path));

  if (matchedRoute) {
    if (!token) {
      if (pathname.startsWith('/api/')) {
        return NextResponse.json({ success: false, message: 'Authentication required' }, { status: 401 });
      }
      return NextResponse.redirect(new URL('/login', request.url));
    }

    try {
      const { payload } = await jwtVerify(token, secret);
      const decoded = payload as any;
      
      const userRole = (decoded.role || '').toUpperCase();
      
      if (!matchedRoute.roles.includes(userRole)) {
        if (pathname.startsWith('/api/')) {
          return NextResponse.json({ success: false, message: 'Forbidden' }, { status: 403 });
        }
        // Redirect to their own dashboard if they try to access another one
        const dashboard = `/dashboard/${userRole.toLowerCase()}`;
        
        // Prevent infinite redirect loop if already on the dashboard
        if (pathname === dashboard) {
          return NextResponse.next();
        }
        
        return NextResponse.redirect(new URL(dashboard, request.url));
      }
    } catch (error) {
      if (pathname.startsWith('/api/')) {
        return NextResponse.json({ success: false, message: 'Invalid token' }, { status: 401 });
      }
      return NextResponse.redirect(new URL('/login', request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/dashboard/admin/:path*',
    '/dashboard/provider/:path*',
    '/dashboard/user/:path*',
    '/api/admin/:path*',
    '/api/provider/:path*',
    '/api/user/:path*',
    '/',
    '/login',
    '/register',
  ],
};
