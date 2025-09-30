import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";
import type { NextRequest } from 'next/server';

// Security headers configuration
const securityHeaders = {
  'Content-Security-Policy': [
    "default-src 'self'",
    "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://cdn.jsdelivr.net",
    "style-src 'self' 'unsafe-inline'",
    "img-src 'self' data: https: blob:",
    "font-src 'self' data:",
    "connect-src 'self' https://*.amazonaws.com wss://*.amazonaws.com https://api.ubz-demo.com",
    "frame-ancestors 'none'",
    "base-uri 'self'",
    "form-action 'self'",
    "object-src 'none'",
    "script-src-attr 'none'",
    "upgrade-insecure-requests"
  ].join('; '),
  'X-DNS-Prefetch-Control': 'on',
  'Strict-Transport-Security': 'max-age=63072000; includeSubDomains; preload',
  'X-Frame-Options': 'SAMEORIGIN',
  'X-Content-Type-Options': 'nosniff',
  'Referrer-Policy': 'strict-origin-when-cross-origin',
  'Permissions-Policy': 'camera=(), microphone=(), geolocation=(self)',
  'X-XSS-Protection': '1; mode=block'
};

// Rate limiting configuration
const rateLimitMap = new Map<string, { count: number; resetTime: number }>();

function rateLimit(ip: string): boolean {
  const now = Date.now();
  const windowMs = 60 * 1000; // 1 minute window
  const maxRequests = 100; // 100 requests per minute

  const record = rateLimitMap.get(ip);

  if (!record || now > record.resetTime) {
    rateLimitMap.set(ip, { count: 1, resetTime: now + windowMs });
    return true;
  }

  if (record.count >= maxRequests) {
    return false;
  }

  record.count++;
  return true;
}

// Clean up old rate limit entries periodically
if (typeof setInterval !== 'undefined') {
  setInterval(() => {
    const now = Date.now();
    for (const [ip, record] of rateLimitMap.entries()) {
      if (now > record.resetTime + 60000) {
        rateLimitMap.delete(ip);
      }
    }
  }, 60000);
}

function applySecurityHeaders(request: NextRequest, response: NextResponse): NextResponse {
  // Get client IP
  const ip = request.headers.get('x-forwarded-for')?.split(',')[0] ||
             request.headers.get('x-real-ip') ||
             'unknown';

  // Apply rate limiting for API routes
  if (request.nextUrl.pathname.startsWith('/api/')) {
    if (!rateLimit(ip)) {
      return new NextResponse('Too Many Requests', {
        status: 429,
        headers: {
          'Retry-After': '60',
          'X-RateLimit-Limit': '100',
          'X-RateLimit-Remaining': '0',
          'X-RateLimit-Reset': new Date(Date.now() + 60000).toISOString()
        }
      });
    }
  }

  // Apply security headers
  Object.entries(securityHeaders).forEach(([key, value]) => {
    response.headers.set(key, value);
  });

  // CORS for API routes
  if (request.nextUrl.pathname.startsWith('/api/')) {
    const origin = request.headers.get('origin');
    const allowedOrigins = [
      'https://ubz-demo.com',
      'https://staging.ubz-demo.com',
      'https://app.ubz-demo.com',
      'http://localhost:3000'
    ];

    if (origin && allowedOrigins.includes(origin)) {
      response.headers.set('Access-Control-Allow-Origin', origin);
    }

    response.headers.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    response.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    response.headers.set('Access-Control-Max-Age', '86400');
  }

  // Add request ID for tracing
  const requestId = crypto.randomUUID();
  response.headers.set('X-Request-Id', requestId);

  // Security: Remove sensitive headers
  response.headers.delete('X-Powered-By');

  // Cache control for specific paths
  const pathname = request.nextUrl.pathname;

  if (pathname.startsWith('/_next/static/')) {
    response.headers.set('Cache-Control', 'public, max-age=31536000, immutable');
  } else if (pathname.startsWith('/api/')) {
    response.headers.set('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
  } else if (pathname === '/dashboard' || pathname === '/cohorts') {
    response.headers.set('Cache-Control', 'public, max-age=15, s-maxage=15, stale-while-revalidate=30');
  }

  return response;
}

// For development without Cognito configured, bypass auth
const isDevelopment = process.env.NODE_ENV === "development";
const cognitoConfigured =
  process.env.COGNITO_CLIENT_ID &&
  process.env.COGNITO_CLIENT_ID !== "your-cognito-client-id";

export default cognitoConfigured
  ? withAuth(
      function middleware(req) {
        const response = NextResponse.next();
        return applySecurityHeaders(req as unknown as NextRequest, response);
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
  : function middleware(req: NextRequest) {
      // In development without Cognito, allow all requests but apply security headers
      const response = NextResponse.next();
      return applySecurityHeaders(req, response);
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