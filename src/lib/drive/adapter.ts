import { google, drive_v3 } from 'googleapis';
import { Readable } from 'stream';

export class DriveAdapter {
  private drive: drive_v3.Drive;

  constructor(accessToken: string) {
    const auth = new google.auth.OAuth2();
    auth.setCredentials({ access_token: accessToken });
    this.drive = google.drive({ version: 'v3', auth });
  }

  /**
   * Find a file by its original Line Message ID (stored in appProperties)
   * Deduplication check.
   */
  async findByAppFileId(appFileId: string): Promise<string | null> {
    const res = await this.drive.files.list({
      q: `appProperties has { key='appFileId' and value='${appFileId}' } and trashed = false`,
      fields: 'files(id, name)',
      spaces: 'drive',
    });

    const files = res.data.files;
    if (files && files.length > 0) {
      return files[0].id!;
    }
    return null;
  }

  async createFolder(name: string, parentFolderId?: string): Promise<string> {
    const fileMetadata: any = {
      name,
      mimeType: 'application/vnd.google-apps.folder',
    };
    if (parentFolderId) {
      fileMetadata.parents = [parentFolderId];
    }
    const res = await this.drive.files.create({
      requestBody: fileMetadata,
      fields: 'id',
    });
    return res.data.id!;
  }

  /**
   * Upload a file with app properties for idempotency
   */
  async upload(name: string, mimeType: string, content: Buffer | Readable, appFileId: string, parentFolderId?: string): Promise<string> {
    
    // Deduplication check
    const existing = await this.findByAppFileId(appFileId);
    if (existing) {
      return existing; // Idempotent return
    }

    const fileMetadata: any = {
      name,
      appProperties: {
        appFileId,
      },
    };

    if (parentFolderId) {
      fileMetadata.parents = [parentFolderId];
    }

    const media = {
      mimeType,
      body: content instanceof Buffer ? Readable.from(content) : content,
    };

    const res = await this.drive.files.create({
      requestBody: fileMetadata,
      media: media,
      fields: 'id',
    });

    return res.data.id!;
  }
}
