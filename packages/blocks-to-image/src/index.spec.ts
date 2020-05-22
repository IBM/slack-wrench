import {
  Actions,
  Blocks,
  Button,
  Divider,
  Image,
  MdSection,
} from '@slack-wrench/blocks';
import { toMatchImageSnapshot } from 'jest-image-snapshot';
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
      'Hello, Assistant to the Regional Manager Dwight! ' +
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
    Actions([
      Button('Farmhouse', 'click_me_1'),
      Button('Kin Khao', 'click_me_2'),
    ]),
  ]);

describe('Block Images', () => {
  jest.setTimeout(30000);
  let blockKitRenderer: BlockKitRenderer;
  let connectedRenderer: BlockKitRenderer;

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
    await connectedRenderer.close();
  });

  it('can render a block as a message', async () => {
    expect.assertions(1);

    const blockImage = await blockKitRenderer.imageFromBlocks(
      RestaurantBlocks(),
    );

    expect(blockImage).toMatchImageSnapshot(imageCompareOptions);
  });

  it('can render long blocks', async () => {
    expect.assertions(1);

    const blockImage = await blockKitRenderer.imageFromBlocks(
      RestaurantBlocks(10),
    );

    expect(blockImage).toMatchImageSnapshot(imageCompareOptions);
  });

  it('can render a block as a modal', async () => {
    expect.assertions(1);

    const blockImage = await blockKitRenderer.imageFromBlocks(
      RestaurantBlocks(),
      'modal',
    );

    expect(blockImage).toMatchImageSnapshot(imageCompareOptions);
  });

  it('can render a block as in App Home', async () => {
    expect.assertions(1);

    const blockImage = await blockKitRenderer.imageFromBlocks(
      RestaurantBlocks(),
      'appHome',
    );

    expect(blockImage).toMatchImageSnapshot(imageCompareOptions);
  });

  it('throws when rendering and not logging in', async () => {
    expect.assertions(1);
    const notLoggedInRenderer = new BlockKitRenderer();

    await expect(
      notLoggedInRenderer.imageFromBlocks(RestaurantBlocks()),
    ).rejects.toThrowError();
  });

  it('allows overriding snapshot options', async () => {
    expect.assertions(1);
    const blockImage = await blockKitRenderer.imageFromBlocks(
      RestaurantBlocks(),
      'appHome',
      { encoding: 'base64' },
    );

    expect(blockImage).toMatch(/=$/);
  });

  it('exposes browser to enable better jest snapshot testing', () => {
    expect.assertions(1);
    expect(blockKitRenderer.browser).toBeDefined();
  });

  it('allows connecting to existing logged in browser', async () => {
    expect.assertions(2);
    jest.setTimeout(45 * 1000);

    connectedRenderer = new BlockKitRenderer();

    const loggedInEndpoint = blockKitRenderer.browser?.wsEndpoint();

    await connectedRenderer.connect({ browserWSEndpoint: loggedInEndpoint });

    expect(connectedRenderer.browser?.wsEndpoint()).toEqual(loggedInEndpoint);

    const blockImage = await connectedRenderer.imageFromBlocks(
      RestaurantBlocks(),
    );

    expect(blockImage).toMatchImageSnapshot(imageCompareOptions);
  });
});
