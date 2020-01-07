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

```typescript
events.slashCommand = (
  command: string,
  options?: Partial<SlashCommand>,
)
// : SlashCommand => { command, user_id, team_id, ... }
```

Creates a slash command event.

Arguments:

- `command`: command name
- `options`: Any fields to override from default

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

- `action`: Overrides to button action values (normally a subset of `{ action_id, block_id, value }`
- `options`: Any fields to override on the default top level event

Returns:
Object containing a block action event
