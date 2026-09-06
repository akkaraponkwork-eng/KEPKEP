export const dynamic = 'force-dynamic'
import { NextRequest, NextResponse } from 'next/server';
import { withTransaction } from '@/lib/db/client';
import { JobRepository } from '@/lib/db/repositories/job.repository';
import { FileRepository } from '@/lib/db/repositories/file.repository';
import { GroupRepository } from '@/lib/db/repositories/group.repository';
import { TokenManager } from '@/lib/auth/token.manager';
import { ErrorClassifier, ErrorType } from '@/lib/errors/classifier';
import { LineService } from '@/lib/line/client';
import { DriveAdapter } from '@/lib/drive/adapter';
import { groupAdmins, groups as groupsTable } from '@/lib/db/schema';
import { db } from '@/lib/db/client';
import { eq } from 'drizzle-orm';
import { verifySignatureAppRouter } from '@upstash/qstash/nextjs';

async function uploadHandler(req: Request): Promise<Response> {
  try {
    const body = await req.json();
    const { jobId, fileId } = body;

    if (!jobId || !fileId) {
      return NextResponse.json({ error: 'Missing jobId or fileId' }, { status: 400 });
    }

    // Run without transaction due to neon-http driver limitations
      // 1. Lock the Job
      const job = await JobRepository.lockForUpdate(jobId);
      if (!job) throw new Error('Job not found');

      if (['completed', 'dead_letter'].includes(job.status)) {
        return NextResponse.json({ success: true, message: 'already processed' });
      }

      const file = await FileRepository.findById(fileId);
      if (!file) throw new Error('File not found');

      const group = await GroupRepository.findByLineGroupId(file.groupId.toString());
      
      // Removed updateStatus to processing here because lockForUpdate already sets it to processing

      try {
        // Fetch Admin for this group
        const groupAdminLinks = await db.select().from(groupAdmins).where(eq(groupAdmins.groupId, file.groupId)).limit(1);
        const adminId = groupAdminLinks[0]?.adminId;

        if (!adminId) throw new Error('No admin linked to this group');

        // 2. Fetch OAuth Token
        const accessToken = await TokenManager.getValidAccessToken(adminId);
        if (!accessToken) {
          throw { status: 401, message: 'invalid_grant' }; // Force GROUP_LEVEL error
        }

        const drive = new DriveAdapter(accessToken);
        
        // 3. Drive Adapter Deduplication
        const driveFile = await drive.findByAppFileId(file.id.toString());
        if (driveFile) { 
          await JobRepository.updateStatus(job.id, 'completed');
          return NextResponse.json({ success: true, message: 'file deduplicated' });
        }

        // 4. Create Drive Folder if missing
        let targetFolderId = group?.driveFolderId;
        if (!targetFolderId) {
          const folderName = group?.name || `LINE Group ${file.groupId}`;
          targetFolderId = await drive.createFolder(folderName);
          // Save back to DB
          await db.update(groupsTable).set({ driveFolderId: targetFolderId }).where(eq(groupsTable.id, file.groupId));
        }

        // 5. Download from LINE (Stream instead of Buffer)
        const stream = await LineService.getMessageContentStream(file.lineMessageId);

        // 6. Upload to Drive (Stream)
        const filename = file.originalFilename || `line_file_${file.lineMessageId}`;
        const mimeType = file.mimeType || 'application/octet-stream'; 
        
        await drive.upload(filename, mimeType, stream, file.id.toString(), targetFolderId);

        // 7. Complete Job
        await JobRepository.updateStatus(job.id, 'completed');

      } catch (error: any) {
        // 8. Error Classification & Retry Policy
        const errorType = ErrorClassifier.classify(error);
        const nextAttempts = job.attempts + 1;

        if (errorType === ErrorType.PERMANENT) {
          await JobRepository.updateStatus(job.id, 'failed');
        } else if (errorType === ErrorType.GROUP_LEVEL) {
          await JobRepository.updateStatus(job.id, 'blocked');
          if (group) {
             await GroupRepository.updateStatus(group.id, 'token_expired');
          }
        } else {
          // TRANSIENT or SYSTEM_LEVEL (Retryable)
          if (nextAttempts >= 5) {
            await JobRepository.updateStatus(job.id, 'dead_letter');
          } else {
            const backoffSec = Math.pow(2, nextAttempts) * 15;
            const nextRetry = new Date(Date.now() + backoffSec * 1000);
            await JobRepository.updateStatus(job.id, 'retry_wait', nextRetry);
          }
        }
      }

    return NextResponse.json({ success: true });
  } catch (err: any) {
    console.error('Worker Error:', err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

// Wrap lazily — verifySignatureAppRouter reads QStash env vars at call time,
// so calling it at module level throws during Next.js build-time module eval.
export async function POST(req: Request): Promise<Response> {
  return verifySignatureAppRouter(uploadHandler)(req as any);
}
