import { PlainTextElement } from '@slack/types';

import { Markdown, OptionObject, PlainText } from './compositionObjects';
import { truncate } from './lengthHelpers';

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
      expect(option.text).toEqual(PlainText(`${dynamicText.substr(0, 72)}...`));
      expect(option.description).toEqual({
        ...dynamicTextElement,
        text: `${dynamicTextElement.text.substr(0, 72)}...`,
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

    it('allows override truncateOptions for too long value', () => {
      expect.assertions(1);
      const option = OptionObject('Why best?', dynamicText, undefined, {
        value: truncate,
      });
      expect(option.value).toHaveLength(75);
    });
  });
});
