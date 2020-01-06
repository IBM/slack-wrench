import { fields } from '@slack-wrench/fixtures';
import { App } from '@slack/bolt';
import delay from 'delay';

import JestReceiver from './index';

describe('Jest Bolt receiver', () => {
  let receiver: JestReceiver;
  let app: App;

  beforeEach(() => {
    receiver = new JestReceiver();
    app = new App({ receiver, token: fields.token });
  });

  it('Can send a slash command', async () => {
    expect.assertions(1);

    const command = '/command';
    const listener = jest.fn();

    app.command(command, listener);
    receiver.sendSlashCommand(command);
    await delay(0);

    expect(listener).toHaveBeenCalledTimes(1);
  });

  it('can send a block button event', async () => {
    expect.assertions(1);

    const action_id = 'button-id';
    const listener = jest.fn();

    app.action(action_id, listener);
    receiver.sendBlockButtonAction({ action_id });
    await delay(0);

    expect(listener).toHaveBeenCalledTimes(1);
  });

  it('sets a `respond` function for interactive messages', async () => {
    expect.assertions(2);

    const action_id = 'button-id';

    app.action(action_id, ({ respond }) => {
      expect(jest.isMockFunction(respond)).toEqual(true);
      respond('You Clicked it!');
    });

    const { respond } = receiver.sendBlockButtonAction({ action_id });
    await delay(0);

    expect(respond).toHaveBeenCalledTimes(1);
  });

  it('can send a message event', async () => {
    expect.assertions(1);

    const message = 'hello';
    const listener = jest.fn();

    app.message(message, listener);
    receiver.sendMessage(message);
    await delay(0);

    expect(listener).toHaveBeenCalledTimes(1);
  });

  it('Can start and stop without errors', async () => {
    expect.assertions(2);

    await expect(app.start()).resolves.toEqual(undefined);
    await expect(app.stop()).resolves.toEqual(undefined);
  });
});
