export const dynamic = 'force-dynamic'
import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db/client';
import { admins } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';
import { createSession } from '@/lib/auth/session';

export async function GET(req: NextRequest) {
  const searchParams = req.nextUrl.searchParams;
  const code = searchParams.get('code');

  if (!code) {
    return NextResponse.json({ error: 'No authorization code provided' }, { status: 400 });
  }

  try {
    const redirectUri = `${req.nextUrl.origin}/api/auth/line/callback`;
    
    // Exchange code for token
    const tokenRes = await fetch('https://api.line.me/oauth2/v2.1/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        grant_type: 'authorization_code',
        code,
        redirect_uri: redirectUri,
        client_id: process.env.LINE_LOGIN_CHANNEL_ID || '',
        client_secret: process.env.LINE_LOGIN_CHANNEL_SECRET || '',
      }),
    });

    if (!tokenRes.ok) {
        throw new Error('Failed to fetch LINE token');
    }

    const tokenData = await tokenRes.json();
    const idToken = tokenData.id_token;

    if (!idToken) {
        throw new Error('No id_token returned from LINE');
    }

    // Decode id_token (ignoring signature verification for simplicity)
    const payloadBuffer = Buffer.from(idToken.split('.')[1], 'base64');
    const payload = JSON.parse(payloadBuffer.toString('utf-8'));

    const email = payload.email;
    const name = payload.name;
    const lineId = payload.sub;
    const picture = payload.picture;

    if (!email) {
       return NextResponse.json({ 
           error: 'Email is required. Please authorize email access in LINE Login.' 
       }, { status: 400 });
    }

    // Check if user exists by lineId first
    let [admin] = await db.select().from(admins).where(eq(admins.lineId, lineId)).limit(1);

    if (!admin) {
      // Fallback to email
      [admin] = await db.select().from(admins).where(eq(admins.email, email)).limit(1);
    }

    if (admin) {
      // Update lineId, pictureUrl, displayName if missing or different
      await db.update(admins).set({ 
        lineId,
        pictureUrl: picture || admin.pictureUrl,
        displayName: name || admin.displayName
      }).where(eq(admins.id, admin.id));
      
      // refetch admin
      [admin] = await db.select().from(admins).where(eq(admins.id, admin.id)).limit(1);
    } else {
      // Create new admin
      [admin] = await db.insert(admins).values({
        email,
        name,
        lineId,
        pictureUrl: picture,
        displayName: name
      }).returning();
    }

    // Create session
    await createSession(admin.id, admin.email);

    // Redirect to onboarding if workspaceName is not set
    if (!admin.workspaceName) {
      return NextResponse.redirect(new URL('/onboarding/workspace', req.url));
    }

    return NextResponse.redirect(new URL('/dashboard', req.url));

  } catch (error: any) {
    console.error('LINE Callback Error:', error);
    return NextResponse.json({ error: 'Authentication failed' }, { status: 500 });
  }
}
