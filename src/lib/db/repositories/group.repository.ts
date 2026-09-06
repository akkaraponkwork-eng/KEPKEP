import { db } from '../client';
import { groups } from '../schema';
import { eq } from 'drizzle-orm';
import { Transaction } from '../client';

export class GroupRepository {
  static async findByLineGroupId(lineGroupId: string, tx?: Transaction) {
    const conn = tx ?? db;
    const result = await conn.select().from(groups).where(eq(groups.lineGroupId, lineGroupId)).limit(1);
    return result[0] || null;
  }

  static async create(lineGroupId: string, tx?: Transaction) {
    const conn = tx ?? db;
    const result = await conn.insert(groups).values({
      lineGroupId,
      status: 'initializing',
    }).returning();
    return result[0];
  }

  static async updateStatus(id: number, status: string, tx?: Transaction) {
    const conn = tx ?? db;
    await conn.update(groups)
      .set({ status, updatedAt: new Date() })
      .where(eq(groups.id, id));
  }
}
