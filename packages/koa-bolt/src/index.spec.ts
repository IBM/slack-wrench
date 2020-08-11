import Router from '@koa/router';
import { ServerlessTester, slashCommand } from '@slack-wrench/fixtures';
import { App, ExpressReceiver, SlackCommandMiddlewareArgs } from '@slack/bolt';
import Koa, { Middleware } from 'koa';

import koaBolt from './index';

const identityRoute = (path: string): Middleware<any, any> =>
  new Router()
    .get(path, (ctx) => {
      ctx.body = path;
    })
    .middleware();

describe('Koa Bolt Middleware', () => {
  let handler: ServerlessTester;
  let listener: jest.Mock;

  const beforePath = '/before/path';
  const afterPath = '/after/path';

  const command = '/command';

  const setupFixtures = (endpoints?: Record<string, string>) => {
    const signingSecret = '';
    const receiver = new ExpressReceiver({ signingSecret, endpoints });

    const bolt = new App({ receiver, token: '' });

    listener = jest.fn(async ({ ack }: SlackCommandMiddlewareArgs) => {
      await ack();
    });

    bolt.command(command, listener);

    const app = new Koa();
    app.use(identityRoute(beforePath));
    app.use(koaBolt({ receiver, endpoints }));
    app.use(identityRoute(afterPath));
    handler = new ServerlessTester(app, signingSecret);
  };

  beforeEach(() => {
    setupFixtures();
  });

  it('can be used by a koa app', async () => {
    expect.assertions(2);

    const result = await handler.sendSlackEvent(slashCommand(command));

    expect(listener).toHaveBeenCalled();
    expect(result.statusCode).toEqual(200);
  });

  it('will respond from non-bolt routes defined before koaBolt', async () => {
    expect.assertions(2);

    const rootResponse = await handler.sendHttp({
      httpMethod: 'GET',
      path: beforePath,
    });

    expect(listener).not.toHaveBeenCalled();
    expect(rootResponse.body).toEqual(beforePath);
  });

  it('will respond from non-bolt routes defined after koaBolt', async () => {
    expect.assertions(2);

    const nonRootResponse = await handler.sendHttp({
      httpMethod: 'GET',
      path: afterPath,
    });

    expect(listener).not.toHaveBeenCalled();
    expect(nonRootResponse.body).toEqual(afterPath);
  });

  it('can handle slack events sent to non-default paths', async () => {
    expect.assertions(2);

    const eventPath = '/slack/event/custom/route';

    setupFixtures({ events: eventPath });

    const result = await handler.sendSlackEvent(
      slashCommand(command),
      eventPath,
    );

    expect(listener).toHaveBeenCalled();
    expect(result.statusCode).toEqual(200);
  });
});
