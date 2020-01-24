import { Config } from '../../config';
import loadConfig from '../../load-config';
import integration from '../../test/integration';
import events from './events';

type RequiredKey<T, K extends keyof T> = Exclude<T, K> & Required<Pick<T, K>>;

describe('apply events', () => {
  let config: RequiredKey<Config, 'events'>;

  beforeEach(() => {
    config = {
      version: 'v1.0',
      id: 'AS7PZ4B2N',
      baseUrl: 'https://example.com',
      events: {
        requestPath: '/slack/events',
      },
    };
  });

  integration(({ client, baseUrl, fetchApp }) => {
    const eventFixture = {
      botEvents: ['app_mention'],
      workspaceEvents: ['message.im'],
      unfurlDomains: ['ibm.com', 'twitter.com'],
    };

    beforeEach(async () => {
      // Load up config, relies on a slack.local.config with a test app
      const localConfig = await loadConfig();
      config.id = localConfig.id;
      config.baseUrl = baseUrl();
    });

    it('can apply bot events', async () => {
      expect.assertions(1);

      config.events.botEvents = eventFixture.botEvents;

      await events(config, client);
      const updatedConfig = await fetchApp(config.id);

      expect(updatedConfig.event_subscriptions.bot_events).toEqual(
        eventFixture.botEvents,
      );
    });

    it('can apply workspace events', async () => {
      expect.assertions(1);

      config.events.workspaceEvents = eventFixture.workspaceEvents;

      await events(config, client);
      const updatedConfig = await fetchApp(config.id);

      expect(updatedConfig.event_subscriptions.user_events).toEqual(
        eventFixture.workspaceEvents,
      );
    });

    it('can apply unfurl domains', async () => {
      expect.assertions(1);

      config.events.unfurlDomains = eventFixture.unfurlDomains;

      await events(config, client);

      const updatedConfig = await fetchApp(config.id);

      expect(updatedConfig.event_subscriptions.unfurl_domains).toEqual(
        eventFixture.unfurlDomains,
      );
    });

    it('can apply everything at once', async () => {
      expect.assertions(1);

      config.events = { ...config.events, ...eventFixture };

      await events(config, client);

      const updatedConfig = await fetchApp(config.id);

      expect(updatedConfig.event_subscriptions).toEqual(
        expect.objectContaining({
          bot_events: eventFixture.botEvents,
          user_events: eventFixture.workspaceEvents,
          unfurl_domains: eventFixture.unfurlDomains,
        }),
      );
    });
  });
});
