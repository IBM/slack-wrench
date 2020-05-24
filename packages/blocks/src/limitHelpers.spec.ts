import { takeLast } from 'ramda';

import {
  applyLimiters,
  applyLimitersWithOverrides,
  disallow,
  ellipsis,
  identity,
  limiters,
  LimitOpts,
  limits,
  truncate,
} from './limitHelpers';

describe('Truncation helpers', () => {
  it(`disallow function throws`, () => {
    expect.assertions(1);
    expect(() => {
      disallow(5, '123456');
    }).toThrow();
  });

  it(`ellipsis function adds ellipsis to text and stays under max`, () => {
    expect.assertions(1);
    expect(ellipsis(5, 'abcdef')).toEqual('abc …');
  });

  it(`ellipsis function applies to text prop if given object`, () => {
    expect.assertions(1);
    expect(ellipsis(5, { text: 'abcdef' })).toEqual({ text: 'abc …' });
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

  const optionTruncates: LimitOpts = {
    text: [75, ellipsis],
    value: [75, disallow],
  };

  it(`limits function extracts limits from LimitOpts`, () => {
    expect.assertions(1);
    expect(limits(optionTruncates)).toEqual({ text: 75, value: 75 });
  });

  it(`limiters function extracts functions from LimitOpts`, () => {
    expect.assertions(1);
    expect(limiters(optionTruncates)).toEqual({
      text: ellipsis,
      value: disallow,
    });
  });

  describe('applyLimiters', () => {
    const last2 = [{ text: '789012' }, { text: '456789' }];
    const fieldsObj = { fields: [{ text: '123456' }, ...last2] };
    const fieldsDefaultOptions: LimitOpts = {
      fields: [2, truncate, { text: [5, ellipsis] }],
    };
    const fieldsDefaultTruncators = limiters(fieldsDefaultOptions);
    const fieldsDefaultLimits = limits(fieldsDefaultOptions);

    it(`function applies truncation functions to object properties`, () => {
      expect.assertions(1);
      expect(
        applyLimiters(
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

    it(`function applies truncation functions to list and nested objects in list`, () => {
      expect.assertions(2);
      const applied = applyLimiters(
        fieldsObj,
        fieldsDefaultTruncators,
        fieldsDefaultLimits,
      );

      expect(applied.fields).toHaveLength(2);
      expect(applied.fields[1].text).toEqual('789 …');
    });

    it(`WithOverrides function applies user overridden truncation functions to lists`, () => {
      expect.assertions(1);
      const applied = applyLimitersWithOverrides(
        fieldsObj,
        fieldsDefaultOptions,
        {
          fields: takeLast,
        },
      );

      expect(applied.fields).toEqual(last2);
    });

    it(`WithOverrides function applies user overridden truncation functions to lists and nested functions`, () => {
      expect.assertions(2);
      const applied = applyLimitersWithOverrides(
        fieldsObj,
        fieldsDefaultOptions,
        {
          fields: [identity, { text: truncate }],
        },
      );

      expect(applied.fields).toHaveLength(3);
      expect(applied.fields[1].text).toEqual('78901');
    });
  });
});
