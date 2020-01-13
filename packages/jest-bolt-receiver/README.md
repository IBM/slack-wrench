# Jest Bolt Receiver

A [receiver](https://slack.dev/bolt/concepts#receiver) built for testing Slack Bolt apps with Jest. This receiver allows you to easily send mock events to your app allowing you to write tests that prove your listeners interact with bolt correctly, instead of only being able to test your listeners in isolation.

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
import {
  MockedWebClient,
  MockWebClient,
} from '@slack-wrench/jest-mock-web-client';
import delay from 'delay';

// Import your app that creates a Slack Bolt App.
import MyApp from './app';

describe('My Awesome App', () => {
  let receiver: JestReceiver;
  let app: MyApp;
  let client: MockWebClient; // Using a mock slack client so we can spy on it

  beforeEach(() => {
    // Pass in this receiver instead of yours or the default express one
    receiver = new JestReceiver();
    app = new MyApp({ receiver });
    client = MockedWebClient.mock.instances[0];
  });

  it('Can handle a slash command', async () => {
    const message = '@slack-wrench makes testing easy!';
    receiver.sendSlashCommand('/echo', { text: message });
    await delay(0); // Wait for anything async.

    // Test what should have happened.
    expect(client.chat.postMessage).toHaveBeenCalledWith(
      expect.objectContaining({
        text: message,
      }),
    );
  });
});
```

### Sending Events

This project uses [@slack-wrench/fixtures](../fixtures) to generate and send events. As such, this project supports all of the features supported in fixtures such as global overrides and customizing payloads. Check its documentation for details.

Send a message:

```typescript
receiver.message(
  text: string,
  options?: Partial<SlashCommand>,
)
//: => ReceiverEvent
```

Send a slash command:

```typescript
receiver.sendSlashCommand(
  name: string,
  options?: Partial<SlashCommand>,
)
//: => ReceiverEvent
```

Send a block button action:

```typescript
receiver.sendBlockButtonAction(
  action: ButtonActionArgs,
  options?: Partial<BlockButtonAction>,
)
//: => ReceiverEvent
```
