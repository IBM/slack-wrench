import { PlainTextElement } from '@slack/types';
import { flatten, repeat } from 'ramda';

import {
  Confirm,
  Filter,
  Markdown,
  OptionGroup,
  OptionObject,
  PlainText,
} from './compositionObjects';
import { disallow, truncate } from './limitHelpers';

const dynamicText = '0123456789'.repeat(301); // 3010 characters long
const dynamicTextElement: PlainTextElement = {
  type: 'plain_text',
  text: dynamicText,
};

describe('Element composition', () => {
  const text = 'Ravenclaw is obviously the best house.';

  describe('markdown object', () => {
    it('renders', () => {
      expect.assertions(1);
      expect(Markdown(text)).toMatchSnapshot();
    });
  });

  describe('plaintext object', () => {
    it('renders', () => {
      expect.assertions(1);
      expect(PlainText(text)).toMatchSnapshot();
    });

    it('renders without emoji', () => {
      expect.assertions(1);
      expect(PlainText(text, false)).toMatchSnapshot();
    });
  });

  describe('filter', () => {
    it('renders', () => {
      expect.assertions(1);
      expect(Filter(['im', 'mpim', 'private', 'public'])).toMatchSnapshot();
    });

    it('renders with just string include', () => {
      expect.assertions(1);
      expect(Filter('im')).toMatchSnapshot();
    });

    it('renders with excludes', () => {
      expect.assertions(1);
      expect(Filter('im', true, true)).toMatchSnapshot();
    });
  });

  describe('confirm object', () => {
    it('renders', () => {
      expect.assertions(1);
      expect(
        Confirm(
          `Girl don't do it, it's not worth it`,
          `I'm not gonna do it girl; I was just thinking about it. I'm not gonna do it`,
          'I did it',
          `I didn't do it`,
          'primary',
        ),
      ).toMatchSnapshot();
    });

    it('truncates ellipsis', () => {
      expect.assertions(4);
      const confirm = Confirm(
        dynamicText,
        dynamicText,
        dynamicText,
        dynamicText,
      );
      expect(confirm.title?.text).toEqual(`${dynamicText.substr(0, 98)} …`);
      expect(confirm.text?.text).toEqual(`${dynamicText.substr(0, 298)} …`);
      expect(confirm.confirm?.text).toEqual(`${dynamicText.substr(0, 28)} …`);
      expect(confirm.deny?.text).toEqual(
        `${dynamicTextElement.text.substr(0, 28)} …`,
      );
    });

    it('allows override LimitOpts for too long value', () => {
      expect.assertions(1);
      const confirm = Confirm(
        dynamicText,
        dynamicText,
        dynamicText,
        dynamicText,
        undefined,
        {
          title: truncate,
        },
      );
      expect(confirm.title?.text).toEqual(dynamicText.substr(0, 100));
    });
  });

  describe('option object', () => {
    it('renders', () => {
      expect.assertions(1);
      expect(OptionObject('Why best?', 'why-best-raven')).toMatchSnapshot();
    });

    it('truncates ellipsis for text, description', () => {
      expect.assertions(2);
      const option = OptionObject(dynamicText, 'why-best-raven', {
        description: dynamicTextElement,
      });
      expect(option.text).toEqual(PlainText(`${dynamicText.substr(0, 73)} …`));
      expect(option.description).toEqual({
        ...dynamicTextElement,
        text: `${dynamicTextElement.text.substr(0, 73)} …`,
      });
    });

    it('truncates url', () => {
      expect.assertions(1);
      const option = OptionObject('text', 'value', { url: dynamicText });
      expect(option.url).toHaveLength(3000);
    });

    it('disallows too long value', () => {
      expect.assertions(1);
      expect(() => {
        OptionObject('Why best?', dynamicText);
      }).toThrow();
    });

    it('allows override LimitOpts for too long value', () => {
      expect.assertions(1);
      const option = OptionObject('Why best?', dynamicText, undefined, {
        value: truncate,
      });
      expect(option.value).toHaveLength(75);
    });
  });

  describe('option group object', () => {
    const options = [
      OptionObject('3', 'and the Prisoner of Azkaban'),
      OptionObject('6', 'and the Half-Blood Prince'),
      OptionObject('7', 'and the Deathly Hallows'),
    ];
    const tooLongOptions = flatten(repeat(options, 35)); // 105 options

    it('renders', () => {
      expect.assertions(1);
      expect(OptionGroup('Top-tier', options)).toMatchSnapshot();
    });

    it('truncates ellipsis for label', () => {
      expect.assertions(1);
      const optionGroup = OptionGroup(dynamicText, options);
      expect(optionGroup.label?.text).toEqual(`${dynamicText.substr(0, 73)} …`);
    });

    it('truncates options', () => {
      expect.assertions(1);
      const option = OptionGroup('Top-tier', tooLongOptions);
      expect(option.options).toHaveLength(100);
    });

    it('allows override LimitOpts for too long value', () => {
      expect.assertions(1);
      expect(() => {
        return OptionGroup('Top-tier', tooLongOptions, {
          options: disallow,
        });
      }).toThrow();
    });
  });
});
