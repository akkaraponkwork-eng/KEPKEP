export const dynamic = 'force-dynamic'
import { NextRequest, NextResponse } from 'next/server';
import { validateSignature } from '@line/bot-sdk';
import { JobRepository } from '@/lib/db/repositories/job.repository';
import { GroupRepository } from '@/lib/db/repositories/group.repository';
import { FileRepository } from '@/lib/db/repositories/file.repository';
import { queue } from '@/lib/queue/qstash';
import { db } from '@/lib/db/client';
import { groupAdmins } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';
import { LineService } from '@/lib/line/client';

const channelSecret = process.env.LINE_CHANNEL_SECRET || '';

export async function POST(req: NextRequest) {
  try {
    const bodyText = await req.text();
    const signature = req.headers.get('x-line-signature') || '';

    if (!validateSignature(bodyText, channelSecret, signature)) {
      return NextResponse.json({ error: 'Invalid signature' }, { status: 401 });
    }

    const body = JSON.parse(bodyText);
    const events: any[] = body.events;

    for (const event of events) {
      // 1. Resolve lineGroupId early
      const lineGroupId = event.source.type === 'group' ? event.source.groupId : 
                          event.source.type === 'room' ? event.source.roomId : 
                          event.source.userId;
                          
      if (!lineGroupId) continue;

      // 2. Handle 'join' event
      if (event.type === 'join') {
        await LineService.sendConnectWarning(lineGroupId, event.replyToken);
        continue;
      }

      if (event.type !== 'message') {
        continue;
      }
      
      const isFile = event.message.type === 'image' || event.message.type === 'file';
      const isText = event.message.type === 'text';

      if (!isFile && !isText) {
        continue;
      }
      
      // Handle Text Commands
      if (isText) {
        const text = event.message.text.toLowerCase();
        if (text.includes('@bot connect') || text.includes('!connect')) {
          await LineService.sendConnectCard(lineGroupId, event.replyToken);
        }
        continue;
      }

      // Handle File Uploads (isFile)
      const messageId = event.message.id;

      // 1. Resolve Group
      let group = await GroupRepository.findByLineGroupId(lineGroupId);
      if (!group) {
        group = await GroupRepository.create(lineGroupId);
      }

      // 2. Check if group is linked to any admin
      const groupAdminLinks = await db.select().from(groupAdmins).where(eq(groupAdmins.groupId, group.id)).limit(1);
      if (groupAdminLinks.length === 0) {
        // Group is not linked, send warning and connect card
        await LineService.sendConnectWarning(lineGroupId, event.replyToken);
        continue; // Skip saving the file
      }

      // 3. State Check: Do not dispatch if suspended, expired, or missing
      if (['token_expired', 'folder_missing', 'suspended'].includes(group.status)) {
        console.warn(`Group ${group.id} is ${group.status}. Skipping dispatch.`);
        continue; // Skip, but don't fail webhook
      }

      // 4. INSERT file (Idempotent via ON CONFLICT DO NOTHING)
      const fileRecord = await FileRepository.upsert({
        groupId: group.id,
        lineMessageId: messageId,
        status: 'received',
        originalFilename: event.message.type === 'file' ? event.message.fileName : undefined
      });

      // 5. INSERT job
      const jobRecord = await JobRepository.upsert({
        fileId: fileRecord.id,
        status: 'queued',
      });

      // 6. Publish to QStash
      if (jobRecord.status === 'queued') {
        const baseUrl = process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : 'http://localhost:3000';
        await queue.publish(`${baseUrl}/api/jobs/upload`, {
          jobId: jobRecord.id,
          fileId: fileRecord.id
        });
      }
    }

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Webhook Error:', error);
    // Always return 200 to LINE to prevent unnecessary retries for parsing errors
    return NextResponse.json({ success: false }, { status: 200 });
  }
}
