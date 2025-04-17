import { authMiddleware } from "@civic/auth-web3/nextjs/middleware";
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// Civic Auth middleware to verify authentication
const civicAuthMiddleware = authMiddleware();

// Custom middleware function
export async function middleware(request: NextRequest) {
  // First, let Civic Auth middleware run
  const response = await civicAuthMiddleware(request);
  
  // Get the user ID from request headers or cookies
  const isAuthenticated = request.cookies.has('auth_user') || 
                          request.headers.get('x-auth-user') !== null;
                          
  // If authenticated and trying to access auth pages, redirect to dashboard
  if (isAuthenticated && 
      (request.nextUrl.pathname.startsWith('/auth/signin') || 
       request.nextUrl.pathname.startsWith('/auth/signup'))) {
    return NextResponse.redirect(new URL('/dashboard', request.url));
  }
  
  // Otherwise continue with the response from Civic middleware
  return response;
}

export const config = {
  // Include the paths you wish to secure
  matcher: [
    "/api/:path*",
    "/dashboard/:path*",
    "/auth/:path*" 
  ]
} 