import { MrkdwnElement, Option, PlainTextElement } from '@slack/types';
import { mergeLeft } from 'ramda';

import {
  applyTruncations,
  disallow,
  ellipsis,
  truncate,
  TruncateFunction,
  TruncateOptions,
  truncators,
  truncLimits,
} from './lengthHelpers';

// Composition Object Helpers --- https://api.slack.com/reference/block-kit/composition-objects

// --- Text Object ---  https://api.slack.com/reference/block-kit/composition-objects#text
export const Markdown = (text: string): MrkdwnElement => ({
  type: 'mrkdwn',
  text,
});

export const PlainText = (text: string, emoji = true): PlainTextElement => ({
  type: 'plain_text',
  text,
  emoji,
});

// --- Confirm Object --- https://api.slack.com/reference/block-kit/composition-objects#confirm

// --- Option Object --- https://api.slack.com/reference/block-kit/composition-objects#option
const optionTruncates: TruncateOptions = {
  text: [75, ellipsis],
  value: [75, disallow],
  description: [75, ellipsis],
  url: [3000, truncate],
};

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

// --- Option Group Object --- https://api.slack.com/reference/block-kit/composition-objects#option_group

// --- Filter Object --- https://api.slack.com/reference/block-kit/composition-objects#filter_conversations
