# Bolt File Storage

Bolt [conversation store](https://slack.dev/bolt/concepts#conversation-store) that uses your file system as a database. Useful for retaining conversation state through restarts of your App in development.

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

const databasePath = '.db'; // defaults to ".db"
const fileStore = new FileStore(databasePath);

const app = new App({ convoStore: fileStore });
```
