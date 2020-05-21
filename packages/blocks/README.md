# Blocks

Create messages with block kit more functionally and with less recall and repetition. Never need to remember json formats or accidentally type `markdown` instead of `mrkdwn` again!

This package helps abstract away some of the specifics, and deduplicate some of the repetitive code needed to create blocks being sent to Slack.

It also automatically handles various slack API limitations on content to ensure blocks built with dynamic content at least don't break when sent to Slack. Learn more about this in the [Truncation](#truncation) section.

- [Install](#install)
- [Usage](#usage)
- [Truncation](#truncation)
  - [Defaults](#defaults)
  - [Overriding](#overriding)
  - [Custom Truncation Functions](#custom-truncation-functions)

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

## Truncation

The Slack API fails completely if all of the various fields don't meet the length requirements outlined in their documentation. This is a lot to keep track of, so this package makes an attempt at sane defaults for cutting off content so that your requests to the Slack APIs won't error, even if you have very long dynamic content.

Depending on the field, different default behavior regarding truncation of content that is too long is applied.

### Defaults

There are three primary functions applied, depending on the field type: `truncate`, `ellipsis`, or `disallow`.

- `truncate` cuts the field at the maximum. Examples:
  - List of checkboxes - maximum 10 via Slack API; if you try to builds blocks with 15 we'll give you back just the first 10)
  - URLs - in many blocks maximum 3000 characters, but if above that we just cut off the end
- `ellipsis` happens for most text fields - titles, descriptions, placeholders, etc.
  - title, descriptions, placeholders, etc.
  - automatically processes text elements (`{ text: '<string>'}`) as well as `string` fields
- `disallow` happens for any field that is typically programmatic and the value is required to stay the same for app functionality
  - block IDs, action IDs, etc.

For example, on an [Option composition object](https://api.slack.com/reference/block-kit/composition-objects#option), here are the functions applied by default and the limits for the fields.

```ts
const optionTruncates: TruncateOptions = {
  text: [75, ellipsis],
  value: [75, disallow],
  description: [75, ellipsis],
  url: [3000, truncate],
};
```

So, the `text` field has a maximum length of `75`. If the provided text in building the block is greater than 75, then the text field is 'truncated' with the `ellipsis` function.

```ts
// { text: 'text', value: 'value' }
OptionObject('text', 'value');

// { text: '<first 72 characters>...', value: 'value' }
OptionObject('<80 character text>', 'value');

// Throws
OptionObject('text', '<80 character id value>');
```

### Overriding

You can override the applied functions in most blocks by using the `truncateFunctions` argument. This involves passing an object mapping of fields (strings) to functions. Provided functions include `truncate`, `ellipsis`, `disallow`, and `identity`.

For example, if you didn't want it to throw on a value being too long, you could truncate that field instead of disallowing:

```ts
// map the `value` field to the truncate function instead of the default disallow
OptionObject(dynamicText, 'value', undefined, { value: truncate });
```

### Custom Truncation Functions

In the same way that you can override, you can also provide your own custom functions (e.g. parsing URLs and removing query parameters, showing the last 10 instead of the first 10 in an array...).

The truncate function is passed two values - the limit for the field in context and the string or array on which the check is done.

For example, to provide a function that just rendered an error string for text that is too long, you could do this:

```ts
OptionObject(dynamicText, 'value', undefined, {
  text: (limit, dynamicText) =>
    `ERR: TOO LONG LONGER (${limit}): ${dynamicText.substring(0, 5)}...`,
});
```

Transform function signature: `<T>(limit: number, value: T) => T`. Be sure to return an value that is the same type the `value` passed - text element, string, option object array, etc. depending on the field.

Note that this function only gets called when the passed dynamicText is greater than the limit. Also, if you end up returning a string longer than `limit`, the block could break when the API call is made to Slack (since Slack will refuse the request).
