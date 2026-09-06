import { db } from '../client';
import { admins } from '../schema';
import { eq } from 'drizzle-orm';
import { Transaction } from '../client';

export class AdminRepository {
  static async upsert(
    data: { email: string; name?: string },
    tx?: Transaction
  ) {
    const conn = tx ?? db;
    const result = await conn.insert(admins)
      .values(data)
      .onConflictDoUpdate({
        target: admins.email,
        set: data.name ? { name: data.name } : { email: data.email }
      })
      .returning();
      
    return result[0];
  }

  static async findByEmail(email: string, tx?: Transaction) {
    const conn = tx ?? db;
    const result = await conn.select().from(admins).where(eq(admins.email, email)).limit(1);
    return result[0] || null;
  }
}
