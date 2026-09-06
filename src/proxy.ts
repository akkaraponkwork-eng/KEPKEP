import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { getSession } from '@/lib/auth/session';

// Use the edge runtime for middleware
export const config = {
  matcher: ['/dashboard/:path*'],
};

export async function proxy(req: NextRequest) {
  const session = await getSession();

  if (!session) {
    // Redirect unauthenticated users to the login page
    return NextResponse.redirect(new URL('/login', req.url));
  }

  // Pass the user info via headers to the downstream request if needed
  const requestHeaders = new Headers(req.headers);
  requestHeaders.set('x-admin-id', String(session.adminId));
  
  return NextResponse.next({
    request: {
      headers: requestHeaders,
    },
  });
}
