export interface QueueAdapter {
  publish(topicOrUrl: string, body: any, options?: { delaySeconds?: number }): Promise<string>;
  cancel(messageId: string): Promise<void>;
}
