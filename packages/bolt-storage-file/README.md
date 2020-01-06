# Bolt File Storage

Bolt [conversation store](https://slack.dev/bolt/concepts#conversation-store) that uses your file system as a database.

This package is intended to be used in development to retain conversation state through restarts of your app.

## Install

```bash
# Yarn
yarn add --dev @slack-wrench/bolt-storage-file

# npm
npm install --save-dev @slack-wrench/bolt-storage-file
```

## Usage

```typescript
import { App } from '@slack/bolt';
import FileStore from '@slack-wrench/bolt-storage-file';

const app = new App({ convoStore: new FileStore() });
```

## Configuration

You can also pass a path for where you'd like the database to be stored in your file system.

```typescript
new FileStore('/path/to/db');
```
