import {
  applyTruncations,
  disallow,
  ellipsis,
  identity,
  truncate,
  TruncateOptions,
  truncators,
  truncLimits,
} from './lengthHelpers';

describe('Truncation helpers', () => {
  it(`disallow function throws`, () => {
    expect.assertions(1);
    expect(() => {
      disallow(5, '123456');
    }).toThrow();
  });

  it(`ellipsis function adds ellipsis to text and stays under max`, () => {
    expect.assertions(1);
    expect(ellipsis(5, 'abcdef')).toEqual('ab...');
  });

  it(`ellipsis function applies to text prop if given object`, () => {
    expect.assertions(1);
    expect(ellipsis(5, { text: 'abcdef' })).toEqual({ text: 'ab...' });
  });

  it(`identity function returns whatever is passed even if over max`, () => {
    expect.assertions(1);
    expect(identity(5, 'abcdef')).toEqual('abcdef');
  });

  it(`truncate function truncates strings to max length`, () => {
    expect.assertions(1);
    expect(truncate(5, 'abcdef')).toEqual('abcde');
  });

  it(`truncate function works with arrays`, () => {
    expect.assertions(1);
    expect(truncate(3, ['a', 'b', 'c', 'd', 'e'])).toEqual(['a', 'b', 'c']);
  });

  it(`truncate function returns original if under max`, () => {
    expect.assertions(1);
    expect(truncate(5, 'abcd')).toEqual('abcd');
  });

  const optionTruncates: TruncateOptions = {
    text: [75, ellipsis],
    value: [75, disallow],
  };

  it(`truncLimits function extracts limits from TruncateOptions`, () => {
    expect.assertions(1);
    expect(truncLimits(optionTruncates)).toEqual({ text: 75, value: 75 });
  });

  it(`truncators function extracts functions from TruncateOptions`, () => {
    expect.assertions(1);
    expect(truncators(optionTruncates)).toEqual({
      text: ellipsis,
      value: disallow,
    });
  });

  it(`applyTruncations function applies truncation functions to object properties`, () => {
    expect.assertions(1);
    expect(
      applyTruncations(
        {
          text: 'abcdef',
          description: { text: 'abcdef' },
          value: 'abcdef',
          placeholder: 'here',
        },
        {
          text: truncate,
          description: ellipsis,
          value: disallow,
          placeholder: ellipsis,
        },
        { text: 5, description: 4, value: 10, placeholder: 10 },
      ),
    ).toMatchSnapshot();
  });
});
