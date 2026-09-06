export const dynamic = 'force-dynamic';
import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@/lib/auth/session';
import { db } from '@/lib/db/client';
import { files, groupAdmins } from '@/lib/db/schema';
import { eq, and } from 'drizzle-orm';
import { TokenManager } from '@/lib/auth/token.manager';
import { EncryptionService } from '@/lib/auth/encryption';
import { google } from 'googleapis';
import { cookies } from 'next/headers';

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const resolvedParams = await params;
    const fileId = parseInt(resolvedParams.id, 10);
    if (isNaN(fileId)) {
      return new NextResponse('Invalid file ID', { status: 400 });
    }

    // Fetch file from DB
    const fileRows = await db.select().from(files).where(eq(files.id, fileId)).limit(1);
    const file = fileRows[0];

    if (!file || !file.driveFileId) {
      return new NextResponse('File not found', { status: 404 });
    }

    let isAuthorized = false;
    let targetAdminId: number | null = null;

    // 1. Check Admin Session
    const session = await getSession();
    if (session && session.adminId) {
      const links = await db.select()
        .from(groupAdmins)
        .where(and(eq(groupAdmins.adminId, session.adminId), eq(groupAdmins.groupId, file.groupId)))
        .limit(1);
      
      if (links.length > 0) {
        isAuthorized = true;
        targetAdminId = session.adminId;
      }
    }

    // 2. Check End-User Session (if not authorized as admin)
    if (!isAuthorized) {
      const cookieStore = await cookies();
      const userSessionStr = cookieStore.get('line_user_session')?.value;
      if (userSessionStr) {
        try {
          const decrypted = EncryptionService.decrypt(userSessionStr);
          const userSession = JSON.parse(decrypted);
          if (userSession.groupId === file.groupId && userSession.exp > Date.now()) {
            isAuthorized = true;
            // Find an admin for this group to use their token to fetch the file
            const links = await db.select().from(groupAdmins).where(eq(groupAdmins.groupId, file.groupId)).limit(1);
            if (links.length > 0) {
              targetAdminId = links[0].adminId;
            }
          }
        } catch (e) {
          console.error('Invalid user session', e);
        }
      }
    }

    if (!isAuthorized || !targetAdminId) {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    // Get Admin Token to access Drive
    const accessToken = await TokenManager.getValidAccessToken(targetAdminId);
    if (!accessToken) {
      return new NextResponse('Drive access token unavailable', { status: 500 });
    }

    // Fetch from Google Drive API
    const auth = new google.auth.OAuth2();
    auth.setCredentials({ access_token: accessToken });
    const drive = google.drive({ version: 'v3', auth });

    const driveRes = await drive.files.get({
      fileId: file.driveFileId,
      alt: 'media'
    }, { responseType: 'stream' });

    // Set correct headers
    const headers = new Headers();
    if (file.mimeType) headers.set('Content-Type', file.mimeType);
    if (file.originalFilename) headers.set('Content-Disposition', `inline; filename="${encodeURIComponent(file.originalFilename)}"`);
    
    // We cannot stream directly with ReadableStream easily in some Next.js version if it's a Node stream
    // Using `responseType: 'stream'` returns a GaxiosResponse<Readable>
    const stream = driveRes.data as unknown as ReadableStream;
    
    return new NextResponse(stream, {
      status: 200,
      headers
    });

  } catch (error: any) {
    console.error('Proxy File Error:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}
