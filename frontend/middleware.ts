import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";

// For development without Cognito configured, bypass auth
const isDevelopment = process.env.NODE_ENV === "development";
const cognitoConfigured =
  process.env.COGNITO_CLIENT_ID &&
  process.env.COGNITO_CLIENT_ID !== "your-cognito-client-id";

export default cognitoConfigured
  ? withAuth(
      function middleware(req) {
        // Additional middleware logic can go here
        return NextResponse.next();
      },
      {
        callbacks: {
          authorized: ({ token, req }) => {
            // Allow access to login page
            if (req.nextUrl.pathname === "/login") {
              return true;
            }
            // Require authentication for all other routes
            return !!token;
          },
        },
      }
    )
  : function middleware(req: any) {
      // In development without Cognito, allow all requests
      return NextResponse.next();
    };

export const config = {
  matcher: [
    "/dashboard/:path*",
    "/cohorts/:path*",
    "/residents/:path*",
    "/resources/:path*",
    "/api/:path*",
    // Exclude auth routes and static files
    "/((?!api/auth|_next/static|_next/image|favicon.ico|login).*)",
  ],
};