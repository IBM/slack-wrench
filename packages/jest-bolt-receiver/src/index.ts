import { App, Receiver, ReceiverEvent } from '@slack/bolt';

export default class JestReceiver implements Receiver {
  private app: App | undefined;

  public init(app: App): void {
    this.app = app;
  }

  public async send(body: Record<string, any>): Promise<ReceiverEvent> {
    const event: ReceiverEvent = {
      body,
      ack: jest.fn(),
    };

    // Is called, `app` will never be undefined
    /* istanbul ignore next */
    await this.app?.processEvent(event);

    return event;
  }

  // For compatibility with Receiver, does nothing
  /* istanbul ignore next */
  // eslint-disable-next-line class-methods-use-this
  start(): Promise<unknown> {
    return Promise.resolve();
  }

  // For compatibility with Receiver, does nothing
  /* istanbul ignore next */
  // eslint-disable-next-line class-methods-use-this
  stop(): Promise<unknown> {
    return Promise.resolve();
  }
}
