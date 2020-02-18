import { events, ServerlessTester } from '@slack-wrench/fixtures';
import { App, ExpressReceiver } from '@slack/bolt';

describe('Serverless Tester', () => {
  let app: App;
  let receiver: ExpressReceiver;
  let handler: ServerlessTester;
  let listener: jest.Mock;
  let expressMiddleware: jest.Mock;

  const command = '/command';

  const setupFixtures = (endpoints?: Record<string, string>) => {
    const signingSecret = '';
    receiver = new ExpressReceiver({ signingSecret, endpoints });

    app = new App({ receiver, token: '' });

    listener = jest.fn(({ ack }) => {
      ack();
    });

    expressMiddleware = jest.fn((req, res) => res.send(200));

    app.command(command, listener);
    handler = new ServerlessTester(receiver.app, signingSecret);

    receiver.app.use('/', expressMiddleware);
  };

  it('can be used by a bolt app', async () => {
    expect.assertions(2);

    setupFixtures();

    const result = await handler.sendSlackEvent(events.slashCommand(command));

    expect(listener).toHaveBeenCalled();
    expect(result.statusCode).toEqual(200);
  });

  it('can be used by a bolt with non-default routes', async () => {
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

  it('Will respond from non-bolt express routes', async () => {
    expect.assertions(2);

    const result = await handler.sendHttp({
      httpMethod: 'POST',
      path: '/',
    });

    expect(expressMiddleware).toHaveBeenCalled();
    expect(result.statusCode).toEqual(200);
  });
});
