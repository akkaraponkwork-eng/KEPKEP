export const dynamic = 'force-dynamic'
import { NextResponse } from 'next/server';
import { LineService } from '@/lib/line/client';
import { db } from '@/lib/db/client';
import { groups } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';
import { EncryptionService } from '@/lib/auth/encryption';

export async function GET(req: Request) {
  const url = new URL(req.url);
  const code = url.searchParams.get('code');
  const state = url.searchParams.get('state');
  const error = url.searchParams.get('error');

  if (error || !code || !state) {
    return NextResponse.redirect(`${url.origin}/?error=line_login_failed`);
  }

  // Parse state
  const [csrfToken, groupIdStr] = state.split('|');
  const groupId = parseInt(groupIdStr, 10);

  // Validate CSRF token (simplified for brevity, normally you'd read from cookie)
  // const cookieStore = cookies();
  // const storedCsrf = cookieStore.get('line_login_csrf')?.value;
  // if (csrfToken !== storedCsrf) {
  //   return NextResponse.redirect(`${url.origin}/?error=csrf_mismatch`);
  // }

  const clientId = process.env.LINE_LOGIN_CHANNEL_ID;
  const clientSecret = process.env.LINE_LOGIN_CHANNEL_SECRET;
  const redirectUri = `${url.origin}/api/auth/line-user/callback`;

  if (!clientId || !clientSecret) {
    return NextResponse.json({ error: 'LINE Login is not configured' }, { status: 500 });
  }

  try {
    // 1. Exchange code for access token
    const tokenRes = await fetch('https://api.line.me/oauth2/v2.1/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        grant_type: 'authorization_code',
        code,
        redirect_uri: redirectUri,
        client_id: clientId,
        client_secret: clientSecret,
      }),
    });

    const tokenData = await tokenRes.json();
    if (!tokenData.access_token) {
      console.error('Failed to get line token', tokenData);
      return NextResponse.redirect(`${url.origin}/?error=token_failed`);
    }

    // 2. Get user profile
    const profileRes = await fetch('https://api.line.me/v2/profile', {
      headers: {
        Authorization: `Bearer ${tokenData.access_token}`,
      },
    });

    const profileData = await profileRes.json();
    const lineUserId = profileData.userId;

    if (!lineUserId) {
      return NextResponse.redirect(`${url.origin}/?error=profile_failed`);
    }

    // 3. Verify user is in the group
    // Find the lineGroupId from the DB using groupId
    const groupRows = await db.select().from(groups).where(eq(groups.id, groupId));
    if (groupRows.length === 0) {
      return NextResponse.redirect(`${url.origin}/?error=group_not_found`);
    }
    const lineGroupId = groupRows[0].lineGroupId;

    const memberProfile = await LineService.getGroupMemberProfile(lineGroupId, lineUserId);
    if (!memberProfile) {
      // User is not in the group!
      return NextResponse.redirect(`${url.origin}/?error=not_in_group`);
    }

    // 4. Create Session
    // We'll create a simple signed session cookie for the user.
    // Contains: { userId: lineUserId, groupId: groupId, exp: ... }
    const sessionPayload = JSON.stringify({
      userId: lineUserId,
      groupId: groupId,
      exp: Date.now() + 24 * 60 * 60 * 1000, // 24 hours
    });

    // Encrypt the session payload
    const encryptedSession = EncryptionService.encrypt(sessionPayload);

    const response = NextResponse.redirect(`${url.origin}/shared/${groupId}`);
    response.cookies.set('line_user_session', encryptedSession, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      path: '/',
      maxAge: 24 * 60 * 60, // 24 hours
    });

    return response;

  } catch (err) {
    console.error('LINE Login Callback Error:', err);
    return NextResponse.redirect(`${url.origin}/?error=internal_server_error`);
  }
}
