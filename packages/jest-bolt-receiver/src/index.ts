import { events } from '@slack-wrench/fixtures';
import {
  BlockButtonAction,
  MessageEvent,
  Receiver,
  ReceiverEvent,
  SlashCommand,
} from '@slack/bolt';
import { EventEmitter } from 'events';

interface ButtonActionArgs {
  action_id?: string;
  block_id?: string;
  value?: string;
}

export default class JestReceiver extends EventEmitter implements Receiver {
  private send(body: Record<string, any>): ReceiverEvent {
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

  // For Events that fall under "Base Events"
  // https://github.com/slackapi/bolt/blob/master/src/types/events/base-events.ts
  private sendEvent(body: Record<string, any>): ReceiverEvent {
    return this.send({ event: body });
  }

  sendMessage(text: string, options?: Partial<MessageEvent>): ReceiverEvent {
    return this.sendEvent(events.message(text, options));
  }

  sendSlashCommand(
    name: string,
    options?: Partial<SlashCommand>,
  ): ReceiverEvent {
    return this.send(events.slashCommand(name, options));
  }

  sendBlockButtonAction(
    action: ButtonActionArgs,
    options?: Partial<BlockButtonAction>,
  ): ReceiverEvent {
    return this.send(events.blockButtonAction(action, options));
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
