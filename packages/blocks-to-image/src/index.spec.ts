import {
  Actions,
  Blocks,
  Button,
  Divider,
  Image,
  MdSection,
  PlainText,
} from '@slack-wrench/blocks';
import { toMatchImageSnapshot } from 'jest-image-snapshot';
import puppeteer, { Browser } from 'puppeteer';
import { times } from 'ramda';

import BlockKitRenderer from './index';

expect.extend({ toMatchImageSnapshot });

const imageCompareOptions = { customDiffConfig: { threshold: 0.1 } };

const Restaurant = (description: string, image: string) =>
  MdSection(description, {
    accessory: Image(image, 'alt text for image'),
  });

const RestaurantBlocks = (restaurantTimes = 1) =>
  Blocks([
    MdSection(
      'Hello, `Assistant` to the Regional Manager Dwight! ' +
        "*Michael Scott* wants to know where you'd like to take the Paper Company investors to dinner tonight.\n\n" +
        '*Please select a restaurant:*',
    ),
    Divider(),
    ...times(
      () =>
        Restaurant(
          "*Al's Burger Shack*\n" +
            ':star::star::star::star::star: 567 reviews\n' +
            "Al's Burger Shack is a great place to enjoy a juicy burger with delicious, crisp rosemary-dusted crinkle fries.",
          'https://s3-media0.fl.yelpcdn.com/bphoto/ggIUPo985Y2Lc0sjjMqYsg/258s.jpg',
        ),
      restaurantTimes,
    ),
    Divider(),
    Actions([Button("Al's Burger Shack", 'click_me_1')]),
  ]);

describe('Image rendering', () => {
  jest.setTimeout(30000);
  let blockKitRenderer: BlockKitRenderer;

  beforeAll(async () => {
    blockKitRenderer = new BlockKitRenderer();

    await blockKitRenderer.login(
      process.env.SLACK_DOMAIN || '',
      process.env.SLACK_EMAIL || '',
      process.env.SLACK_PASSWORD || '',
    );
  });

  afterAll(async () => {
    await blockKitRenderer.close();
  });

  it('can render a block as a message', async () => {
    expect.assertions(1);

    const blockImage = await blockKitRenderer.imageFromBlocks(
      RestaurantBlocks(),
    );

    expect(blockImage).toMatchImageSnapshot(imageCompareOptions);
  });

  it('allows overriding block snapshot options', async () => {
    expect.assertions(1);
    const blockImage = await blockKitRenderer.imageFromBlocks(
      RestaurantBlocks(),
      { encoding: 'base64' },
    );

    expect(typeof blockImage).toBe('string');
  });

  it('can render long blocks', async () => {
    expect.assertions(1);

    const blockImage = await blockKitRenderer.imageFromBlocks(
      RestaurantBlocks(10),
    );

    expect(blockImage).toMatchImageSnapshot(imageCompareOptions);
  });

  it('can render a modal', async () => {
    expect.assertions(1);

    const blockImage = await blockKitRenderer.imageFromView({
      type: 'modal',
      title: PlainText('Restaurant'),
      submit: PlainText('Submit'),
      close: PlainText('Cancel'),
      blocks: RestaurantBlocks(),
    });

    expect(blockImage).toMatchImageSnapshot(imageCompareOptions);
  });

  it('can render a long modal', async () => {
    expect.assertions(1);

    const blockImage = await blockKitRenderer.imageFromView({
      type: 'modal',
      title: PlainText('Lots of Restaurants'),
      submit: PlainText('Submit'),
      close: PlainText('Cancel'),
      blocks: RestaurantBlocks(10),
    });

    expect(blockImage).toMatchImageSnapshot(imageCompareOptions);
  });

  it('can render attachments', async () => {
    expect.assertions(1);

    const blockImage = await blockKitRenderer.imageFromAttachments([
      {
        color: '#4b9cd3',
        blocks: RestaurantBlocks(),
      },
    ]);

    expect(blockImage).toMatchImageSnapshot(imageCompareOptions);
  });

  it('allows overriding attachment snapshot options', async () => {
    expect.assertions(1);
    const blockImage = await blockKitRenderer.imageFromAttachments(
      [
        {
          color: '#4b9cd3',
          blocks: RestaurantBlocks(),
        },
      ],
      { encoding: 'base64' },
    );

    expect(typeof blockImage).toBe('string');
  });

  it('can render an app home', async () => {
    expect.assertions(1);

    const blockImage = await blockKitRenderer.imageFromView({
      type: 'home',
      blocks: RestaurantBlocks(),
    });

    expect(blockImage).toMatchImageSnapshot(imageCompareOptions);
  });

  it('allows overriding home snapshot options', async () => {
    expect.assertions(1);
    const blockImage = await blockKitRenderer.imageFromView(
      {
        type: 'home',
        blocks: RestaurantBlocks(),
      },
      { encoding: 'base64' },
    );

    expect(typeof blockImage).toBe('string');
  });

  it('exposes browser to enable better jest snapshot testing', () => {
    expect.assertions(1);
    expect(blockKitRenderer.browser).toBeDefined();
  });

  describe('after creating a not logged-in renderer', () => {
    let notLoggedInRenderer: BlockKitRenderer;

    beforeAll(() => {
      notLoggedInRenderer = new BlockKitRenderer();
    });

    afterAll(async () => {
      await notLoggedInRenderer.close();
    });

    it('throws when rendering before logging in', async () => {
      expect.assertions(1);

      await expect(
        notLoggedInRenderer.imageFromBlocks(RestaurantBlocks()),
      ).rejects.toThrowError();
    });

    it('allows connecting to existing logged in browser', async () => {
      expect.assertions(2);

      const loggedInEndpoint = blockKitRenderer.browser?.wsEndpoint();

      await notLoggedInRenderer.connect({
        browserWSEndpoint: loggedInEndpoint,
      });

      expect(notLoggedInRenderer.browser?.wsEndpoint()).toEqual(
        loggedInEndpoint,
      );

      const blockImage = await notLoggedInRenderer.imageFromBlocks(
        RestaurantBlocks(),
      );

      expect(blockImage).toMatchImageSnapshot(imageCompareOptions);
    });
  });

  describe('after starting a browser', () => {
    let browser: Browser;
    let noBrowserRenderer: BlockKitRenderer;

    beforeAll(async () => {
      browser = await puppeteer.launch();
      noBrowserRenderer = new BlockKitRenderer();
    });

    afterAll(async () => {
      await noBrowserRenderer.close();
    });

    it('allows rendering into an existing browser', async () => {
      expect.assertions(1);
      const loggedInEndpoint = browser.wsEndpoint();

      await noBrowserRenderer.connect({
        browserWSEndpoint: loggedInEndpoint,
      });

      await noBrowserRenderer.login(
        process.env.SLACK_DOMAIN || '',
        process.env.SLACK_EMAIL || '',
        process.env.SLACK_PASSWORD || '',
      );

      const blockImage = await noBrowserRenderer.imageFromBlocks(
        RestaurantBlocks(),
      );

      expect(blockImage).toMatchImageSnapshot(imageCompareOptions);
    });
  });
});
