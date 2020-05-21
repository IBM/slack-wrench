import { PlainTextElement } from '@slack/types';

import { truncate } from '../lengthHelpers';
import { OptionObject } from './optionObject';

const dynamicText = '0123456789'.repeat(301); // 3010 characters long
const dynamicTextElement: PlainTextElement = {
  type: 'plain_text',
  text: dynamicText,
};

describe('Element option object', () => {
  it('renders', () => {
    expect.assertions(1);
    expect(OptionObject('Why best?', 'why-best-raven')).toMatchSnapshot();
  });

  it('truncates ellipsis for text, description', () => {
    expect.assertions(1);
    expect(
      OptionObject(dynamicText, 'why-best-raven', {
        description: dynamicTextElement,
      }),
    ).toMatchSnapshot();
  });

  it('truncates url', () => {
    expect.assertions(1);
    expect(
      OptionObject('Why best?', 'why-best-raven', {
        url: dynamicText,
      }),
    ).toMatchSnapshot();
  });

  it('disallows too long value', () => {
    expect.assertions(1);
    expect(() => {
      OptionObject('Why best?', dynamicText);
    }).toThrow();
  });

  it('allows override truncateOptions for too long value', () => {
    expect.assertions(1);
    expect(
      OptionObject('Why best?', dynamicText, undefined, {
        value: truncate,
      }),
    ).toMatchSnapshot();
  });
});
