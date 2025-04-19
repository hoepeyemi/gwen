import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// This middleware completely bypasses all auth checks to allow debugging
export function middleware(request: NextRequest) {
  console.log('Middleware running for path:', request.nextUrl.pathname);
  
  // Always allow access without any checks
  return NextResponse.next();
}

// Optional: exclude some paths from middleware if you want
export const config = {
  matcher: [
    // Include paths you want middleware to run on
    '/dashboard/:path*',
    '/api/:path*',
    
    // Exclude static files and other paths that don't need middleware
    '/((?!_next/static|_next/image|favicon.ico).*)',
  ],
}; 