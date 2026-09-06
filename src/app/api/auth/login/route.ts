export const dynamic = 'force-dynamic'
import { NextRequest, NextResponse } from 'next/server';
import { getAuthUrl } from '@/lib/auth/oauth';

export async function GET(req: NextRequest) {
  const searchParams = req.nextUrl.searchParams;
  const groupId = searchParams.get('groupId') || '';

  const csrfToken = Math.random().toString(36).substring(2);
  const state = `${csrfToken}|${groupId}`;

  const authUrl = getAuthUrl(state);

  const response = NextResponse.redirect(authUrl);
  
  // Set CSRF token in cookie to verify in callback
  response.cookies.set('oauth_csrf_token', csrfToken, { 
    httpOnly: true, 
    secure: process.env.NODE_ENV === 'production', 
    path: '/',
    maxAge: 60 * 15 // 15 minutes
  });
  
  return response;
}
