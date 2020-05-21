import { Option } from '@slack/types';
import { mergeLeft } from 'ramda';

import { PlainText } from '..';
import {
  applyTruncations,
  disallow,
  ellipsis,
  truncate,
  TruncateFunction,
  TruncateOptions,
  truncators,
  truncLimits,
} from '../lengthHelpers';

const optionTruncates: TruncateOptions = {
  text: [75, ellipsis],
  value: [75, disallow],
  description: [75, ellipsis],
  url: [3000, truncate],
};

// eslint-disable-next-line import/prefer-default-export
export const OptionObject = (
  text: string,
  value: string,
  optionBlock: Partial<Option> = {},
  truncateFunctions: Record<string, TruncateFunction> = {},
): Option =>
  applyTruncations<Option>(
    {
      text: PlainText(text),
      value,
      ...optionBlock,
    } as Option,
    mergeLeft(truncateFunctions, truncators(optionTruncates)),
    truncLimits(optionTruncates),
  );
