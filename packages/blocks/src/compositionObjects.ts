import S from '@slack/types';

import {
  applyLimitersWithOverrides,
  disallow,
  ellipsis,
  LimiterFuncs,
  truncate,
} from './limitHelpers';

// Composition Object Helpers --- https://api.slack.com/reference/block-kit/composition-objects

/**
 * Mrkdwn Text Object --- An object containing some text, formatted using mrkdwn, "[Slack's] proprietary textual markup that's just different enough from Markdown to frustrate you."
 *
 * @param text - The text for the block. This field accepts any of the standard [text formatting markup](https://api.slack.com/reference/surfaces/formatting)
 *
 * https://api.slack.com/reference/block-kit/composition-objects#text
 */
export const MrkdwnElement = (text: string): S.MrkdwnElement => ({
  type: 'mrkdwn',
  text,
});

export const Mrkdwn = MrkdwnElement;
// note that this isn't real markdown; alias is for ease of use / backwards compatibility
export const Markdown = MrkdwnElement;

/**
 * Text Object --- An object containing some text, formatted using plain_text.
 *
 * @param text - 	The text for the block.
 * @param emoji - Indicates whether emojis in a text field should be escaped into the colon emoji format.
 *
 * https://api.slack.com/reference/block-kit/composition-objects#text
 */
export const PlainTextElement = (
  text: string,
  emoji = true,
): S.PlainTextElement => ({
  type: 'plain_text',
  text,
  emoji,
});

export const PlainText = PlainTextElement;

/** Confirm Object - An object that defines a dialog that provides a confirmation step to any interactive element. This dialog will ask the user to confirm their action by offering a confirm and deny buttons.
 *
 * https://api.slack.com/reference/block-kit/composition-objects#confirm
 */
export const Confirm = (
  title: string,
  text: string,
  confirm: string,
  deny: string,
  style?: 'primary' | 'danger',
  limiterOverrides?: LimiterFuncs,
): S.Confirm =>
  applyLimitersWithOverrides<S.Confirm>(
    {
      title: PlainText(title),
      text: Mrkdwn(text),
      confirm: PlainText(confirm),
      deny: PlainText(deny),
      style,
    },
    {
      title: [100, ellipsis],
      text: [300, ellipsis],
      confirm: [30, ellipsis],
      deny: [30, ellipsis],
    },
    limiterOverrides,
  );

/** Option Object - An object that represents a single selectable item in a select menu, multi-select menu, checkbox group, radio button group, or overflow menu.
 *
 * https://api.slack.com/reference/block-kit/composition-objects#option
 */
export const Option = (
  text: string,
  value: S.Option['value'],
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

export interface OptionGroup {
  label: S.PlainTextElement;
  options: S.Option[];
}

/** Option Group Object - Provides a way to group options in a select menu or multi-select menu.
 * Provide this to applicable Blocks as an array of OptionGroups as the `option_groups` property.
 *
 * https://api.slack.com/reference/block-kit/composition-objects#option_group
 */
export const OptionGroup = (
  label: string,
  options: OptionGroup['options'],
  limiterOverrides?: LimiterFuncs,
): OptionGroup =>
  applyLimitersWithOverrides<OptionGroup>(
    {
      label: PlainText(label),
      options,
    },
    {
      label: [75, ellipsis],
      options: [100, truncate],
    },
    limiterOverrides,
  );

export type ConversationType = 'im' | 'mpim' | 'private' | 'public';

export interface Filter {
  include?: ConversationType[];
  exclude_external_shared_channels?: boolean;
  exclude_bot_users?: boolean;
}

// --- Filter Object --- https://api.slack.com/reference/block-kit/composition-objects#filter_conversations
export const Filter = (
  include: ConversationType | Filter['include'],
  exclude_external_shared_channels = false,
  exclude_bot_users = false,
): Filter => ({
  include: typeof include === 'string' ? [include] : include,
  exclude_external_shared_channels,
  exclude_bot_users,
});
