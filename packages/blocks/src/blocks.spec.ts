import { KnownBlock } from '@slack/types';
import { chain } from 'ramda';

import {
  Actions,
  Blocks,
  Button,
  Context,
  Divider,
  Markdown,
  MdSection,
  PlainText,
  Section,
} from './blocks';
import { DateString } from './formatting';

describe('Slack Block widgets', () => {
  const text = 'Ravenclaw is obviously the best house.';
  const buttonId = 'ravenAgree';

  it('renders a divider', () => {
    expect.assertions(1);
    expect(Divider()).toMatchSnapshot();
  });

  it('renders markdown text', () => {
    expect.assertions(1);
    expect(Markdown(text)).toMatchSnapshot();
  });

  it('renders a plaintext block', () => {
    expect.assertions(1);
    expect(PlainText(text)).toMatchSnapshot();
  });

  it('renders a plaintext block without emoji', () => {
    expect.assertions(1);
    expect(PlainText(text, false)).toMatchSnapshot();
  });

  it('renders a section', () => {
    expect.assertions(1);
    expect(
      Section({
        text: PlainText(text),
        fields: [PlainText(text), Markdown(text)],
        accessory: Button(text, buttonId),
      }),
    ).toMatchSnapshot();
  });

  it('renders a markdown section', () => {
    expect.assertions(1);
    expect(MdSection(text)).toMatchSnapshot();
  });

  it('renders an actions', () => {
    expect.assertions(1);
    expect(
      Actions([Button(text, buttonId), Button(text, `${buttonId}-2`)]),
    ).toMatchSnapshot();
  });

  it('renders a button', () => {
    expect.assertions(1);
    expect(Button(text, buttonId)).toMatchSnapshot();
  });

  it('renders context', () => {
    expect.assertions(1);
    expect(Context([PlainText(text)])).toMatchSnapshot();
  });

  it('filters null blocks', () => {
    expect.assertions(1);
    expect(Blocks([MdSection(text), null, MdSection(text)]).length).toBe(2);
  });

  it('can compose blocks into bigger components', () => {
    expect.assertions(1);

    const channels = [
      {
        name: 'house-ravenclaw',
        purpose: 'Discuss Ravenclaw business',
        lastPost: 1575643433,
        memberCount: 120,
      },
      {
        name: 'house-hufflepuff',
        purpose: 'Discuss Hufflepuff puffery',
        memberCount: 107,
        lastPost: 1575643433,
      },
    ];

    expect(
      Blocks([
        MdSection(`Let me help you find some channels.`, {
          accessory: Button('Search', 'changeSearch'),
        }),
        Divider(),
        MdSection('*Channels*'),
        ...chain(
          (channel: any): KnownBlock[] => [
            MdSection(`*${channel.name}*\n${channel.purpose}`),
            Context([
              Markdown(
                `${channel.memberCount} members\n` +
                  `Last post: ${DateString(
                    channel.lastPost,
                    '{date_pretty}',
                    channel.lastPost.toString(),
                  )}`,
              ),
            ]),
            Actions([
              Button(':thumbsup:', 'thumbsUp', {
                value: channel.name,
              }),
              Button(':thumbsdown:', 'thumbsDown', {
                value: channel.name,
              }),
            ]),
          ],
          channels,
        ),
      ]),
    ).toMatchSnapshot();
  });
});
