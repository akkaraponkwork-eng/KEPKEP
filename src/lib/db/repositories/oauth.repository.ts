import { db } from '../client';
import { oauthTokens } from '../schema';
import { Transaction } from '../client';
import { eq } from 'drizzle-orm';

export class OAuthRepository {
  static async upsert(
    data: {
      adminId: number;
      accessTokenEncrypted: string;
      refreshTokenEncrypted: string;
      expiresAt: Date;
      scopes: string;
      keyVersion: string;
    },
    tx?: Transaction
  ) {
    const conn = tx ?? db;
    const result = await conn.insert(oauthTokens)
      .values({ ...data, updatedAt: new Date() })
      .onConflictDoUpdate({
        target: oauthTokens.adminId,
        set: {
          accessTokenEncrypted: data.accessTokenEncrypted,
          refreshTokenEncrypted: data.refreshTokenEncrypted,
          expiresAt: data.expiresAt,
          scopes: data.scopes,
          keyVersion: data.keyVersion,
          updatedAt: new Date()
        }
      })
      .returning();
      
    return result[0];
  }
}
