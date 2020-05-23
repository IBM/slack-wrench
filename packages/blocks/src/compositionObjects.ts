import { MrkdwnElement, Option, PlainTextElement } from '@slack/types';

import {
  applyLimitersWithOverrides,
  disallow,
  ellipsis,
  LimiterFuncs,
  truncate,
} from './limitHelpers';

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
export const OptionObject = (
  text: string,
  value: string,
  optionBlock: Partial<Option> = {},
  limiterOverrides?: LimiterFuncs,
): Option =>
  applyLimitersWithOverrides<Option>(
    {
      text: PlainText(text),
      value,
      ...optionBlock,
    },
    {
      text: [75, ellipsis],
      value: [75, disallow],
      description: [75, ellipsis],
      url: [3000, truncate],
    },
    limiterOverrides,
  );

// --- Option Group Object --- https://api.slack.com/reference/block-kit/composition-objects#option_group

// --- Filter Object --- https://api.slack.com/reference/block-kit/composition-objects#filter_conversations
