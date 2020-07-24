import S from '@slack/types';

import {
  applyLimitersWithOverrides,
  disallow,
  ellipsis,
  LimiterFuncs,
  truncate,
} from './limitHelpers';

// Composition Object Helpers --- https://api.slack.com/reference/block-kit/composition-objects

// --- Text Object ---  https://api.slack.com/reference/block-kit/composition-objects#text
export const MrkdwnElement = (text: string): S.MrkdwnElement => ({
  type: 'mrkdwn',
  text,
});

export const Mrkdwn = MrkdwnElement;
// note that this isn't real markdown; alias is for ease of use / backwards compatibility
export const Markdown = MrkdwnElement;

export const PlainTextElement = (
  text: string,
  emoji = true,
): S.PlainTextElement => ({
  type: 'plain_text',
  text,
  emoji,
});

export const PlainText = PlainTextElement;

// --- Confirm Object --- https://api.slack.com/reference/block-kit/composition-objects#confirm

// --- Option Object --- https://api.slack.com/reference/block-kit/composition-objects#option
export const Option = (
  text: string,
  value: string,
  optionBlock: Partial<S.Option> = {},
  limiterOverrides?: LimiterFuncs,
): S.Option =>
  applyLimitersWithOverrides<S.Option>(
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

export const OptionObject = Option;

// --- Option Group Object --- https://api.slack.com/reference/block-kit/composition-objects#option_group

// --- Filter Object --- https://api.slack.com/reference/block-kit/composition-objects#filter_conversations
