import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  
  // Note: Since we're using localStorage for authentication, 
  // we can't access it in middleware (server-side).
  // The authentication checks will be handled by the page components.
  // This middleware is disabled for now.
  
  return NextResponse.next();
}

export const config = {
  matcher: [
    '/auth/profile-complete',
    '/profile/:path*'
  ]
}; 