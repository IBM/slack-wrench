import Router from '@koa/router';
import { events, ServerlessTester } from '@slack-wrench/fixtures';
import { App, ExpressReceiver } from '@slack/bolt';
import Koa, { Middleware } from 'koa';

import koaBolt from './index';

const identityRoute = (path: string): Middleware<any, any> => {
  const route = new Router();

  route.get(path, ctx => {
    ctx.body = path;
  });

  return route.middleware();
};

describe('Koa Bolt Middleware', () => {
  let app: Koa;
  let bolt: App;
  let receiver: ExpressReceiver;
  let handler: ServerlessTester;
  let listener: jest.Mock;

  const rootPath = '/';
  const nonRootPath = '/some/interesting/path';

  const command = '/command';

  const setupFixtures = (endpoints?: Record<string, string>) => {
    const signingSecret = '';
    receiver = new ExpressReceiver({ signingSecret, endpoints });

    bolt = new App({ receiver, token: '' });

    listener = jest.fn(({ ack }) => {
      ack();
    });

    bolt.command(command, listener);

    app = new Koa();
    app.use(identityRoute(rootPath));
    app.use(koaBolt({ receiver, endpoints }));
    app.use(identityRoute(nonRootPath));
    handler = new ServerlessTester(app, signingSecret);
  };

  beforeEach(() => {
    setupFixtures();
  });

  it('can be used by a koa app', async () => {
    expect.assertions(2);

    const result = await handler.sendSlackEvent(events.slashCommand(command));

    expect(listener).toHaveBeenCalled();
    expect(result.statusCode).toEqual(200);
  });

  it('Will respond from non-bolt routes', async () => {
    expect.assertions(3);

    const rootResponse = await handler.sendHttp({
      httpMethod: 'GET',
      path: rootPath,
    });

    const nonRootResponse = await handler.sendHttp({
      httpMethod: 'GET',
      path: nonRootPath,
    });

    expect(listener).not.toHaveBeenCalled();
    expect(rootResponse.body).toEqual(rootPath);
    expect(nonRootResponse.body).toEqual(nonRootPath);
  });

  it('Can handle slack events sent to non-default paths', async () => {
    expect.assertions(2);

    const eventPath = '/slack/event/custom/route';

    setupFixtures({ events: eventPath });

    const result = await handler.sendSlackEvent(
      events.slashCommand(command),
      eventPath,
    );

    expect(listener).toHaveBeenCalled();
    expect(result.statusCode).toEqual(200);
  });
});
