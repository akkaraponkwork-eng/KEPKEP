export const dynamic = 'force-dynamic'
import { NextRequest, NextResponse } from 'next/server';
import { exchangeCodeForTokens } from '@/lib/auth/oauth';
import { AdminRepository } from '@/lib/db/repositories/admin.repository';
import { OAuthRepository } from '@/lib/db/repositories/oauth.repository';
import { EncryptionService } from '@/lib/auth/encryption';
import { getSession } from '@/lib/auth/session';
import { db } from '@/lib/db/client';
import { admins, groupAdmins } from '@/lib/db/schema';
import { GroupRepository } from '@/lib/db/repositories/group.repository';
import { eq } from 'drizzle-orm';

export async function GET(req: NextRequest) {
  const searchParams = req.nextUrl.searchParams;
  const code = searchParams.get('code');
  const rawState = searchParams.get('state') || ''; 
  
  const [csrfToken, lineGroupId] = rawState.split('|');
  const storedCsrfToken = req.cookies.get('oauth_csrf_token')?.value;

  if (!csrfToken || csrfToken !== storedCsrfToken) {
    return NextResponse.json({ error: 'Invalid state parameter (CSRF protection)' }, { status: 400 });
  }

  if (!code) {
    return NextResponse.json({ error: 'No authorization code provided' }, { status: 400 });
  }

  try {
    const session = await getSession();
    if (!session || !session.adminId) {
      return NextResponse.json({ error: 'You must be logged in to connect Google Drive' }, { status: 401 });
    }

    const { tokens, userInfo } = await exchangeCodeForTokens(code);

    if (!tokens.refresh_token) {
      return NextResponse.json({ 
        error: 'No refresh token returned. Please revoke access in Google Account and try again.' 
      }, { status: 400 });
    }

    const googleId = userInfo.sub || userInfo.email;

    // Clear googleId from any other account to prevent unique constraint error
    await db.update(admins)
      .set({ googleId: null })
      .where(eq(admins.googleId, googleId));

    // Update Admin with googleId
    await db.update(admins)
      .set({ googleId: googleId })
      .where(eq(admins.id, session.adminId));

    const adminId = session.adminId;

      // 2. Encrypt Tokens
      const encryptedAccess = EncryptionService.encrypt(tokens.access_token || '');
      const encryptedRefresh = EncryptionService.encrypt(tokens.refresh_token || '');
      
      const expiryDate = new Date(tokens.expiry_date || Date.now() + 3600 * 1000);

      // 3. Upsert OAuth Tokens
      await OAuthRepository.upsert({
        adminId: adminId,
        accessTokenEncrypted: encryptedAccess,
        refreshTokenEncrypted: encryptedRefresh,
        expiresAt: expiryDate,
        scopes: tokens.scope || '',
        keyVersion: process.env.KEY_VERSION || 'v1'
      });

      // 4. (Optional) If state contains a LINE Group ID, we should link the Group to this Admin in group_admins table.
      if (lineGroupId) {
        let group = await GroupRepository.findByLineGroupId(lineGroupId);
        if (!group) {
          group = await GroupRepository.create(lineGroupId);
        }
        try {
          await db.insert(groupAdmins).values({
            groupId: group.id,
            adminId: adminId,
          });
        } catch (e: any) {
          // Ignore unique constraint violation if already linked
          if (e.code !== '23505') throw e; 
        }
      }

    // 6. Redirect to Dashboard or Success page
    const response = NextResponse.redirect(new URL('/dashboard/settings?drive=connected', req.url));
    response.cookies.delete('oauth_csrf_token');
    return response;

  } catch (error: any) {
    console.error('OAuth Callback Error:', error);
    return NextResponse.json({ error: 'Authentication failed' }, { status: 500 });
  }
}
