import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// Protected routes that require authentication
const PROTECTED_PATHS = ['/ghost-control', '/dark-factory'];

// Credentials
const VALID_USERNAME = 'Syndicate';
const VALID_PASSWORD = 'Boo0282024!*';

function isProtectedPath(pathname: string): boolean {
  return PROTECTED_PATHS.some(path => pathname.startsWith(path));
}

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Check if this is a protected path
  if (!isProtectedPath(pathname)) {
    return NextResponse.next();
  }

  // Check for Authorization header (Basic Auth)
  const authHeader = request.headers.get('authorization');

  if (!authHeader || !authHeader.startsWith('Basic ')) {
    return new NextResponse('Authentication required', {
      status: 401,
      headers: {
        'WWW-Authenticate': 'Basic realm="GhostFoundry-Syndicate Internal"',
      },
    });
  }

  // Decode and validate credentials
  try {
    const base64Credentials = authHeader.split(' ')[1];
    const credentials = atob(base64Credentials);
    const [username, password] = credentials.split(':');

    if (username === VALID_USERNAME && password === VALID_PASSWORD) {
      return NextResponse.next();
    }
  } catch (e) {
    // Invalid base64 or credentials format
  }

  return new NextResponse('Invalid credentials', {
    status: 401,
    headers: {
      'WWW-Authenticate': 'Basic realm="GhostFoundry-Syndicate Internal"',
    },
  });
}

export const config = {
  matcher: ['/ghost-control/:path*', '/dark-factory/:path*'],
};
