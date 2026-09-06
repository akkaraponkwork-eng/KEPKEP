export const dynamic = 'force-dynamic'
import { NextResponse } from 'next/server';

export async function GET(req: Request) {
  const url = new URL(req.url);
  const redirectUri = `${url.origin}/api/auth/line/callback`;
  const state = Math.random().toString(36).substring(7); // In production, store this in a cookie for validation
  
  const lineAuthUrl = new URL('https://access.line.me/oauth2/v2.1/authorize');
  lineAuthUrl.searchParams.append('response_type', 'code');
  lineAuthUrl.searchParams.append('client_id', process.env.LINE_LOGIN_CHANNEL_ID || '');
  lineAuthUrl.searchParams.append('redirect_uri', redirectUri);
  lineAuthUrl.searchParams.append('state', state);
  lineAuthUrl.searchParams.append('scope', 'profile openid email');
  lineAuthUrl.searchParams.append('bot_prompt', 'normal');

  return NextResponse.redirect(lineAuthUrl.toString());
}
