import crypto from 'crypto';

const ALGORITHM = 'aes-256-gcm';

function getRawKey(): string {
  if (process.env.NODE_ENV === 'production' && !process.env.ENCRYPTION_KEY) {
    throw new Error('ENCRYPTION_KEY environment variable must be set in production');
  }
  return process.env.ENCRYPTION_KEY || 'development_fallback_key_that_is_32_bytes_long_1234';
}

export class EncryptionService {
  static encrypt(text: string): string {
    const ENCRYPTION_KEY = getRawKey();
    const iv = crypto.randomBytes(16);
    const cipher = crypto.createCipheriv(ALGORITHM, Buffer.from(ENCRYPTION_KEY, 'hex'), iv);
    
    let encrypted = cipher.update(text, 'utf8', 'hex');
    encrypted += cipher.final('hex');
    const authTag = cipher.getAuthTag().toString('hex');
    
    // Format: iv:authTag:encryptedText
    return `${iv.toString('hex')}:${authTag}:${encrypted}`;
  }

  static decrypt(encryptedText: string): string {
    const ENCRYPTION_KEY = getRawKey();
    const parts = encryptedText.split(':');
    if (parts.length !== 3) throw new Error('Invalid encrypted text format');
    
    const iv = Buffer.from(parts[0], 'hex');
    const authTag = Buffer.from(parts[1], 'hex');
    const encrypted = parts[2];
    
    const decipher = crypto.createDecipheriv(ALGORITHM, Buffer.from(ENCRYPTION_KEY, 'hex'), iv);
    decipher.setAuthTag(authTag);
    
    let decrypted = decipher.update(encrypted, 'hex', 'utf8');
    decrypted += decipher.final('utf8');
    
    return decrypted;
  }
}
