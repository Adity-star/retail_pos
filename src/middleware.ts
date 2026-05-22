// src/middleware.ts

import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { auth } from './lib/auth';

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  
  // Public routes
  const publicRoutes = ['/login', '/signup', '/api/auth'];
  const isPublicRoute = publicRoutes.some(route => pathname.startsWith(route));
  
  if (isPublicRoute) {
    return NextResponse.next();
  }
  
  // Check authentication
  const session = await auth.api.getSession({
    headers: request.headers
  });
  
  if (!session) {
    return NextResponse.redirect(new URL('/login', request.url));
  }
  
  // Check if user is active
  if (!session.user.isActive) {
    return NextResponse.redirect(new URL('/account-disabled', request.url));
  }
  
  // Add tenant context to headers
  const response = NextResponse.next();
  response.headers.set('x-tenant-id', session.user.tenantId);
  response.headers.set('x-user-id', session.user.id);
  response.headers.set('x-user-role', session.user.role);
  
  return response;
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico).*)',
  ],
};