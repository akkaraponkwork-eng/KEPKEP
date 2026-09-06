export const dynamic = 'force-dynamic'
import { NextResponse } from 'next/server';
import { db } from '@/lib/db/client';
import { jobs } from '@/lib/db/schema';
import { eq, lt, and, or } from 'drizzle-orm';
import { queue } from '@/lib/queue/qstash';

// Vercel Cron will hit this endpoint securely
export async function GET(req: Request) {
  const authHeader = req.headers.get('authorization');
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return new NextResponse('Unauthorized', { status: 401 });
  }
  
  try {
    const now = new Date();
    // Processing for more than 5 minutes -> Stale (Worker likely crashed without throwing error)
    const staleThreshold = new Date(now.getTime() - 5 * 60 * 1000); 
    
    // Retry wait time has elapsed
    const retryThreshold = new Date(now.getTime());

    // Find jobs that need reconciliation
    const jobsToReconcile = await db.select().from(jobs).where(
      or(
        and(eq(jobs.status, 'processing'), lt(jobs.updatedAt, staleThreshold)),
        and(eq(jobs.status, 'retry_wait'), lt(jobs.nextRetryAt, retryThreshold))
      )
    );

    let reQueuedCount = 0;
    const baseUrl = process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : 'http://localhost:3000';

    for (const job of jobsToReconcile) {
      // Revert status to queued
      await db.update(jobs)
        .set({ status: 'queued', updatedAt: new Date() })
        .where(eq(jobs.id, job.id));

      // Dispatch to QStash
      await queue.publish(`${baseUrl}/api/jobs/upload`, {
        jobId: job.id,
        fileId: job.fileId
      });

      reQueuedCount++;
    }

    return NextResponse.json({ 
      success: true, 
      reconciled: reQueuedCount,
      timestamp: now.toISOString()
    });
  } catch (error: any) {
    console.error('Reconciliation Cron Error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
