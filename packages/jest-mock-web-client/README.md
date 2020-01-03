# Jest Mock Slack Web Client

This package contains a type-safe mock of `@slack/web-api`.

## Install

```bash
yarn add --dev @slack-wrench/jest-mock-web-client
# or
npm install --save-dev @slack-wrench/jest-mock-web-client
```

## Usage

This mock is intended to be used as a [manual mock](https://jestjs.io/docs/en/manual-mocks#mocking-node-modules).

Create a file for the web-api manual mock (`__mocks__/@slack/web-api.js`)

```js
// __mocks__/@slack/web-api.js
const mockWebApi = require('@slack-wrench/jest-mock-web-client');

module.exports = mockWebApi(jest);
```

Test your code how you would expect:

```js
// src/bot.spec.js
const { WebClient } = require('@slack/web-api');
const Bot = require('./bot');

describe('The Bot', () => {
  let bot;
  let client;

  beforeEach(() => {
    // Reset mocks for each test
    WebClient.clearMocks();
    // In this example, bot create's a `new WebClient`
    bot = new Bot();
    client = WebClient.mock.instances[0];
  });

  it('Can say things', async () => {
    const message = 'Mocking Slack is easy!';
    await bot.say(message);

    expect(client.chat.postMessage).toHaveBeenCalledWith(
      expect.objectContaining({
        text: message,
      }),
    );
  });
});
```

### Getting the mocked client

Mocked instances are exposed in the normal way for [automatic mocks](https://jestjs.io/docs/en/es6-class-mocks#automatic-mock). You can find created instances at `WebClient.mock.instances`.

### Mocking responses

By default, all methods resolve with `{ ok: true }`. If you want to change that, every function is a jest [mock function](https://jestjs.io/docs/en/mock-functions) so you can call things like `mockResolvedValue`.

```js
client.chat.postMessage.mockResolvedValue({
  ok: false,
  error: 'too_many_attachments',
});

// In this example, say will throw an error if Slack's response isn't ok
expect(bot.say('This will error')).rejects.toEqual({
  error: 'Oops, Something happened',
});
```

## Typescript

For proper typings, you must setup your tests a little differently. We use typescript, so you can always refer to our [tests](./src/index.spec.ts), but here's an example.

```typescript
import {
  MockedWebClient,
  MockWebClient,
} from '@slack-wrench/jest-mock-web-client';
import Bot from './bot';

describe('Your App', () => {
  let bot: Bot;
  let client: MockWebClient; // Notice this typing instead of `WebClient`

  beforeEach(() => {
    // We need to use `MockedWebClient` instead of `WebClient` for proper typings
    MockedWebClient.mockClear();
    bot = new Bot();
    client = MockedWebClient.mock.instances[0];
  });
});
```
