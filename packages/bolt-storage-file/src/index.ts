import { ConversationStore } from '@slack/bolt';
import encode from 'encoding-down';
import leveldown from 'leveldown';
import levelup, { LevelUp } from 'levelup';

/**
 * File implementation of Bolt ConversationStore
 */
export default class FileStore<ConversationState = unknown>
  implements ConversationStore<ConversationState> {
  private db: LevelUp;

  constructor(path = './.db') {
    this.db = levelup(encode(leveldown(path), { valueEncoding: 'json' }));
  }

  async set(
    conversationId: string,
    value: ConversationState,
    expiresAt?: number,
  ): Promise<void> {
    await this.db.put(conversationId, { value, expiresAt });
  }

  async get(conversationId: string): Promise<ConversationState> {
    const entry = await this.db.get(conversationId);

    if (entry.expiresAt !== undefined && Date.now() > entry.expiresAt) {
      // release the memory
      await this.db.del(conversationId);

      throw new Error('Conversation expired');
    }

    return entry.value;
  }
}
