# Bolt ⚡️ Interactions

Bolt interactions allows you to effortlessly create stateful user action `flows` with your [Bolt](https://github.com/slackapi/bolt) app.

Vanilla Bolt gives you some ability to do this already, but its state is scoped to a whole channel. This library keeps the scope to the interaction allowing for faster data fetching and a greater ability to rationalize how your app works.

## Install

```bash
yarn add @slack-wrench/bolt-interactions
# or
npm install --save @slack-wrench/bolt-interactions
```

## Understanding Flows

This package creates a new concept of a user interaction called a `flow`. A `flow` logically represents a set of linked actions typically associated with a user flow. Introducing this new concept makes your application easier to reason about and keeps your focus on the outcome and user interaction.

`flow`s are implemented as a set of bolt event listeners linked by a shared state.

Here's an example:

```typescript
import { App } from '@slack/bolt';
import {
  interactionFlow,
  InteractionFlow,
} from '@slack-wrench/bolt-interactions';
import FileStore from '@slack-wrench/bolt-storage-file'; // Use whatever ConversationStore you want

// Create and configure your app with a ConversationStore
const convoStore = new FileStore();
InteractionFlow.store = convoStore;
const app = new App({
  signingSecret: process.env.SLACK_SIGNING_SECRET,
  token: process.env.SLACK_BOT_TOKEN,
  convoStore,
});

// Create a new interaction, usually this will be the default export of its own file
const commandFlow = interactionFlow('yourCommand', (flow, app) => {
  app.command('/bolt-interaction', ({ say }) => {
    // Start a new flow from a command, set an initial state
    const { interactionIds } = flow.start({ clicked: 0 });

    say({
      blocks: [
        {
          type: 'section',
          text: {
            type: 'plain_text',
            text: 'You used a command!',
            emoji: true,
          },
        },
        {
          type: 'actions',
          elements: [
            {
              type: 'button',
              text: {
                type: 'plain_text',
                text: 'Click Me',
                emoji: true,
              },
              // Use flow interaction ids from context
              action_id: interactionIds.appButton,
            },
            {
              type: 'button',
              text: {
                type: 'plain_text',
                text: 'Stop',
                emoji: true,
              },
              // Use flow interaction ids from context
              action_id: interactionIds.stopButton,
            },
          ],
        },
      ],
    });
  });

  flow.action('appButton', async ({ context, say }) => {
    // Access the current state, and functions to set new state, end the flow,
    // or get interactionIds for continuing the flow
    const { state, setState, endFlow, interactionIds } = context;

    state.clicked += state.clicked;

    say(`The button has been clicked ${state.clicked}`);

    // Update the state for new buttons
    await setState(state);
  });

  flow.action('stopButton', async ({ context, say }) => {
    const { endFlow } = context;

    say('You ended the flow');

    // Cleans up state in the database
    await endFlow();
  });
});

// Register your flows to the app
commandFlow(app);

(async () => {
  // Start the app
  await app.start(process.env.PORT || 3000);

  console.log('⚡️ Bolt app is running!');
})();
```

## Working with your Flow

### Flow Listeners

Flow listeners are a special set of bolt [event listeners](https://github.com/slackapi/bolt#making-things-happen). They can be created with the flow counter part of bolt app listeners (`flow.action` and `app.action` for example). They can do everything that normal bolt listeners can plus they can interact with the flow they're a part of.

### Flow Context

Flow listeners have their `context` extended with some extra functions and data. You can also get these through [`flow.start`](#flow.start).

When you create a new flow with `flow.start`, you've created a "flow instance" that is unique to that interaction.

- `state` **(FlowState)** - The current state of that flow instance.
- `setState` **((state: any, expiresAt?: number) => Promise<unknown>)** - Function to update the state
- `endFlow` **(() => Promise<unknown>)** - Function to end the flow, and clean up its state
- `interactionIds` **(Record<string, string))** - ids to pass to block kit for various actions, usually `action_id`.

### interactionFlow

```typescript
interactionFlow<FlowState>((flow, app) => {
  // Flow code
});
// => : (App) => InteractionFlow
```

Helper function to create a new `InteractionFlow`. It allows you to separate your interaction flow from the Bolt `app` to help organize your code base.

### flow.start

At any time, you can start a new flow. You can do it when a non-stateful slack action happens (like a command, or a message), or when something outside of slack happens, like a webhook from github.

```typescript
interactionFlow<FlowState>((flow, app) => {
  flow.start(initialState); // Can be called any time
  // => : Promise<Interaction.FlowContext<FlowState>>
});
```

Starts a new flow and sets the initial state.

Arguments:

- `initialState`: The starting state of the flow. Flow middleware will get this value whenever they're called.

Returns:
The [flow context](#flow-context)

### flow.action

```typescript
interactionFlow<FlowState>((flow, app) => {
  flow.action(...listeners, { context, ... });
});
```

Create a [flow listener](#flow-listener) that listens for [actions](https://slack.dev/bolt/concepts#action-listening)

## Testing your Flow

When testing your flows, it's helpful to have some predictability and not need whole databases. `bolt-interactions` exports a few hooks that you can use to make this happen.

```typescript
import { MemoryStore } from '@slack/bolt';
import { InteractionFlow } from '@slack-wrench/bolt-interactions`;

// Update the store that Interaction flows use
InteractionFlow.store = new MemoryStore();

// Change the function that randomly generates ids to something a
// bit more predictable
InteractionFlow.interactionIdGenerator = () => 'a-random-string';
```
