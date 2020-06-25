import { actions, events, slashCommand } from '@slack-wrench/fixtures';
import { App } from '@slack/bolt';

import JestReceiver from './index';

describe('Jest Bolt receiver', () => {
  let receiver: JestReceiver;
  let app: App;

  beforeEach(() => {
    receiver = new JestReceiver();
    app = new App({ receiver, token: '' });
  });

  it('Can send a slash command', async () => {
    expect.assertions(1);

    const command = '/command';
    const listener = jest.fn();

    app.command(command, listener);
    await receiver.send(slashCommand(command));

    expect(listener).toHaveBeenCalledTimes(1);
  });

  it('can send a block button event', async () => {
    expect.assertions(1);

    const action_id = 'button-id';
    const listener = jest.fn();

    app.action(action_id, listener);
    await receiver.send(actions.blockButtonAction({ action_id }));

    expect(listener).toHaveBeenCalledTimes(1);
  });

  it('can send a message event', async () => {
    expect.assertions(1);

    const message = 'hello';
    const listener = jest.fn();

    app.message(message, listener);
    await receiver.send(events.message(message));

    expect(listener).toHaveBeenCalledTimes(1);
  });

  it('Can start and stop without errors', async () => {
    expect.assertions(2);

    await expect(app.start()).resolves.toEqual(undefined);
    await expect(app.stop()).resolves.toEqual(undefined);
  });
});
