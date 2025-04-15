import { authMiddleware } from "@civic/auth-web3/nextjs/middleware";

export default authMiddleware();

export const config = {
  // Include the paths you wish to secure
  matcher: [
    "/api/:path*",
    "/dashboard/:path*"
  ]
} 