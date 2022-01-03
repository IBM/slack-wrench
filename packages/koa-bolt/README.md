# Koa Bolt

Use Bolt and Koa together. ⚡️ ❤️ Koa

Koa [middleware](https://koajs.com/#application) that wraps the default Bolt ['ExpressReceiver`](https://github.com/slackapi/bolt-js/blob/main/src/receivers/ExpressReceiver.ts) into a Koa application.

Useful for those who want to use promises in their app middleware and those wanting a little more control over their running application.

## Install

```bash
# Yarn
yarn add @slack-wrench/koa-bolt

# npm
npm install @slack-wrench/koa-bolt
```

## Usage

```typescript
import Koa from 'koa';
import { App, ExpressReceiver } from '@slack/bolt';
import koaBolt from '@slack-wrench/koa-bolt';

const signingSecret = process.env.SLACK_SIGNING_SECRET;
const token = process.env.SLACK_BOT_TOKEN;

const receiver = new ExpressReceiver(signingSecret);
const bolt = new App({ receiver, token });
const app = new Koa();

bolt.command(commandName, fn);

app.use(koaBolt(receiver.app));

app.listen('8080');
console.log('⚡️ Bolt app is running!');
```

## Configuration

You can also pass custom endpoints to `koaBolt` in the same way you do to `Bolt`.

```typescript
const endpoints = {
  events: '/custom/slack/endpoint',
};

const receiver = new ExpressReceiver(signingSecret);
const bolt = new App({ receiver, token, endpoints });
const app = new Koa();

app.use(koaBolt(receiver.app, endpoints));
```
