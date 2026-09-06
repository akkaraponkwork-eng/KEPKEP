import { db } from '../client';
import { jobs } from '../schema';
import { eq, sql } from 'drizzle-orm';
import { Transaction } from '../client';

export class JobRepository {
  static async upsert(
    data: { fileId: number; status?: string },
    tx?: Transaction
  ) {
    const conn = tx ?? db;
    const result = await conn.insert(jobs)
      .values(data)
      .onConflictDoNothing({ target: jobs.fileId })
      .returning();
      
    if (result.length > 0) return result[0];
    
    const existing = await conn.select().from(jobs).where(eq(jobs.fileId, data.fileId)).limit(1);
    return existing[0];
  }

  static async lockForUpdate(jobId: number, conn: any = db) {
    // Optimistic lock: Update to processing if queued
    const result = await conn.update(jobs)
      .set({ status: 'processing', updatedAt: new Date() })
      .where(sql`id = ${jobId} AND status = 'queued'`)
      .returning();
      
    if (result.length > 0) return result[0];
    
    // If not queued, fetch to check if it's already completed or dead_letter
    const existing = await conn.select().from(jobs).where(eq(jobs.id, jobId)).limit(1);
    return existing[0] || null;
  }

  static async updateStatus(id: number, status: string, nextRetryAt?: Date, tx?: Transaction) {
    const conn = tx ?? db;
    await conn.update(jobs)
      .set({ status, nextRetryAt, updatedAt: new Date() })
      .where(eq(jobs.id, id));
  }
}
