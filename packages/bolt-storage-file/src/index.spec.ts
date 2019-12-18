import delay from 'delay';
import fs from 'fs-extra';
import path from 'path';
import shortid from 'shortid';

import FileStore from './index';

describe('FileStore', () => {
  const defaultDbPath = path.join(process.cwd(), `.db`);
  let dbPath: string;
  let store: FileStore;
  let id: string;
  let initialState: Record<string, any>;

  beforeEach(() => {
    // level-db doesn't work when being quickly recreated in the same dir
    dbPath = path.join(__dirname, `.db-${shortid.generate()}`);
    store = new FileStore(dbPath);

    id = 'CONVERSATION_ID';
    initialState = { rainbowDashIs20PercentCooler: true };
  });

  afterEach(async () => {
    await fs.remove(dbPath);
    await fs.remove(defaultDbPath);
  });

  it('creates a db at a default location', async () => {
    expect.assertions(1);
    const defaultStore = new FileStore();

    // Setting something to ensure the db is created on disk
    await defaultStore.set(id, initialState);

    expect(await fs.pathExists(defaultDbPath)).toEqual(true);
  });

  // Reference tests rewritten for jest:
  // https://github.com/slackapi/bolt/blob/d59319c550804426d257009128d13312889c4d21/src/conversation-store.spec.ts#L115
  describe('tests from default bolt store', () => {
    it('should store conversation state', async () => {
      expect.assertions(1);

      await store.set(id, initialState);
      const actualConversationState = await store.get(id);

      expect(actualConversationState).toEqual(initialState);
    });

    it('should reject lookup of conversation state when the conversation is not stored', async () => {
      expect.assertions(1);
      await expect(store.get(id)).rejects.toThrowError(
        `Key not found in database [${id}]`,
      );
    });

    it('should reject lookup of conversation state when the conversation is expired', async () => {
      expect.assertions(1);
      const expiresInMs = 5;

      await store.set(id, initialState, Date.now() + expiresInMs);
      await delay(expiresInMs * 2);

      await expect(store.get(id)).rejects.toThrowError('Conversation expired');
    });
  });
});
