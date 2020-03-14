# Blocks

Create messages with block kit more functionally and with less recall and repetition. Never need to remember json formats or accidentally type `markdown` instead of `mrkdwn` again!

This package helps abstract away some of the specifics, and deduplicate some of the repetitive code needed to create blocks being sent to Slack.

## Install

```bash
# Yarn
yarn add @slack-wrench/blocks

# npm
npm install @slack-wrench/blocks
```

## Usage

[Example block kit builder search channel message](https://api.slack.com/tools/block-kit-builder?mode=message&blocks=%5B%7B%22accessory%22%3A%7B%22type%22%3A%22button%22%2C%22text%22%3A%7B%22type%22%3A%22plain_text%22%2C%22text%22%3A%22Search%22%2C%22emoji%22%3Atrue%7D%2C%22action_id%22%3A%22changeSearch%22%7D%2C%22text%22%3A%7B%22type%22%3A%22mrkdwn%22%2C%22text%22%3A%22Let%20me%20help%20you%20find%20some%20channels.%22%7D%2C%22type%22%3A%22section%22%7D%2C%7B%22type%22%3A%22divider%22%7D%2C%7B%22text%22%3A%7B%22type%22%3A%22mrkdwn%22%2C%22text%22%3A%22*Channels*%22%7D%2C%22type%22%3A%22section%22%7D%2C%7B%22text%22%3A%7B%22type%22%3A%22mrkdwn%22%2C%22text%22%3A%22*house-ravenclaw*%5CnDiscuss%20Ravenclaw%20business%22%7D%2C%22type%22%3A%22section%22%7D%2C%7B%22type%22%3A%22context%22%2C%22elements%22%3A%5B%7B%22type%22%3A%22mrkdwn%22%2C%22text%22%3A%22120%20members%5CnLast%20post%3A%20%3C!date%5E1575643433%5E%7Bdate_pretty%7D%7C1575643433%3E%22%7D%5D%7D%2C%7B%22type%22%3A%22actions%22%2C%22elements%22%3A%5B%7B%22type%22%3A%22button%22%2C%22text%22%3A%7B%22type%22%3A%22plain_text%22%2C%22text%22%3A%22%3Athumbsup%3A%22%2C%22emoji%22%3Atrue%7D%2C%22action_id%22%3A%22thumbsUp%22%2C%22value%22%3A%22house-ravenclaw%22%7D%2C%7B%22type%22%3A%22button%22%2C%22text%22%3A%7B%22type%22%3A%22plain_text%22%2C%22text%22%3A%22%3Athumbsdown%3A%22%2C%22emoji%22%3Atrue%7D%2C%22action_id%22%3A%22thumbsDown%22%2C%22value%22%3A%22house-ravenclaw%22%7D%5D%7D%5D)

```typescript
import { App } from '@slack/bolt';
import { Actions, Blocks, Button, Context, DateString, Divider, Markdown, MdSection, User } from '@slack-wrench/blocks';

const app = new App({ /* token, secret */ });

app.message(':wave:', async ({ message, say }) => {
  say({
    blocks: Blocks([
      MdSection(`Hello, ${User(message.user)}! Let me help you find some channels.`, {
        accessory: Button('Search', 'changeSearch'),
      }),
      Divider(),
      MdSection('*Channels*'),
      MdSection('*house-ravenclaw*\nDiscuss Ravenclaw business'),
      Context([
        Markdown(
          `120 members\nLast post: ${DateString(1575643433, 'date_pretty', '1575643433')}`,
        ),
      ]),
      Actions([
        Button(':thumbsup:', 'thumbsUp', {
          value: 'house-ravenclaw',
        }),
        Button(':thumbsdown:', 'thumbsDown', {
          value: 'house-ravenclaw',
        }),
      ]),
  });
});
```

Before:

```typescript
const { App } = require('@slack/bolt');

const app = new App({
  /* token, secret */
});

app.message(':wave:', async ({ message, say }) => {
  say({
    blocks: [
      {
        accessory: {
          type: 'button',
          text: { type: 'plain_text', text: 'Search', emoji: true },
          action_id: 'changeSearch',
        },
        text: {
          type: 'mrkdwn',
          text: `Hello, <@${message.user}>Let me help you find some channels.`,
        },
        type: 'section',
      },
      { type: 'divider' },
      { text: { type: 'mrkdwn', text: '*Channels*' }, type: 'section' },
      {
        text: {
          type: 'mrkdwn',
          text: '*house-ravenclaw*\nDiscuss Ravenclaw business',
        },
        type: 'section',
      },
      {
        type: 'context',
        elements: [
          {
            type: 'mrkdwn',
            text:
              '120 members\nLast post: <!date^1575643433^{date_pretty}|1575643433>',
          },
        ],
      },
      {
        type: 'actions',
        elements: [
          {
            type: 'button',
            text: { type: 'plain_text', text: ':thumbsup:', emoji: true },
            action_id: 'thumbsUp',
            value: 'house-ravenclaw',
          },
          {
            type: 'button',
            text: { type: 'plain_text', text: ':thumbsdown:', emoji: true },
            action_id: 'thumbsDown',
            value: 'house-ravenclaw',
          },
        ],
      },
    ],
  });
});
```
