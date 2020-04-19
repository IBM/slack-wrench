# Blocks To Images

Render Slack Block Kit json as images.

As a side effect, you are also validating the correctness of the JSON you're using, since it won't render if given invalid JSON.

This pairs amazingly with [`jest-image-snapshot`](https://github.com/americanexpress/jest-image-snapshot) for image-based snapshot testing. No more staring at long json files for hours!

![Generated Failed Diff Example](diff-example.png)

## Table of Contents

- [Install](#install)
- [Usage](#usage)
  - [`imageFromBlocks`](#imagefromblocks)
  - [Advanced Configuration](#advanced-configuration)

## Install

```bash
yarn add --dev @slack-wrench/blocks-to-image
# or
npm install --save-dev @slack-wrench/blocks-to-image
```

## Usage

```typescript
import BlockKitRenderer from '@slack-wrench/blocks-to-image';
import { toMatchImageSnapshot } from 'jest-image-snapshot';

// Import how you generate Slack Block kit JSON.
import MySlackBlock from './MySlackBlock';

expect.extend({ toMatchImageSnapshot });

describe('My Awesome App', () => {
  // We use the block kit builder, it can take a while
  jest.setTimeout(30000);
  let blockKitRenderer: BlockKitRenderer;

  beforeAll(async () => {
    blockKitRenderer = new BlockKitRenderer();

    // Log into a Slack Workspace that's installed block kit builder
    await blockKitRenderer.login(
      process.env.SLACK_DOMAIN || '', // eg: `community` (emit the `.slack.com)
      process.env.SLACK_EMAIL || '',
      process.env.SLACK_PASSWORD || '',
    );
  });

  afterAll(async () => {
    // Cleanup resources
    await blockKitRenderer.close();
  });

  it('Looks beautiful!', async () => {
    const blockImage = await blockKitRenderer.imageFromBlocks(MySlackBlock());

    expect(blockImage).toMatchImageSnapshot();
  });
});
```

### `imageFromBlocks`

```typescript
blockKitRenderer.imageFromBlocks(
    blocks: KnownBlock[], // JSON that you want to render
    mode: BlockSurfaceModes = 'message', // Surface that you want to render on ('message', 'modal', or 'appHome')
    options: ScreenshotOptions = {}, // Screenshot Options
) => Promise<Screenshot>
```

For details on additional options, see [Puppeteer docs](https://github.com/puppeteer/puppeteer/blob/v2.1.1/docs/api.md#pagescreenshotoptions)

### Advanced Configuration

`blocks-to-image` uses [Puppeteer](https://github.com/GoogleChrome/puppeteer) to generate images. If you need to pass [additional configuration](https://github.com/puppeteer/puppeteer/blob/v2.1.1/docs/api.md#puppeteerlaunchoptions) to Puppeteer, like maybe a custom chrome executable, you can do so in the constructor:

```typescript
blockKitRenderer = new BlockKitRenderer({
  puppeteer: {
    product: 'firefox',
    headless: false,
    executablePath: '/path/to/exe',
  },
});
```
