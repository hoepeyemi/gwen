import { authMiddleware } from "@civic/auth-web3/nextjs/middleware";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

// Custom middleware function that handles auth and also allows specific paths
export function middleware(request: NextRequest) {
  // Get the pathname from the URL
  const path = request.nextUrl.pathname;
  
  // Log the path for debugging
  console.log("Middleware processing path:", path);
  
  // Allow direct access to specific dashboard routes
  if (
    path === "/dashboard" || 
    /^\/dashboard\/[^\/]+\/send\/?$/.test(path) || // Allow dashboard/[address]/send
    /^\/dashboard\/[^\/]+\/send\/preview\/?$/.test(path) // Allow dashboard/[address]/send/preview
  ) {
    console.log("Allowing direct access to:", path);
    return NextResponse.next();
  }
  
  // For API routes and other dashboard subpaths, use Civic auth middleware
  if (path.startsWith("/api/") || (path.startsWith("/dashboard/") && path !== "/dashboard")) {
    console.log("Applying Civic auth to:", path);
    // Use the Civic auth middleware
    return authMiddleware()(request);
  }
  
  // Allow all other routes
  console.log("Allowing access to:", path);
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