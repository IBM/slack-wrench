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

const Resturant = (description: string, image: string) =>
  MdSection(description, {
    accessory: Image(image, 'alt text for image'),
  });

const ResturantBlocks = (resturantTimes = 1) =>
  Blocks([
    MdSection(
      'Hello, Assistant to the Regional Manager Dwight! ' +
        "*Michael Scott* wants to know where you'd like to take the Paper Company investors to dinner tonight.\n\n" +
        '*Please select a restaurant:*',
    ),
    Divider(),
    ...times(
      () =>
        Resturant(
          "*Al's Burger Shack*\n" +
            ':star::star::star::star::star: 567 reviews\n' +
            "Al's Burger Shack is a great place to enjoy a juicy burger with delicious, crisp rosemary-dusted crinkle fries.",
          'https://s3-media0.fl.yelpcdn.com/bphoto/ggIUPo985Y2Lc0sjjMqYsg/258s.jpg',
        ),
      resturantTimes,
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
      ResturantBlocks(),
    );

    expect(blockImage).toMatchImageSnapshot();
  });

  it('can render long blocks', async () => {
    expect.assertions(1);

    const blockImage = await blockKitRenderer.imageFromBlocks(
      ResturantBlocks(10),
    );

    expect(blockImage).toMatchImageSnapshot();
  });

  it('can render a block as a modal', async () => {
    expect.assertions(1);

    const blockImage = await blockKitRenderer.imageFromBlocks(
      ResturantBlocks(),
      'modal',
    );

    expect(blockImage).toMatchImageSnapshot();
  });

  it('can render a block as in App Home', async () => {
    expect.assertions(1);

    const blockImage = await blockKitRenderer.imageFromBlocks(
      ResturantBlocks(),
      'appHome',
    );

    expect(blockImage).toMatchImageSnapshot();
  });

  it('throws when rendering and not logging in', async () => {
    expect.assertions(1);
    const notLoggedInRenderer = new BlockKitRenderer();

    await expect(
      notLoggedInRenderer.imageFromBlocks(ResturantBlocks()),
    ).rejects.toThrowError();
  });

  it('allows overriding snapshot options', async () => {
    expect.assertions(1);
    const blockImage = await blockKitRenderer.imageFromBlocks(
      ResturantBlocks(),
      'appHome',
      { encoding: 'base64' },
    );

    expect(blockImage).toMatch(/==$/);
  });
});
