# Slack Fixtures

This package contains type-safe fixtures and application wrappers for testing slack applications.

## Table of Contents

- [Install](#install)
- [Usage](#usage)
  - [Events](#events)
  - [Messages](#messages)
  - [Slash Commands](#slash-commands)
  - [Block Actions](#block-actions)
    - [Block Button Action](#block-button-action)
  - [Global Fields](#global-fields)
    - [Overriding](#overriding)
  - [Serverless Tester](#serverless-tester)
    - [Send Slack Events](#send-slack-events)
    - [Send HTTP Requests](#send-http-requests)

## Install

```bash
yarn add --dev @slack-wrench/fixtures
# or
npm install --save-dev @slack-wrench/fixtures
```

## Usage

Currently, we only support a subset of Slack's [Event's API](https://api.slack.com/events-api). We're implementing them as we need them and hope to have others do the same.

### Events

```typescript
import { events } from '@slack-wrench/fixtures';
```

### Messages

```typescript
events.message(
  text: string,
  options: Partial<MessageEvent> = {},
)
// : MessageEvent => { text, user, ts, ... }
```

Creates a message event.

Arguments:

- `text`: Text sent in the message
- `options`: Any [MessageEvent fields](https://github.com/slackapi/bolt/blob/master/src/types/events/base-events.ts#L450) to override from default.

Returns:
Object containing a message event

### Slash Commands

```typescript
events.slashCommand(
  command: string,
  options?: Partial<SlashCommand>,
)
// : SlashCommand => { command, user_id, team_id, ... }
```

Creates a slash command event.

Example:

```typescript
// sending a text field
events.slashCommand('/command', { text: 'I just used a command!' });
```

Arguments:

- `command`: command name
- `options`: Any [SlashCommand fields](https://github.com/slackapi/bolt/blob/master/src/types/command/index.ts#L21) to override from default.

Returns:
Object containing a Slash Command event

### Block Actions

#### Block Button Action

```typescript
events.blockButtonAction(
  action?: Partial<ButtonAction>,
  options?: Partial<BlockButtonAction>,
)
// : BlockButtonAction => { type: 'block_actions', actions: [ { type: 'button', ...} ], user, ... }
```

Creates an event from a block button action.

Arguments:

- `action`: Overrides to [ButtonAction](https://github.com/slackapi/bolt/blob/master/src/types/actions/block-action.ts#L41) values (normally a subset of `{ action_id, block_id, value }`
- `options`: Any fields to override on the default [BlockAction event](https://github.com/slackapi/bolt/blob/master/src/types/actions/block-action.ts#L193)

Returns:
Object containing a block action event

## Global Fields

```typescript
import { fields } from '@slack-wrench/fixtures';
```

The fields returned for all of the fixtures are set and accessible through `fields` . This can be really helpful when writing tests. It also enables you to change the fields if you need them to be specific.

### Overriding

All of the fields used by fixtures can be overridden globally. This might be helpful if you need something like the `team` `domain` and `id` to be specific for your app.

```typescript
// Here are a few examples of things you can change. This will affect all fixtures.

// Update the team id
fields.team.id = 'TANOTHERTEAM';
fields.team.domain = 'another-team';

// or as an object
fields.team = {
  id: 'TANOTHERTEAM',
  domain: 'another-team',
};

// Update the callback_id
fields.callback_id = 'FancyCallbackId';
```

If you want to reset the fields to their original values, you can call `reset`. This is potentially helpful in testing hooks.

```typescript
beforeEach(() => {
  fields.reset();
});
```

## Serverless Tester

```typescript
import { ServerlessTester } from '@slack-wrench/fixtures';
```

A helper class for testing root level applications exposing slack endpoints.

```typescript
import { ServerlessTester } from '@slack-wrench/fixtures';
import { App, ExpressReceiver } from '@slack/bolt';

const receiver = new ExpressReceiver({ signingSecret, endpoints });
const app = new App({ receiver, token });
handler = new ServerlessTester(receiver.app, signingSecret);
```

Arguments:

- `application`: Fixture/Slack event to simulate
- `signingSecret`: Secret to sign all requests with, this should be the same string your application uses to verify requests.

### Send Slack Events

Use `handler.sendSlackEvent` to send Slack fixture events to your application.

```typescript
const result = await handler.sendSlackEvent(events.slashCommand(command));
expect(result.statusCode).toEqual(200);
```

Arguments:

- `event`: Fixture/Slack event to simulate.
- `path`: a path to `POST` the event to, defaults to `/slack/events`, Bolt's default.

### Send HTTP Requests

Use `handler.sendHttp` to send any http event to your application.

```typescript
const result = await handler.sendHttp({
  body: 'How are you?',
  httpMethod: 'GET',
  path: '/',
});
expect(result.statusCode).toEqual(200);
```

Arguments:

- `event`: Request [event](https://github.com/DefinitelyTyped/DefinitelyTyped/blob/master/types/aws-lambda/trigger/api-gateway-proxy.d.ts#L13) to simulate.
- `path`: a path to `POST` the event to, defaults to `/slack/events`, Bolt's default.
