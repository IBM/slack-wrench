import { KnownBlock } from '@slack/types';
import { chain, intersperse, repeat, takeLast } from 'ramda';

import {
  Actions,
  Blocks,
  Context,
  Divider,
  FieldsSection,
  HomeBlocks,
  Input,
  MdSection,
  MessageBlocks,
  ModalBlocks,
  Section,
} from './blocks';
import { Button, Markdown, PlainText, PlainTextInputElement } from './elements';
import { DateString } from './formatting';
import { disallow, truncate } from './limitHelpers';

const dynamicText = '0123456789'.repeat(301); // 3010 characters long

describe('Slack Block widgets', () => {
  const text = 'Ravenclaw is obviously the best house.';
  const buttonId = 'ravenAgree';

  describe('actions', () => {
    it('renders', () => {
      expect.assertions(1);
      expect(
        Actions([Button(text, buttonId), Button(text, `${buttonId}-2`)]),
      ).toMatchSnapshot();
    });

    it('allows providing limit overrides', () => {
      expect.assertions(1);
      const sixButtons = repeat(Button(text, buttonId), 6);
      expect(() => {
        return Actions(sixButtons, { elements: disallow });
      }).toThrow();
    });
  });

  describe('context', () => {
    it('renders', () => {
      expect.assertions(1);
      expect(Context([PlainText(text)])).toMatchSnapshot();
    });

    it('allows providing limit overrides', () => {
      expect.assertions(1);
      const twelveElements = repeat(PlainText(text), 12);
      expect(() => {
        return Context(twelveElements, { elements: disallow });
      }).toThrow();
    });
  });

  describe('divider', () => {
    it('renders', () => {
      expect.assertions(1);
      expect(Divider()).toMatchSnapshot();
    });

    it('allows providing limit overrides', () => {
      expect.assertions(1);
      expect(
        Divider(dynamicText, { block_id: truncate }).block_id,
      ).toHaveLength(255);
    });
  });

  describe('input', () => {
    it('renders with minimal information', () => {
      expect.assertions(1);

      expect(Input('Title', PlainTextInputElement('title'))).toMatchSnapshot();
    });

    it('renders with block_id, hint, and as optional', () => {
      expect.assertions(1);

      expect(
        Input(
          'Title',
          PlainTextInputElement('title'),
          'title',
          PlainText('keep it to the true 7'),
          true,
        ),
      ).toMatchSnapshot();
    });

    it('truncates ellipsis for label', () => {
      expect.assertions(1);
      const input = Input(dynamicText, PlainTextInputElement('title'));
      expect(input.label).toEqual(
        PlainText(`${dynamicText.substr(0, 1997)}...`),
      );
    });

    it('allows override LimitOpts for too long value', () => {
      expect.assertions(1);
      const input = Input(
        'Title',
        PlainTextInputElement('title'),
        undefined,
        PlainText(dynamicText),
        undefined,
        {
          hint: truncate,
        },
      );
      expect(input.hint?.text).toHaveLength(2000);
    });
  });

  describe('section', () => {
    it('renders', () => {
      expect.assertions(1);
      expect(
        Section({
          text: PlainText(text),
          fields: [PlainText(text), Markdown(text)],
          accessory: Button(text, buttonId),
        }),
      ).toMatchSnapshot();
    });

    it('truncates fields and nested text', () => {
      expect.assertions(2);
      const tooLongFields = repeat(Markdown(dynamicText), 15);
      const section = Section({ text: PlainText(text), fields: tooLongFields });
      expect(section.fields).toHaveLength(10);
      expect(section.fields?.[0].text).toHaveLength(2000);
    });

    it('allows override LimitOpts for fields and nested text', () => {
      expect.assertions(1);
      const A500 = 'a'.repeat(500);
      const B500 = 'b'.repeat(500);
      const first10 = repeat(Markdown(A500), 10);
      const last10 = repeat(Markdown(A500.repeat(2) + B500.repeat(3)), 10);

      const section = Section(
        {
          text: PlainText(text),
          fields: [...first10, ...last10],
        },
        {
          fields: [takeLast, { text: takeLast }],
        },
      );

      const last2000 = A500 + B500.repeat(3);
      expect(section.fields).toEqual(repeat(Markdown(last2000), 10));
    });
  });

  describe('MdSection', () => {
    it('renders', () => {
      expect.assertions(1);
      expect(MdSection(text)).toMatchSnapshot();
    });

    it('accepts limiterOverrides', () => {
      expect.assertions(1);
      expect(
        MdSection(dynamicText, undefined, { text: truncate }).text?.text,
      ).toEqual(dynamicText.substring(0, 3000));
    });
  });

  describe('FieldsSection', () => {
    it('renders', () => {
      expect.assertions(1);
      expect(FieldsSection([text, text])).toMatchSnapshot();
    });

    it('accepts limiterOverrides', () => {
      expect.assertions(1);
      expect(
        FieldsSection([dynamicText, dynamicText], undefined, {
          fields: [truncate, { text: truncate }],
        }).fields?.[0].text,
      ).toEqual(dynamicText.substring(0, 2000));
    });
  });

  describe('Blocks helper', () => {
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

    it('filters null blocks', () => {
      expect.assertions(2);
      const blocks = intersperse(null, repeat(MdSection(text), 50));
      expect(Blocks(blocks)).toHaveLength(50);
      expect(Blocks(blocks)).not.toContain(null);
    });

    it('caps at 50 after removing null blocka if type given', () => {
      expect.assertions(1);
      const blocks = intersperse(null, repeat(MdSection(text), 100));
      expect(Blocks(blocks, 'message')).toHaveLength(50);
    });
  });

  describe('MessageBlocks helper', () => {
    it('MessageBlocks caps at 50', () => {
      expect.assertions(1);
      const blocks = repeat(MdSection(text), 100);
      expect(MessageBlocks(blocks)).toHaveLength(50);
    });

    it('allows overriding limitFn', () => {
      expect.assertions(1);
      const first50 = repeat(MdSection('hello'), 50);
      const last50 = repeat(MdSection('goodbye'), 50);
      expect(MessageBlocks([...first50, ...last50], takeLast)).toEqual(last50);
    });
  });

  describe('ModalBlocks helper', () => {
    it('ModalBlocks caps at 100', () => {
      expect.assertions(1);
      const blocks = repeat(MdSection(text), 200);
      expect(ModalBlocks(blocks)).toHaveLength(100);
    });

    it('allows overriding limitFn', () => {
      expect.assertions(1);
      const first100 = repeat(MdSection('hello'), 100);
      const last100 = repeat(MdSection('goodbye'), 100);
      expect(ModalBlocks([...first100, ...last100], takeLast)).toEqual(last100);
    });
  });

  describe('HomeBlocks helper', () => {
    it('HomeBlocks caps at 100', () => {
      expect.assertions(1);
      const blocks = repeat(MdSection(text), 200);
      expect(HomeBlocks(blocks)).toHaveLength(100);
    });

    it('allows overriding limitFn', () => {
      expect.assertions(1);
      const first100 = repeat(MdSection('hello'), 100);
      const last100 = repeat(MdSection('goodbye'), 100);
      expect(HomeBlocks([...first100, ...last100], takeLast)).toEqual(last100);
    });
  });
});
