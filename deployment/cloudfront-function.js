// CloudFront Function for Urban Blue Zone
// Handles security headers, path rewriting, and request validation

function handler(event) {
  var request = event.request;
  var headers = request.headers;
  var uri = request.uri;

  // Security Headers
  headers['strict-transport-security'] = { value: 'max-age=63072000; includeSubDomains; preload' };
  headers['x-content-type-options'] = { value: 'nosniff' };
  headers['x-frame-options'] = { value: 'SAMEORIGIN' };
  headers['x-xss-protection'] = { value: '1; mode=block' };
  headers['referrer-policy'] = { value: 'strict-origin-when-cross-origin' };

  // Content Security Policy
  headers['content-security-policy'] = {
    value: "default-src 'self'; " +
           "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://cdn.jsdelivr.net; " +
           "style-src 'self' 'unsafe-inline'; " +
           "img-src 'self' data: https:; " +
           "font-src 'self' data:; " +
           "connect-src 'self' https://*.amazonaws.com wss://*.amazonaws.com; " +
           "frame-ancestors 'none';"
  };

  // Permissions Policy
  headers['permissions-policy'] = {
    value: 'accelerometer=(), camera=(), geolocation=(self), gyroscope=(), magnetometer=(), microphone=(), payment=(), usb=()'
  };

  // Path handling
  // Redirect trailing slashes for consistency
  if (uri.endsWith('/') && uri !== '/') {
    return {
      statusCode: 301,
      statusDescription: 'Moved Permanently',
      headers: {
        location: { value: uri.slice(0, -1) }
      }
    };
  }

  // Rewrite paths for Next.js pages
  // Handle root
  if (uri === '/') {
    request.uri = '/index.html';
  }
  // Handle Next.js data requests
  else if (uri.includes('/_next/data/')) {
    // Keep as is for Next.js data fetching
  }
  // Handle static files
  else if (uri.includes('/_next/static/') || uri.includes('/public/')) {
    // Keep as is for static assets
  }
  // Handle API routes
  else if (uri.startsWith('/api/')) {
    // Keep as is for API routes
  }
  // Handle page routes
  else if (!uri.includes('.')) {
    // Check if it's a known page route
    var knownRoutes = [
      '/dashboard',
      '/cohorts',
      '/residents',
      '/alerts',
      '/resources',
      '/login',
      '/logout',
      '/404',
      '/500'
    ];

    var isKnownRoute = false;
    for (var i = 0; i < knownRoutes.length; i++) {
      if (uri === knownRoutes[i] || uri.startsWith(knownRoutes[i] + '/')) {
        isKnownRoute = true;
        break;
      }
    }

    // For dynamic routes like /residents/[id]
    if (uri.startsWith('/residents/') && uri.split('/').length === 3) {
      isKnownRoute = true;
    }

    if (isKnownRoute) {
      // Let Next.js handle the route
      request.uri = uri;
    } else {
      // Unknown route, let Next.js 404 handle it
      request.uri = '/404';
    }
  }

  // Block sensitive paths
  var blockedPaths = [
    '/.env',
    '/.git',
    '/node_modules',
    '/package.json',
    '/package-lock.json',
    '/.next/cache',
    '/next.config.js',
    '/tsconfig.json'
  ];

  for (var j = 0; j < blockedPaths.length; j++) {
    if (uri.startsWith(blockedPaths[j])) {
      return {
        statusCode: 403,
        statusDescription: 'Forbidden',
        body: {
          encoding: 'text',
          data: '403 Forbidden'
        }
      };
    }
  }

  // Add cache control for specific paths
  if (uri.includes('/_next/static/')) {
    headers['cache-control'] = { value: 'public, max-age=31536000, immutable' };
  } else if (uri.startsWith('/api/')) {
    headers['cache-control'] = { value: 'no-store, no-cache, must-revalidate' };
  }

  // Add CORS headers for API routes
  if (uri.startsWith('/api/')) {
    headers['access-control-allow-origin'] = { value: '*' };
    headers['access-control-allow-methods'] = { value: 'GET, POST, PUT, DELETE, OPTIONS' };
    headers['access-control-allow-headers'] = { value: 'Content-Type, Authorization' };
    headers['access-control-max-age'] = { value: '86400' };
  }

  // Handle OPTIONS requests for CORS preflight
  if (request.method === 'OPTIONS' && uri.startsWith('/api/')) {
    return {
      statusCode: 200,
      statusDescription: 'OK',
      headers: {
        'access-control-allow-origin': { value: '*' },
        'access-control-allow-methods': { value: 'GET, POST, PUT, DELETE, OPTIONS' },
        'access-control-allow-headers': { value: 'Content-Type, Authorization' },
        'access-control-max-age': { value: '86400' }
      }
    };
  }

  return request;
}