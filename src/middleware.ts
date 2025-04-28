import { authMiddleware } from "@civic/auth-web3/nextjs/middleware";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

// Custom middleware function that handles auth and also allows specific paths
export function middleware(request: NextRequest) {
  // Get the pathname from the URL
  const path = request.nextUrl.pathname;
  
  // Allow direct access to the dashboard root
  if (path === "/dashboard") {
    return NextResponse.next();
  }
  
  // For API routes and dashboard subpaths, use Civic auth middleware
  if (path.startsWith("/api/") || (path.startsWith("/dashboard/") && path !== "/dashboard")) {
    // Check if it's a tRPC request
    if (path.startsWith("/api/trpc/")) {
      return NextResponse.next();
    }
    
    // Use the Civic auth middleware for other API routes
    return authMiddleware()(request);
  }
  
  // Allow all other routes
  return NextResponse.next();
}

export const config = {
  // Include the paths you wish to process with the middleware
  matcher: [
    "/api/:path*",
    "/dashboard",
    "/dashboard/:path*"
  ]
} 