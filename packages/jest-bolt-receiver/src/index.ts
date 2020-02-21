import { Receiver, ReceiverEvent } from '@slack/bolt';
import { EventEmitter } from 'events';

export default class JestReceiver extends EventEmitter implements Receiver {
  public send(body: Record<string, any>): ReceiverEvent {
    const event: ReceiverEvent = {
      body,
      ack: jest.fn(),
    };

    if (body.response_url) {
      event.respond = jest.fn();
    }

    this.emit('message', event);

    return event;
  }

  // For compatibility with Receiver, does nothing
  // eslint-disable-next-line class-methods-use-this
  start(): Promise<unknown> {
    return Promise.resolve();
  }

  // For compatibility with Receiver, does nothing
  // eslint-disable-next-line class-methods-use-this
  stop(): Promise<unknown> {
    return Promise.resolve();
  }
}
