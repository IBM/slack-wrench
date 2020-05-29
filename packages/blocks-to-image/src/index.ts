import { KnownBlock, MessageAttachment, View } from '@slack/types';
import retry from 'async-retry';
import puppeteer, {
  BoxModel,
  Browser,
  ConnectOptions,
  LaunchOptions,
  Page,
  ScreenshotOptions,
} from 'puppeteer';

// Order of the checklist
enum SurfaceModes {
  'message',
  'attachments',
  'modal',
  'appHome',
}

const viewModes: Record<View['type'], SurfaceModes> = {
  home: SurfaceModes.appHome,
  modal: SurfaceModes.modal,
};

const minSlackViewportWidth = 1000; // Magic number, width needed for builder to render

export type Screenshot = string | Buffer;

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

  public page?: Page;

  private readonly puppeteerOptions: LaunchOptions;

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

  private async getBuilderPage(): Promise<Page> {
    if (!this.browser) {
      throw new Error('Please log in first with `BlockKitRenderer#login`');
    }

    if (!this.page) {
      this.page = await this.browser.newPage();

      // Keep emoji the same
      await this.page.setUserAgent(
        'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_4) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/81.0.4044.138 Safari/537.36',
      );
      // Keep timestamps the same
      await this.page.emulateTimezone('GMT');
      this.page.setDefaultNavigationTimeout(60 * 1000);

      await this.page.goto(`https://api.slack.com/tools/block-kit-builder`);
      // Render modals as full length
      await this.page.addStyleTag({
        content: '.p-bkb_preview_modal { max-height: 100% }',
      });
    }

    return this.page;
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

  /**
   * Emulates a Ctrl+A SelectAll key combination by dispatching custom keyboard
   * events and using the results of those events to determine whether to call
   * `document.execCommand( 'selectall' );`. This is necessary because Puppeteer
   * does not emulate Ctrl+A SelectAll in macOS. Events are dispatched to ensure
   * that any `Event#preventDefault` which would have normally occurred in the
   * application as a result of Ctrl+A is respected.
   *
   * @link https://github.com/GoogleChrome/puppeteer/issues/1313
   * @link https://w3c.github.io/uievents/tools/key-event-viewer.html
   * @link https://github.com/puppeteer/puppeteer/issues/1313#issuecomment-480052880
   */
  private async emulateSelectAll(): Promise<void> {
    const page = await this.getBuilderPage();
    await page.evaluate(`
      isMac = /Mac|iPod|iPhone|iPad/.test( window.navigator.platform );

      document.activeElement.dispatchEvent(
        new KeyboardEvent( 'keydown', {
          bubbles: true,
          cancelable: true,
          key: isMac ? 'Meta' : 'Control',
          code: isMac ? 'MetaLeft' : 'ControlLeft',
          location: window.KeyboardEvent.DOM_KEY_LOCATION_LEFT,
          getModifierState: ( keyArg ) => keyArg === ( isMac ? 'Meta' : 'Control' ),
          ctrlKey: !isMac,
          metaKey: isMac,
          charCode: 0,
          keyCode: isMac ? 93 : 17,
          which: isMac ? 93 : 17,
        } )
      );

      preventableEvent = new KeyboardEvent( 'keydown', {
        bubbles: true,
        cancelable: true,
        key: 'a',
        code: 'KeyA',
        location: window.KeyboardEvent.DOM_KEY_LOCATION_STANDARD,
        getModifierState: ( keyArg ) => keyArg === ( isMac ? 'Meta' : 'Control' ),
        ctrlKey: ! isMac,
        metaKey: isMac,
        charCode: 0,
        keyCode: 65,
        which: 65,
      } );

      wasPrevented = (
        !document.activeElement.dispatchEvent( preventableEvent ) ||
        preventableEvent.defaultPrevented
      );

      if ( !wasPrevented ) {
        document.execCommand( 'selectall', false, null );
      }

      document.activeElement.dispatchEvent(
        new KeyboardEvent( 'keyup', {
          bubbles: true,
          cancelable: true,
          key: isMac ? 'Meta' : 'Control',
          code: isMac ? 'MetaLeft' : 'ControlLeft',
          location: window.KeyboardEvent.DOM_KEY_LOCATION_LEFT,
          getModifierState: () => false,
          charCode: 0,
          keyCode: isMac ? 93 : 17,
          which: isMac ? 93 : 17,
        } ),
      );
    `);
  }

  private async enterCode(code: any): Promise<void> {
    const page = await this.getBuilderPage();

    const previewSelector = '.p-bkb_preview_container';
    const textAreaSelector = '.CodeMirror textarea';

    const codeMirror = await page.waitForSelector('.CodeMirror-code');
    await codeMirror.click();
    await this.emulateSelectAll();
    await page.waitForSelector(textAreaSelector);
    const payload = JSON.stringify(code)
      .replace(/\\"/g, '\\\\"')
      .replace(/`/g, '\\`')
      .replace(/\\n/g, '\\\\n');

    await page.evaluate(`
        dataTransfer = new DataTransfer();
        dataTransfer.setData('text/plain', \`${payload}\`);

        event = new ClipboardEvent('paste', { clipboardData: dataTransfer });
        document.querySelector('${textAreaSelector}').dispatchEvent(event);
    `);

    let identicalCount = 0;
    let renderContents = '';

    // Wait for the entered text to have rendered
    await retry(
      async () => {
        // Check for loading or warning icons, multiple of these can happen,
        // hence it's position in the loop
        await page.waitForFunction(`
        document.querySelector(".p-bkb_preview__warning") ||
        document.querySelector(".p-bkb_preview_container__icons").innerHTML === ""
      `);
        const newContents = (await page.evaluate(
          `document.querySelector("${previewSelector}").innerHTML`,
        )) as string;

        if (newContents === renderContents) {
          identicalCount += 1;
        } else {
          identicalCount = 0;
        }

        renderContents = newContents;

        // Magic number
        if (identicalCount < 4) {
          throw new Error('waiting for change, retry');
        }
      },
      {
        factor: 1,
        randomize: false,
        minTimeout: 400,
      },
    );
  }

  private async selectMode(mode: SurfaceModes): Promise<void> {
    const page = await this.getBuilderPage();

    await page.click('#block-kit-builder-surface-select_button');
    const switchElement = await page.waitForSelector(
      `#block-kit-builder-surface-select_option_${mode}`,
    );
    await switchElement.click();
  }

  private async imageFromPayload(
    payload: any,
    mode: SurfaceModes,
    options: ScreenshotOptions,
  ): Promise<Screenshot> {
    const page = await this.getBuilderPage();

    await page.setViewport(
      this.puppeteerOptions.defaultViewport as puppeteer.Viewport,
    );
    const renderedBlocksSelector = '.p-block_kit_renderer';
    const screenshotSelector = '.p-bkb_preview__attachment';

    await page.waitForSelector(renderedBlocksSelector);

    // Reset Page, modals tend to need this
    await this.enterCode({});
    await this.selectMode(SurfaceModes.message);

    // Choose the mode
    await this.selectMode(mode);

    // Enter text and wait for render
    await this.enterCode(payload);

    // Take Screenshot
    await page.waitForSelector(renderedBlocksSelector);
    return screenshotDOMElement(page, screenshotSelector, options);
  }

  async imageFromBlocks(
    blocks: KnownBlock[],
    options: ScreenshotOptions = {},
  ): Promise<Screenshot> {
    return this.imageFromPayload({ blocks }, SurfaceModes.message, options);
  }

  async imageFromView(
    view: View,
    options: ScreenshotOptions = {},
  ): Promise<Screenshot> {
    return this.imageFromPayload(view, viewModes[view.type], options);
  }

  async imageFromAttachments(
    attachments: MessageAttachment[],
    options: ScreenshotOptions = {},
  ): Promise<Screenshot> {
    return this.imageFromPayload(
      { attachments },
      SurfaceModes.attachments,
      options,
    );
  }

  async close(): Promise<void> {
    // Noop if not there
    // Weird ignores b/c all three seem to be required to ignore the else case
    /* istanbul ignore next */ if (
      /* istanbul ignore next */ this.browser /* istanbul ignore next */
    ) {
      await this.browser.close();
    }

    /* istanbul ignore next */ if (
      /* istanbul ignore next */ this.page /* istanbul ignore next */
    ) {
      await this.page.close();
    }
  }
}
