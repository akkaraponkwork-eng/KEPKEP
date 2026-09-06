import { db } from '../db/client';
import { oauthTokens } from '../db/schema';
import { eq, sql } from 'drizzle-orm';
import { EncryptionService } from './encryption';

export class TokenManager {
  static async getValidAccessToken(adminId: number): Promise<string | null> {
    // 1. Fetch current token
    const tokens = await db.select().from(oauthTokens).where(eq(oauthTokens.adminId, adminId)).limit(1);
    const tokenRecord = tokens[0];
    
    if (!tokenRecord) return null;

    const now = new Date();
    const expiresAt = new Date(tokenRecord.expiresAt);
    const bufferTime = 5 * 60 * 1000; // 5 minutes

    // If token is still valid (with 5 min buffer)
    if (expiresAt.getTime() - now.getTime() > bufferTime) {
      return EncryptionService.decrypt(tokenRecord.accessTokenEncrypted);
    }

    // 2. Token is expired or expiring soon, refresh it
    console.log(`Token for admin ${adminId} expiring, refreshing...`);
    const refreshToken = EncryptionService.decrypt(tokenRecord.refreshTokenEncrypted);
    
    const { getOAuth2Client } = await import('./oauth');
    const oauth2Client = getOAuth2Client();
    oauth2Client.setCredentials({ refresh_token: refreshToken });
    
    const { credentials } = await oauth2Client.refreshAccessToken();
    
    if (!credentials.access_token) {
      throw new Error('Failed to refresh access token');
    }

    const newExpiry = credentials.expiry_date ? new Date(credentials.expiry_date) : new Date(now.getTime() + 3600 * 1000);

    // 3. Save new token
    await db.update(oauthTokens).set({
      accessTokenEncrypted: EncryptionService.encrypt(credentials.access_token),
      expiresAt: newExpiry,
      updatedAt: new Date()
    }).where(eq(oauthTokens.adminId, adminId));

    return credentials.access_token;
  }
}
