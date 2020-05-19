import {
  Button as TButton,
  ChannelsSelect,
  Checkboxes,
  ConversationsSelect,
  ImageElement,
  InputBlock,
  MrkdwnElement,
  MultiChannelsSelect,
  MultiConversationsSelect,
  MultiUsersSelect,
  Option,
  Overflow,
  PlainTextElement,
  PlainTextInput,
  RadioButtons,
  StaticSelect,
  UsersSelect,
} from '@slack/types';

import {
  disallow,
  ellipsis,
  truncate,
  TruncateFunction,
  TruncateOptions,
  truncator,
  applyTruncations,
} from './lengthHelpers';

// Composition Object Helpers --- https://api.slack.com/reference/block-kit/composition-objects

// --- Text Objects ---  https://api.slack.com/reference/block-kit/composition-objects#text
export const Markdown = (text: string): MrkdwnElement => ({
  type: 'mrkdwn',
  text,
});

export const PlainText = (text: string, emoji = true): PlainTextElement => ({
  type: 'plain_text',
  text,
  emoji,
});

// --- Confirmation Object --- https://api.slack.com/reference/block-kit/composition-objects#confirm

// --- Option Object ---
// const optionTruncateOptions: TruncateOptions = {
//   text: truncator<TextElement>(75, ellipsis), // plaintext in overflow, select, multi-select; radio and checkbox cn use mrkdwn
//   value: truncator<string>(75, disallow), // assuming user needs this to be specific, fail if invalid
//   description: truncator<PlainTextElement>(75, ellipsis),
//   url: truncator<string>(3000, truncate),
// };

export const OptionObject = (
  // only works with PlainText at the moment https://github.com/slackapi/node-slack-sdk/issues/973
  text: string,
  value: string,
  optionBlock: Partial<Option> = {},
  truncateOptions: Record<string, TruncateFunction> = {
    text: ellipsis,
    value: disallow,
    description: ellipsis,
    url: truncate,
  },
): Option =>
  applyTruncations<Option>(
    {
      text: PlainText(text),
      value,
      ...optionBlock,
    },
    truncateOptions,
    {
      text: 75,
      value: 75,
      description: 75,
      url: 3000,
    },
  );

// --- Option Group Object --- https://api.slack.com/reference/block-kit/composition-objects#option_group

// Block Element Helpers --- https://api.slack.com/reference/block-kit/block-elements
const InputElement = <T extends InputBlock['element']>(type: T['type']) => (
  action_id: T['action_id'],
  opts: Partial<T>,
): T => ({ type, action_id, ...opts } as T);

// --- Button Element --- https://api.slack.com/reference/block-kit/block-elements#button
export const Button = (
  text: string,
  action_id: string,
  buttonBlock?: Partial<TButton>,
): TButton => ({
  type: 'button',
  text: PlainText(text),
  action_id,
  ...buttonBlock,
});

// --- Checkbox Group --- https://api.slack.com/reference/block-kit/block-elements#checkboxes
export const CheckboxInputElement = (
  action_id: Checkboxes['action_id'],
  options: Checkboxes['options'],
  initial_options?: Checkboxes['initial_options'],
  opts: Partial<Checkboxes> = {},
): Checkboxes =>
  InputElement<Checkboxes>('checkboxes')(action_id, {
    options,
    initial_options,
    ...opts,
  });

// --- Date Picker Element --- https://api.slack.com/reference/block-kit/block-elements#datepicker

// --- Image Element --- https://api.slack.com/reference/block-kit/block-elements#image
export const Image = (image_url: string, alt_text: string): ImageElement => ({
  type: 'image',
  image_url,
  alt_text,
});

// --- Multi-select Menu Element --- https://api.slack.com/reference/block-kit/block-elements#multi_select

// https://api.slack.com/reference/block-kit/block-elements#static_multi_select

// https://api.slack.com/reference/block-kit/block-elements#channel_multi_select
export const MultiChannelsSelectInputElement = (
  action_id: MultiChannelsSelect['action_id'],
  placeholder: string,
  initial_channels?: MultiChannelsSelect['initial_channels'],
  opts: Partial<MultiChannelsSelect> = {},
): MultiChannelsSelect =>
  InputElement<MultiChannelsSelect>('multi_channels_select')(action_id, {
    placeholder: PlainText(placeholder),
    initial_channels,
    ...opts,
  });

// https://api.slack.com/reference/block-kit/block-elements#conversation_multi_select
export const MultiConversationsSelectInputElement = (
  action_id: MultiConversationsSelect['action_id'],
  placeholder: string,
  initial_conversations?: MultiConversationsSelect['initial_conversations'],
  opts: Partial<MultiConversationsSelect> = {},
): MultiConversationsSelect =>
  InputElement<MultiConversationsSelect>('multi_conversations_select')(
    action_id,
    {
      placeholder: PlainText(placeholder),
      initial_conversations,
      ...opts,
    },
  );

// https://api.slack.com/reference/block-kit/block-elements#users_multi_select
export const MultiUsersSelectInputElement = (
  action_id: MultiUsersSelect['action_id'],
  placeholder: string,
  initial_users?: MultiUsersSelect['initial_users'],
  opts: Partial<MultiUsersSelect> = {},
): MultiUsersSelect =>
  InputElement<MultiUsersSelect>('multi_users_select')(action_id, {
    placeholder: PlainText(placeholder),
    initial_users,
    ...opts,
  });

// --- Overflow Menu Element --- https://api.slack.com/reference/block-kit/block-elements#overflow
export const OverflowMenu = (
  options: Option[],
  action_id: string,
  menuBlock?: Partial<Overflow>,
): Overflow => ({
  type: 'overflow',
  options,
  action_id,
  ...menuBlock,
});

// --- Plain-text Input Element --- https://api.slack.com/reference/block-kit/block-elements#input
export const PlainTextInputElement = (
  action_id: PlainTextInput['action_id'],
  initial_value?: PlainTextInput['initial_value'],
  placeholder?: string,
  opts: Partial<PlainTextInput> = {},
): PlainTextInput =>
  InputElement<PlainTextInput>('plain_text_input')(action_id, {
    initial_value,
    placeholder: placeholder ? PlainText(placeholder) : undefined,
    ...opts,
  });

// --- Radio Button Group Element --- https://api.slack.com/reference/block-kit/block-elements#radio
export const RadioInputElement = (
  action_id: RadioButtons['action_id'],
  options: RadioButtons['options'],
  initial_option?: RadioButtons['initial_option'],
  opts: Partial<RadioButtons> = {},
): RadioButtons =>
  InputElement<RadioButtons>('radio_buttons')(action_id, {
    options,
    initial_option,
    ...opts,
  });

// --- Select Menu Element --- https://api.slack.com/reference/block-kit/block-elements#select
export const StaticSelectInputElement = (
  action_id: StaticSelect['action_id'],
  placeholder: string,
  options: StaticSelect['options'],
  initial_option?: StaticSelect['initial_option'],
  opts: Partial<StaticSelect> = {},
): StaticSelect =>
  InputElement<StaticSelect>('static_select')(action_id, {
    placeholder: PlainText(placeholder),
    options,
    initial_option,
    ...opts,
  });

// https://api.slack.com/reference/block-kit/block-elements#channel_select
export const ChannelsSelectInputElement = (
  action_id: ChannelsSelect['action_id'],
  placeholder: string,
  initial_channel?: ChannelsSelect['initial_channel'],
  opts: Partial<ChannelsSelect> = {},
): ChannelsSelect =>
  InputElement<ChannelsSelect>('channels_select')(action_id, {
    placeholder: PlainText(placeholder),
    initial_channel,
    ...opts,
  });

// https://api.slack.com/reference/block-kit/block-elements#conversation_select
export const ConversationsSelectInputElement = (
  action_id: ConversationsSelect['action_id'],
  placeholder: string,
  initial_conversation?: ConversationsSelect['initial_conversation'],
  opts: Partial<ConversationsSelect> = {},
): ConversationsSelect =>
  InputElement<ConversationsSelect>('conversations_select')(action_id, {
    placeholder: PlainText(placeholder),
    initial_conversation,
    ...opts,
  });

// https://api.slack.com/reference/block-kit/block-elements#users_select
export const UsersSelectInputElement = (
  action_id: UsersSelect['action_id'],
  placeholder: string,
  initial_user?: UsersSelect['initial_user'],
  opts: Partial<UsersSelect> = {},
): UsersSelect =>
  InputElement<UsersSelect>('users_select')(action_id, {
    placeholder: PlainText(placeholder),
    initial_user,
    ...opts,
  });
