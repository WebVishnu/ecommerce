import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  // this is goodasdfad
  
  return NextResponse.next();
}

export const config = {
  matcher: [
    '/auth/profile-complete',
    '/profile/:path*'
  ]
}; 
