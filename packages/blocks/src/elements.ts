import {
  Button as TButton,
  ChannelsSelect,
  Checkboxes,
  ConversationsSelect,
  ImageElement,
  InputBlock,
  MultiChannelsSelect,
  MultiConversationsSelect,
  MultiUsersSelect,
  Option,
  Overflow,
  PlainTextInput,
  RadioButtons,
  StaticSelect,
  UsersSelect,
} from '@slack/types';

import { PlainText } from './compositionObjects';
import {
  applyLimitersWithOverrides,
  disallow,
  ellipsis,
  LimiterFuncs,
  LimitOpts,
  truncate,
} from './limitHelpers';

export * from './compositionObjects';

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
  limiterOverrides?: LimiterFuncs,
): TButton =>
  applyLimitersWithOverrides<TButton>(
    {
      type: 'button',
      text: PlainText(text),
      action_id,
      ...buttonBlock,
    },
    {
      text: [75, ellipsis],
      action_id: [255, disallow],
      url: [3000, truncate],
      value: [2000, disallow],
      options: [10, truncate],
    },
    limiterOverrides,
  );

// --- Checkbox Group --- https://api.slack.com/reference/block-kit/block-elements#checkboxes
export const CheckboxInputElement = (
  action_id: Checkboxes['action_id'],
  options: Checkboxes['options'],
  initial_options?: Checkboxes['initial_options'],
  opts: Partial<Checkboxes> = {},
  limiterOverrides?: LimiterFuncs,
): Checkboxes =>
  applyLimitersWithOverrides<Checkboxes>(
    InputElement<Checkboxes>('checkboxes')(action_id, {
      options,
      initial_options,
      ...opts,
    }),
    {
      action_id: [255, disallow],
      // not in docs, but tested and validated that this breaks after 10
      options: [10, truncate],
      initial_options: [10, truncate],
    },
    limiterOverrides,
  );

// --- Date Picker Element --- https://api.slack.com/reference/block-kit/block-elements#datepicker

// --- Image Element --- https://api.slack.com/reference/block-kit/block-elements#image (this is both a block element and a block)
export const Image = (
  image_url: string,
  alt_text: string,
  limiterOverrides?: LimiterFuncs,
): ImageElement =>
  applyLimitersWithOverrides<ImageElement>(
    {
      type: 'image',
      image_url,
      alt_text,
    },
    { image_url: [3000, truncate], alt_text: [2000, ellipsis] },
    limiterOverrides,
  );

// --- Multi-select Menu Element --- https://api.slack.com/reference/block-kit/block-elements#multi_select

const multiSelectLimitOpts: LimitOpts = {
  action_id: [255, disallow],
  placeholder: [150, ellipsis],
  options: [100, truncate],
  option_groups: [100, truncate],
  initial_options: [100, truncate],
};

// https://api.slack.com/reference/block-kit/block-elements#static_multi_select

// https://api.slack.com/reference/block-kit/block-elements#channel_multi_select
export const MultiChannelsSelectInputElement = (
  action_id: MultiChannelsSelect['action_id'],
  placeholder: string,
  initial_channels?: MultiChannelsSelect['initial_channels'],
  opts: Partial<MultiChannelsSelect> = {},
  limiterOverrides?: LimiterFuncs,
): MultiChannelsSelect =>
  applyLimitersWithOverrides<MultiChannelsSelect>(
    InputElement<MultiChannelsSelect>('multi_channels_select')(action_id, {
      placeholder: PlainText(placeholder),
      initial_channels,
      ...opts,
    }),
    multiSelectLimitOpts,
    limiterOverrides,
  );

// https://api.slack.com/reference/block-kit/block-elements#conversation_multi_select
export const MultiConversationsSelectInputElement = (
  action_id: MultiConversationsSelect['action_id'],
  placeholder: string,
  initial_conversations?: MultiConversationsSelect['initial_conversations'],
  opts: Partial<MultiConversationsSelect> = {},
  limiterOverrides?: LimiterFuncs,
): MultiConversationsSelect =>
  applyLimitersWithOverrides<MultiConversationsSelect>(
    InputElement<MultiConversationsSelect>('multi_conversations_select')(
      action_id,
      {
        placeholder: PlainText(placeholder),
        initial_conversations,
        ...opts,
      },
    ),
    multiSelectLimitOpts,
    limiterOverrides,
  );

// https://api.slack.com/reference/block-kit/block-elements#users_multi_select
export const MultiUsersSelectInputElement = (
  action_id: MultiUsersSelect['action_id'],
  placeholder: string,
  initial_users?: MultiUsersSelect['initial_users'],
  opts: Partial<MultiUsersSelect> = {},
  limiterOverrides?: LimiterFuncs,
): MultiUsersSelect =>
  applyLimitersWithOverrides<MultiUsersSelect>(
    InputElement<MultiUsersSelect>('multi_users_select')(action_id, {
      placeholder: PlainText(placeholder),
      initial_users,
      ...opts,
    }),
    multiSelectLimitOpts,
    limiterOverrides,
  );

// --- Overflow Menu Element --- https://api.slack.com/reference/block-kit/block-elements#overflow
export const OverflowMenu = (
  options: Option[],
  action_id: string,
  menuBlock?: Partial<Overflow>,
  limiterOverrides?: LimiterFuncs,
): Overflow =>
  applyLimitersWithOverrides<Overflow>(
    {
      type: 'overflow',
      options,
      action_id,
      ...menuBlock,
    },
    {
      action_id: [255, disallow],
      options: [5, truncate],
    },
    limiterOverrides,
  );

// --- Plain-text Input Element --- https://api.slack.com/reference/block-kit/block-elements#input
export const PlainTextInputElement = (
  action_id: PlainTextInput['action_id'],
  initial_value?: PlainTextInput['initial_value'],
  placeholder?: string,
  opts: Partial<PlainTextInput> = {},
  limiterOverrides?: LimiterFuncs,
): PlainTextInput =>
  applyLimitersWithOverrides<PlainTextInput>(
    InputElement<PlainTextInput>('plain_text_input')(action_id, {
      initial_value,
      placeholder: placeholder ? PlainText(placeholder) : undefined,
      ...opts,
    }),
    {
      action_id: [255, disallow],
      placeholder: [150, ellipsis],
      // note, initial_value not documented, but max 150 based on testing
      initial_value: [150, ellipsis],
    },
    limiterOverrides,
  );

// --- Radio Button Group Element --- https://api.slack.com/reference/block-kit/block-elements#radio
export const RadioInputElement = (
  action_id: RadioButtons['action_id'],
  options: RadioButtons['options'],
  initial_option?: RadioButtons['initial_option'],
  opts: Partial<RadioButtons> = {},
  limiterOverrides?: LimiterFuncs,
): RadioButtons =>
  applyLimitersWithOverrides<RadioButtons>(
    InputElement<RadioButtons>('radio_buttons')(action_id, {
      options,
      initial_option,
      ...opts,
    }),
    {
      action_id: [255, disallow],
      // not in docs, but tested and validated that this breaks after 10
      options: [10, truncate],
    },
    limiterOverrides,
  );

// --- Select Menu Element --- https://api.slack.com/reference/block-kit/block-elements#select

const selectLimitOpts: LimitOpts = {
  placeholder: [150, ellipsis],
  action_id: [255, disallow],
  options: [100, truncate],
  option_groups: [100, truncate],
};

export const StaticSelectInputElement = (
  action_id: StaticSelect['action_id'],
  placeholder: string,
  options: StaticSelect['options'],
  initial_option?: StaticSelect['initial_option'],
  opts: Partial<StaticSelect> = {},
  limiterOverrides?: LimiterFuncs,
): StaticSelect =>
  applyLimitersWithOverrides<StaticSelect>(
    InputElement<StaticSelect>('static_select')(action_id, {
      placeholder: PlainText(placeholder),
      options,
      initial_option,
      ...opts,
    }),
    selectLimitOpts,
    limiterOverrides,
  );

// https://api.slack.com/reference/block-kit/block-elements#channel_select
export const ChannelsSelectInputElement = (
  action_id: ChannelsSelect['action_id'],
  placeholder: string,
  initial_channel?: ChannelsSelect['initial_channel'],
  opts: Partial<ChannelsSelect> = {},
  limiterOverrides?: LimiterFuncs,
): ChannelsSelect =>
  applyLimitersWithOverrides<ChannelsSelect>(
    InputElement<ChannelsSelect>('channels_select')(action_id, {
      placeholder: PlainText(placeholder),
      initial_channel,
      ...opts,
    }),
    selectLimitOpts,
    limiterOverrides,
  );

// https://api.slack.com/reference/block-kit/block-elements#conversation_select
export const ConversationsSelectInputElement = (
  action_id: ConversationsSelect['action_id'],
  placeholder: string,
  initial_conversation?: ConversationsSelect['initial_conversation'],
  opts: Partial<ConversationsSelect> = {},
  limiterOverrides?: LimiterFuncs,
): ConversationsSelect =>
  applyLimitersWithOverrides<ConversationsSelect>(
    InputElement<ConversationsSelect>('conversations_select')(action_id, {
      placeholder: PlainText(placeholder),
      initial_conversation,
      ...opts,
    }),
    selectLimitOpts,
    limiterOverrides,
  );

// https://api.slack.com/reference/block-kit/block-elements#users_select
export const UsersSelectInputElement = (
  action_id: UsersSelect['action_id'],
  placeholder: string,
  initial_user?: UsersSelect['initial_user'],
  opts: Partial<UsersSelect> = {},
  limiterOverrides?: LimiterFuncs,
): UsersSelect =>
  applyLimitersWithOverrides<UsersSelect>(
    InputElement<UsersSelect>('users_select')(action_id, {
      placeholder: PlainText(placeholder),
      initial_user,
      ...opts,
    }),
    selectLimitOpts,
    limiterOverrides,
  );
