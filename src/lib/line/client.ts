import { messagingApi } from '@line/bot-sdk';
import { Readable } from 'stream';

const { MessagingApiClient, MessagingApiBlobClient } = messagingApi;

const channelAccessToken = process.env.LINE_CHANNEL_ACCESS_TOKEN || '';

export const lineClient = new MessagingApiClient({
  channelAccessToken,
});

export const lineBlobClient = new MessagingApiBlobClient({
  channelAccessToken,
});

export class LineService {
  /**
   * Fetches binary content of a message from LINE servers
   */
  static async getMessageContent(messageId: string): Promise<Buffer> {
    const stream = await lineBlobClient.getMessageContent(messageId);
    
    // Line SDK returns a Readable stream for blob data in current versions
    // Convert ReadableStream / Node Stream to Buffer
    const chunks: any[] = [];
    
    // Depending on the Node.js version and @line/bot-sdk version, 
    // it could be a web ReadableStream or a node stream.
    if ((stream as any).getReader) {
      // Web Stream
      const reader = (stream as unknown as ReadableStream<Uint8Array>).getReader();
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        if (value) chunks.push(value);
      }
      return Buffer.concat(chunks);
    } else {
      // Node Stream
      for await (const chunk of stream as unknown as NodeJS.ReadableStream) {
        chunks.push(chunk);
      }
      return Buffer.concat(chunks);
    }
  }

  /**
   * Fetches message content as a Readable stream to prevent memory exhaustion
   */
  static async getMessageContentStream(messageId: string): Promise<Readable> {
    const stream = await lineBlobClient.getMessageContent(messageId);
    
    if ((stream as any).getReader) {
      return Readable.fromWeb(stream as any);
    }
    return stream as unknown as Readable;
  }

  /**
   * Pushes a text message to a user or group
   */
  static async pushMessage(to: string, text: string): Promise<void> {
    await lineClient.pushMessage({
      to,
      messages: [{ type: 'text', text }],
    });
  }

  /**
   * Replies to a specific message using replyToken
   */
  static async replyMessage(replyToken: string, messages: any[]): Promise<void> {
    await lineClient.replyMessage({
      replyToken,
      messages,
    });
  }

  /**
   * Sends the connect card (Flex Message)
   */
  static async sendConnectCard(lineGroupId: string, replyToken: string): Promise<void> {
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : 'http://localhost:3000';
    const connectUrl = `${baseUrl}/login?connect=${lineGroupId}`;
    
    const flexMessage = {
      type: 'flex',
      altText: 'เชื่อมต่อ Google Drive',
      contents: {
        type: 'bubble',
        hero: {
          type: 'image',
          url: 'https://cdn-icons-png.flaticon.com/512/2965/2965306.png', // Google Drive icon placeholder
          size: 'full',
          aspectRatio: '20:13',
          aspectMode: 'cover',
          backgroundColor: '#F4F7FE'
        },
        body: {
          type: 'box',
          layout: 'vertical',
          contents: [
            {
              type: 'text',
              text: 'เชื่อมต่อ Linedrive',
              weight: 'bold',
              size: 'xl',
              color: '#1e293b'
            },
            {
              type: 'text',
              text: 'กดปุ่มด้านล่างเพื่อผูกกลุ่มนี้เข้ากับบัญชี Google Drive ของคุณ',
              margin: 'md',
              wrap: true,
              color: '#64748b',
              size: 'sm'
            }
          ]
        },
        footer: {
          type: 'box',
          layout: 'vertical',
          spacing: 'sm',
          contents: [
            {
              type: 'button',
              style: 'primary',
              height: 'md',
              color: '#2563eb',
              action: {
                type: 'uri',
                label: 'ล็อกอินและเชื่อมต่อ',
                uri: connectUrl
              }
            }
          ]
        }
      }
    };

    await this.replyMessage(replyToken, [flexMessage]);
  }

  /**
   * Sends a warning that the group is not connected, along with the connect card
   */
  static async sendConnectWarning(lineGroupId: string, replyToken: string): Promise<void> {
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : 'http://localhost:3000';
    const connectUrl = `${baseUrl}/login?connect=${lineGroupId}`;
    
    const messages = [
      {
        type: 'text',
        text: '⚠️ ยังไม่ได้เชื่อมต่อ Google Drive ครับ\nไฟล์ที่คุณส่งมายังไม่ได้ถูกบันทึก กรุณาเชื่อมต่อก่อนแล้วส่งใหม่อีกครั้งนะครับ'
      },
      {
        type: 'flex',
        altText: 'เชื่อมต่อ Google Drive',
        contents: {
          type: 'bubble',
          body: {
            type: 'box',
            layout: 'vertical',
            contents: [
              {
                type: 'text',
                text: 'ตั้งค่าการบันทึกไฟล์',
                weight: 'bold',
                size: 'lg'
              },
              {
                type: 'text',
                text: 'คลิกด้านล่างเพื่อล็อกอินและตั้งค่า',
                margin: 'md',
                wrap: true,
                color: '#64748b',
                size: 'sm'
              }
            ]
          },
          footer: {
            type: 'box',
            layout: 'vertical',
            contents: [
              {
                type: 'button',
                style: 'primary',
                height: 'sm',
                color: '#2563eb',
                action: {
                  type: 'uri',
                  label: 'ตั้งค่า Google Drive',
                  uri: connectUrl
                }
              }
            ]
          }
        }
      }
    ];

    await this.replyMessage(replyToken, messages);
  }

  /**
   * Gets a user's profile from a group. Useful to verify group membership.
   */
  static async getGroupMemberProfile(groupId: string, userId: string) {
    try {
      const profile = await lineClient.getGroupMemberProfile(groupId, userId);
      return profile;
    } catch (error) {
      // If user is not in the group, LINE API returns a 404
      return null;
    }
  }
}
