# Jest Bolt Receiver

A [receiver](https://slack.dev/bolt/concepts#receiver) built for testing Slack Bolt apps with Jest. This receiver allows you to easily send mock events to your app and write consistent tests.

## Table of Contents

- [Install](#install)
- [Usage](#usage)
  - [Sending Events](#sending-events)

## Install

```bash
yarn add --dev @slack-wrench/jest-bolt-receiver
# or
npm install --save-dev @slack-wrench/jest-bolt-receiver
```

## Usage

```typescript
import JestReceiver from '@slack-wrench/jest-bolt-receiver';
import delay from 'delay';

// Import your app that creates a Slack Bolt App.
import MyApp from './app';

describe('My Awesome App', () => {
  let receiver: JestReceiver;
  let app: MyApp;

  beforeEach(() => {
    receiver = new JestReceiver();
    // Pass in this receiver instead of yours or the default express one
    app = new MyApp({ receiver });
  });

  it('Can handle a slash command', async () => {
    receiver.sendSlashCommand('/my-apps-command', { text: 'I called it!' });
    await delay(0); // Wait for anything async.

    // Test what should have happened.
    expect();
  });
});
```

### Sending Events

This project uses [@slack-wrench/fixtures](../fixtures) to generate and send events. As such, it supports all of the features it does like global overrides and customizing payloads. Check it's documentation for details.

Send a message:

```typescript
reciever.message(
  text: string,
  options?: Partial<SlashCommand>,
)
//: => ReceiverEvent
```

Send a slash command:

```typescript
reciever.sendSlashCommand(
  name: string,
  options?: Partial<SlashCommand>,
)
//: => ReceiverEvent
```

Send a block button action:

```typescript
reciever.sendBlockButtonAction(
  action: ButtonActionArgs,
  options?: Partial<BlockButtonAction>,
)
//: => ReceiverEvent
```
