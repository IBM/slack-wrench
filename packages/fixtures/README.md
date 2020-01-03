# Slack Fixtures

This package contains type-safe fixtures for testing slack applications.

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

### Slash Commands

```
events.slashCommand(command, [options])
// => { command, user_id, team_id, ... }
```

Creates a slack command event

Arguments:

- `command (string)`: command name
- `options (Partial<SlashCommand>)`: Any fields to override from default

Returns:

- `(SlashCommand)`: Object containing a Slash Command event

### Block Actions

```
events.blockAction(action, [options])
// => { type: 'block_actions', actions: [ ... ], user, ... }
```

Creates an event from a block action. This is mostly intended to be used by other more specific block actions.

Arguments:

- `action (Action)`: Specific block action
- `options (Partial<BlockAction>)`: Any fields to override from default top level event

Returns:

- `(BlockAction)`: Object containing a block action event

#### Block Button Action

```
events.blockButtonAction(action, [options])
// => { type: 'block_actions', actions: [ { type: 'button', ...} ], user, ... }
```

Creates an event from a block button action.

Arguments:

- `action (Action)`: Overrides to button action values (normally a subset of `{ action_id, block_id, value }`
- `options (Partial<BlockButtonAction>)`: Any fields to override from default top level event

Returns:

- `(BlockButtonAction)`: Object containing a block action event
