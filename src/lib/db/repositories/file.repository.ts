import { db } from '../client';
import { files } from '../schema';
import { eq } from 'drizzle-orm';
import { Transaction } from '../client';

export class FileRepository {
  static async upsert(
    data: { groupId: number; lineMessageId: string; status?: string; originalFilename?: string },
    tx?: Transaction
  ) {
    const conn = tx ?? db;
    const result = await conn.insert(files)
      .values(data)
      .onConflictDoNothing({ target: files.lineMessageId })
      .returning();
    
    if (result.length > 0) return result[0];
    
    // If conflict, return existing
    const existing = await conn.select().from(files).where(eq(files.lineMessageId, data.lineMessageId)).limit(1);
    return existing[0];
  }

  static async findById(id: number, tx?: Transaction) {
    const conn = tx ?? db;
    const result = await conn.select().from(files).where(eq(files.id, id)).limit(1);
    return result[0] || null;
  }
}
