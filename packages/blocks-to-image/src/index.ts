import { KnownBlock } from '@slack/types';
import puppeteer, {
  BoundingBox,
  BoxModel,
  Browser,
  LaunchOptions,
  Page,
  ScreenshotOptions,
} from 'puppeteer';
import querystring from 'querystring';

type Screenshot = string | Buffer;

enum BlockSurfaceModeSelectors {
  'message' = '.p-block_kit_builder_preview__message',
  'modal' = '.p-block_kit_builder_preview_modal',
  'appHome' = '.p-block_kit_builder_preview__app_home',
}

type BlockSurfaceModes = keyof typeof BlockSurfaceModeSelectors;

const minSlackViewportWidth = 1000; // Magic number, width needed for builder to render

async function setViewportFromClip(
  page: Page,
  width: number,
  clip: BoundingBox,
): Promise<void> {
  await page.setViewport({
    width: Math.ceil(width),
    height: Math.ceil(clip.height + clip.x),
    deviceScaleFactor: 1,
  });
}

async function screenshotDOMElement(
  page: Page,
  selector: string,
  options?: ScreenshotOptions,
): Promise<Screenshot> {
  const element = await page.waitForSelector(selector, { visible: true });
  // Removing the possibility of `null`
  const elementBox = (await element.boxModel()) as BoxModel;

  const marginTopLeft = elementBox.margin[0];
  const marginTopRight = elementBox.margin[1];
  const marginBottomRight = elementBox.margin[3];

  const screenshotOptions = {
    clip: {
      x: marginTopLeft.x,
      y: marginTopLeft.y,
      width: marginTopRight.x - marginTopLeft.x,
      height: marginBottomRight.y - marginTopRight.y,
    },
  };

  await setViewportFromClip(
    page,
    minSlackViewportWidth,
    screenshotOptions.clip,
  );

  await page.waitForFunction(
    `document.querySelector('${selector}') && document.querySelector('${selector}').clientHeight != 0`,
  );

  const screenshot = await page.screenshot({
    ...options,
    ...screenshotOptions,
  });
  await page.close();

  return screenshot;
}

export interface BlockKitRendererOptions {
  puppeteer?: LaunchOptions;
}

export default class BlockKitRenderer {
  private browser?: Browser;

  private readonly puppeteerOptions?: LaunchOptions;

  // Ignoring optional options, next is so high b/c istanbul can't see any other ignores
  /* istanbul ignore next */
  constructor(options: BlockKitRendererOptions = {}) {
    this.puppeteerOptions = {
      defaultViewport: {
        width: minSlackViewportWidth,
        height: minSlackViewportWidth,
        deviceScaleFactor: 1,
      },
      ...options.puppeteer,
    };
  }

  async login(domain: string, email: string, password: string): Promise<void> {
    this.browser = await puppeteer.launch(this.puppeteerOptions);
    const page = await this.browser.newPage();

    await page.goto(`https://${domain}.slack.com`, { waitUntil: 'load' });
    await page.type('#email', email);
    await page.type('#password', password);
    await page.click('#signin_btn');
    await page.waitForNavigation();
    await page.close();
  }

  async imageFromBlocks(
    blocks: KnownBlock[],
    mode: BlockSurfaceModes = 'message',
    options: ScreenshotOptions = {},
  ): Promise<Screenshot> {
    if (!this.browser) {
      throw new Error('Please log in first with `BlockKitRenderer#login`');
    }

    const renderedBlocksSelector = '.p-block_kit_renderer';

    const screenshotElementSelector = BlockSurfaceModeSelectors[mode];

    const page = await this.browser.newPage();

    const query = querystring.stringify({
      mode,
      blocks: JSON.stringify(blocks),
    });

    await page.goto(`https://api.slack.com/tools/block-kit-builder?${query}`);

    await page.waitForSelector(renderedBlocksSelector);
    return screenshotDOMElement(page, screenshotElementSelector, options);
  }

  async close(): Promise<void> {
    // Noop if not there
    // Weird ignores b/c all three seem to be required to ignore the else case
    /* istanbul ignore next */ if (
      /* istanbul ignore next */ this.browser /* istanbul ignore next */
    ) {
      await this.browser.close();
    }
  }
}
