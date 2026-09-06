export const dynamic = 'force-dynamic'
import { NextResponse } from 'next/server';

export async function GET(req: Request) {
  const url = new URL(req.url);
  const groupId = url.searchParams.get('groupId');
  
  if (!groupId) {
    return NextResponse.json({ error: 'Missing groupId' }, { status: 400 });
  }

  const clientId = process.env.LINE_LOGIN_CHANNEL_ID;
  if (!clientId) {
    return NextResponse.json({ error: 'LINE Login is not configured' }, { status: 500 });
  }

  const redirectUri = `${url.origin}/api/auth/line-user/callback`;
  
  // Create a state that contains a CSRF token and the target groupId
  const csrfToken = Math.random().toString(36).substring(2);
  const state = `${csrfToken}|${groupId}`;
  
  const authUrl = new URL('https://access.line.me/oauth2/v2.1/authorize');
  authUrl.searchParams.append('response_type', 'code');
  authUrl.searchParams.append('client_id', clientId);
  authUrl.searchParams.append('redirect_uri', redirectUri);
  authUrl.searchParams.append('state', state);
  authUrl.searchParams.append('scope', 'profile openid');
  
  const response = NextResponse.redirect(authUrl.toString());
  
  // Set the CSRF token in cookie to verify later
  response.cookies.set('line_login_csrf', csrfToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    path: '/',
    maxAge: 3600 // 1 hour
  });
  
  return response;
}
