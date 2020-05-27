import { KnownBlock } from '@slack/types';
import puppeteer, {
  BoxModel,
  Browser,
  ConnectOptions,
  LaunchOptions,
  Page,
  ScreenshotOptions,
} from 'puppeteer';
import querystring from 'querystring';

type Screenshot = string | Buffer;

type BlockSurfaceModes = 'message' | 'modal' | 'appHome';

const minSlackViewportWidth = 1000; // Magic number, width needed for builder to render

async function screenshotDOMElement(
  page: Page,
  selector: string,
  options?: ScreenshotOptions,
): Promise<Screenshot> {
  const element = await page.waitForSelector(selector, { visible: true });
  // Removing the possibility of `null`
  const elementBox = (await element.boxModel()) as BoxModel;
  const marginBottomRight = elementBox.margin[3];

  await page.setViewport({
    width: Math.ceil(minSlackViewportWidth),
    height: Math.ceil(marginBottomRight.y),
    deviceScaleFactor: 1,
  });

  return element.screenshot(options);
}

export interface BlockKitRendererOptions {
  puppeteer?: LaunchOptions;
}

export default class BlockKitRenderer {
  public browser?: Browser;

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
    if (!this.browser) {
      this.browser = await puppeteer.launch(this.puppeteerOptions);
    }

    const page = await this.browser.newPage();

    await page.goto(`https://${domain}.slack.com`, { waitUntil: 'load' });
    await page.type('#email', email);
    await page.type('#password', password);
    await page.click('#signin_btn');
    await page.waitForNavigation();
    await page.close();
  }

  /**
   * enables connecting to existing browser
   */
  async connect(options: ConnectOptions): Promise<void> {
    this.browser = await puppeteer.connect({
      ...this.puppeteerOptions,
      ...options,
    });
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
    const screenshotSelector = '.p-block_kit_builder_preview__container';

    const page = await this.browser.newPage();

    // Configure the navigation timeout - this can take more than default 30s depending on provided blocks
    page.setDefaultNavigationTimeout(60 * 1000);

    await page.emulateTimezone('GMT');

    const query = querystring.stringify({
      mode,
      blocks: JSON.stringify(blocks),
    });

    await page.goto(`https://api.slack.com/tools/block-kit-builder?${query}`);

    // Wait for page to load with blocks from query
    await page.waitForSelector(renderedBlocksSelector);

    const screenshot = await screenshotDOMElement(
      page,
      screenshotSelector,
      options,
    );

    await page.close();

    return screenshot;
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
