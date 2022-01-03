import { WebClient, WebClientOptions } from '@slack/web-api';

const mockApi = (): jest.Mock => jest.fn().mockResolvedValue({ ok: true });

/**
 * This class is mocking slack's `web-api` WebClient.ts. In order to get the
 * typings correct, this file needs to be pretty verbose. As such, this file is
 * copied from its source, and modified to expose a mockApi instead of its
 * actual call. When modifying this file, please keep it in line with its source.
 *
 * Source File: https://github.com/slackapi/node-slack-sdk/blob/main/packages/web-api/src/WebClient.ts
 *
 * Disabling prefer-default-export as jest doesn't like modules, but typescript does
 */
export class MockWebClient implements Partial<WebClient> {
  public apiCall = mockApi();

  /**
   * admin method family
   */
  public readonly admin = {
    apps: {
      approve: mockApi(),
      approved: {
        list: mockApi(),
      },
      requests: {
        list: mockApi(),
      },
      restrict: mockApi(),
      restricted: {
        list: mockApi(),
      },
    },
    conversations: {
      setTeams: mockApi(),
      restrictAccess: {
        addGroup: mockApi(),
        listGroups: mockApi(),
        removeGroup: mockApi(),
      },
    },
    inviteRequests: {
      approve: mockApi(),
      deny: mockApi(),
      list: mockApi(),
      approved: {
        list: mockApi(),
      },
      denied: {
        list: mockApi(),
      },
    },
    teams: {
      admins: {
        list: mockApi(),
      },
      create: mockApi(),
      list: mockApi(),
      owners: {
        list: mockApi(),
      },
      settings: {
        info: mockApi(),
        setDefaultChannels: mockApi(),
        setDescription: mockApi(),
        setDiscoverability: mockApi(),
        setIcon: mockApi(),
        setName: mockApi(),
      },
    },
    usergroups: {
      addChannels: mockApi(),
      addTeams: mockApi(),
      listChannels: mockApi(),
      removeChannels: mockApi(),
    },
    users: {
      session: {
        reset: mockApi(),
      },
      assign: mockApi(),
      invite: mockApi(),
      list: mockApi(),
      remove: mockApi(),
      setAdmin: mockApi(),
      setExpiration: mockApi(),
      setOwner: mockApi(),
      setRegular: mockApi(),
    },
  };

  /**
   * api method family
   */
  public readonly api = {
    test: mockApi(),
  };

  /**
   * auth method family
   */
  public readonly auth = {
    revoke: mockApi(),
    test: mockApi(),
  };

  /**
   * bots method family
   */
  public readonly bots = {
    info: mockApi(),
  };

  /**
   * calls method family
   */
  public readonly calls = {
    add: mockApi(),
    end: mockApi(),
    info: mockApi(),
    update: mockApi(),
    participants: {
      add: mockApi(),
      remove: mockApi(),
    },
  };

  /**
   * channels method family
   */
  public readonly channels = {
    archive: mockApi(),
    create: mockApi(),
    history: mockApi(),
    info: mockApi(),
    invite: mockApi(),
    join: mockApi(),
    kick: mockApi(),
    leave: mockApi(),
    list: mockApi(),
    mark: mockApi(),
    rename: mockApi(),
    replies: mockApi(),
    setPurpose: mockApi(),
    setTopic: mockApi(),
    unarchive: mockApi(),
  };

  /**
   * chat method family
   */
  public readonly chat = {
    delete: mockApi(),
    deleteScheduledMessage: mockApi(),
    getPermalink: mockApi(),
    meMessage: mockApi(),
    postEphemeral: mockApi(),
    postMessage: mockApi(),
    scheduleMessage: mockApi(),
    scheduledMessages: {
      list: mockApi(),
    },
    unfurl: mockApi(),
    update: mockApi(),
  };

  /**
   * conversations method family
   */
  public readonly conversations = {
    archive: mockApi(),
    close: mockApi(),
    create: mockApi(),
    history: mockApi(),
    info: mockApi(),
    invite: mockApi(),
    join: mockApi(),
    kick: mockApi(),
    leave: mockApi(),
    list: mockApi(),
    mark: mockApi(),
    members: mockApi(),
    open: mockApi(),
    rename: mockApi(),
    replies: mockApi(),
    setPurpose: mockApi(),
    setTopic: mockApi(),
    unarchive: mockApi(),
  };

  /**
   * view method family
   */
  public readonly views = {
    open: mockApi(),
    publish: mockApi(),
    push: mockApi(),
    update: mockApi(),
  };

  /**
   * dialog method family
   */
  public readonly dialog = {
    open: mockApi(),
  };

  /**
   * dnd method family
   */
  public readonly dnd = {
    endDnd: mockApi(),
    endSnooze: mockApi(),
    info: mockApi(),
    setSnooze: mockApi(),
    teamInfo: mockApi(),
  };

  /**
   * emoji method family
   */
  public readonly emoji = {
    list: mockApi(),
  };

  /**
   * files method family
   */
  public readonly files = {
    delete: mockApi(),
    info: mockApi(),
    list: mockApi(),
    revokePublicURL: mockApi(),
    sharedPublicURL: mockApi(),
    upload: mockApi(),
    comments: {
      delete: mockApi(),
    },
    remote: {
      info: mockApi(),
      list: mockApi(),
      add: mockApi(),
      update: mockApi(),
      remove: mockApi(),
      share: mockApi(),
    },
  };

  /**
   * groups method family
   */
  public readonly groups = {
    archive: mockApi(),
    create: mockApi(),
    createChild: mockApi(),
    history: mockApi(),
    info: mockApi(),
    invite: mockApi(),
    kick: mockApi(),
    leave: mockApi(),
    list: mockApi(),
    mark: mockApi(),
    open: mockApi(),
    rename: mockApi(),
    replies: mockApi(),
    setPurpose: mockApi(),
    setTopic: mockApi(),
    unarchive: mockApi(),
  };

  /**
   * im method family
   */
  public readonly im = {
    close: mockApi(),
    history: mockApi(),
    list: mockApi(),
    mark: mockApi(),
    open: mockApi(),
    replies: mockApi(),
  };

  /**
   * migration method family
   */
  public readonly migration = {
    exchange: mockApi(),
  };

  /**
   * mpim method family
   */
  public readonly mpim = {
    close: mockApi(),
    history: mockApi(),
    list: mockApi(),
    mark: mockApi(),
    open: mockApi(),
    replies: mockApi(),
  };

  /**
   * oauth method family
   */
  public readonly oauth = {
    access: mockApi(),
    v2: {
      access: mockApi(),
    },
  };

  /**
   * pins method family
   */
  public readonly pins = {
    add: mockApi(),
    list: mockApi(),
    remove: mockApi(),
  };

  /**
   * reactions method family
   */
  public readonly reactions = {
    add: mockApi(),
    get: mockApi(),
    list: mockApi(),
    remove: mockApi(),
  };

  /**
   * reminders method family
   */
  public readonly reminders = {
    add: mockApi(),
    complete: mockApi(),
    delete: mockApi(),
    info: mockApi(),
    list: mockApi(),
  };

  /**
   * rtm method family
   */
  public readonly rtm = {
    connect: mockApi(),
    start: mockApi(),
  };

  /**
   * search method family
   */
  public readonly search = {
    all: mockApi(),
    files: mockApi(),
    messages: mockApi(),
  };

  /**
   * stars method family
   */
  public readonly stars = {
    add: mockApi(),
    list: mockApi(),
    remove: mockApi(),
  };

  /**
   * team method family
   */
  public readonly team = {
    accessLogs: mockApi(),
    billableInfo: mockApi(),
    info: mockApi(),
    integrationLogs: mockApi(),
    profile: {
      get: mockApi(),
    },
  };

  /**
   * usergroups method family
   */
  public readonly usergroups = {
    create: mockApi(),
    disable: mockApi(),
    enable: mockApi(),
    list: mockApi(),
    update: mockApi(),
    users: {
      list: mockApi(),
      update: mockApi(),
    },
  };

  /**
   * users method family
   */
  public readonly users = {
    conversations: mockApi(),
    deletePhoto: mockApi(),
    getPresence: mockApi(),
    identity: mockApi(),
    info: mockApi(),
    list: mockApi(),
    lookupByEmail: mockApi(),
    setPhoto: mockApi(),
    setPresence: mockApi(),
    profile: {
      get: mockApi(),
      set: mockApi(),
    },
  };

  public constructor() {
    // Default for bolt apps
    // https://github.com/slackapi/bolt-js/blob/1655999346077e9521722a667414758da856ede2/src/App.ts#L579
    this.auth.test.mockResolvedValue({
      ok: true,
      user_id: 'BOT_USER_ID',
      bot_id: 'BOT_ID',
    });
  }
}

export const MockedWebClient: jest.MockInstance<
  MockWebClient,
  [string?, WebClientOptions?]
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore Typing seems to be wrong, this can take a class
> = jest.fn().mockImplementation(MockWebClient);

const mockWebApi = (jestModule: typeof jest): jest.Mock => {
  const mock: jest.Mock = jestModule.genMockFromModule('@slack/web-api');

  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore Based on previous ignore, unsure how to set this to the whole module
  mock.WebClient = MockedWebClient;

  return mock;
};

export default mockWebApi;
