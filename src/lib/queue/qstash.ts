import { Client } from '@upstash/qstash';
import { QueueAdapter } from './adapter';

const qstashClient = new Client({
  token: process.env.QSTASH_TOKEN || '',
});

export class QStashAdapter implements QueueAdapter {
  async publish(url: string, body: any, options?: { delaySeconds?: number }): Promise<string> {
    const res = await qstashClient.publishJSON({
      url,
      body,
      delay: options?.delaySeconds ? options.delaySeconds : undefined,
    });
    return (res as any).messageId || '';
  }

  async cancel(messageId: string): Promise<void> {
    await qstashClient.messages.delete(messageId);
  }
}

export const queue = new QStashAdapter();
