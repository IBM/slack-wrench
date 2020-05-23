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
  applyTruncationsWithOverrides,
  disallow,
  ellipsis,
  truncate,
  TruncateFunction,
  TruncateOptions,
} from './lengthHelpers';

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
  overrideTruncators: Record<string, TruncateFunction> = {},
): TButton =>
  applyTruncationsWithOverrides<TButton>(
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
    overrideTruncators,
  );

// --- Checkbox Group --- https://api.slack.com/reference/block-kit/block-elements#checkboxes
export const CheckboxInputElement = (
  action_id: Checkboxes['action_id'],
  options: Checkboxes['options'],
  initial_options?: Checkboxes['initial_options'],
  opts: Partial<Checkboxes> = {},
  overrideTruncators: Record<string, TruncateFunction> = {},
): Checkboxes =>
  applyTruncationsWithOverrides<Checkboxes>(
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
    overrideTruncators,
  );

// --- Date Picker Element --- https://api.slack.com/reference/block-kit/block-elements#datepicker

// --- Image Element --- https://api.slack.com/reference/block-kit/block-elements#image (this is both a block element and a block)
export const Image = (
  image_url: string,
  alt_text: string,
  overrideTruncators: Record<string, TruncateFunction> = {},
): ImageElement =>
  applyTruncationsWithOverrides<ImageElement>(
    {
      type: 'image',
      image_url,
      alt_text,
    },
    { image_url: [3000, truncate], alt_text: [2000, ellipsis] },
    overrideTruncators,
  );

// --- Multi-select Menu Element --- https://api.slack.com/reference/block-kit/block-elements#multi_select

const multiSelectTruncateOptions: TruncateOptions = {
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
  overrideTruncators: Record<string, TruncateFunction> = {},
): MultiChannelsSelect =>
  applyTruncationsWithOverrides<MultiChannelsSelect>(
    InputElement<MultiChannelsSelect>('multi_channels_select')(action_id, {
      placeholder: PlainText(placeholder),
      initial_channels,
      ...opts,
    }),
    multiSelectTruncateOptions,
    overrideTruncators,
  );

// https://api.slack.com/reference/block-kit/block-elements#conversation_multi_select
export const MultiConversationsSelectInputElement = (
  action_id: MultiConversationsSelect['action_id'],
  placeholder: string,
  initial_conversations?: MultiConversationsSelect['initial_conversations'],
  opts: Partial<MultiConversationsSelect> = {},
  overrideTruncators: Record<string, TruncateFunction> = {},
): MultiConversationsSelect =>
  applyTruncationsWithOverrides<MultiConversationsSelect>(
    InputElement<MultiConversationsSelect>('multi_conversations_select')(
      action_id,
      {
        placeholder: PlainText(placeholder),
        initial_conversations,
        ...opts,
      },
    ),
    multiSelectTruncateOptions,
    overrideTruncators,
  );

// https://api.slack.com/reference/block-kit/block-elements#users_multi_select
export const MultiUsersSelectInputElement = (
  action_id: MultiUsersSelect['action_id'],
  placeholder: string,
  initial_users?: MultiUsersSelect['initial_users'],
  opts: Partial<MultiUsersSelect> = {},
  overrideTruncators: Record<string, TruncateFunction> = {},
): MultiUsersSelect =>
  applyTruncationsWithOverrides<MultiUsersSelect>(
    InputElement<MultiUsersSelect>('multi_users_select')(action_id, {
      placeholder: PlainText(placeholder),
      initial_users,
      ...opts,
    }),
    multiSelectTruncateOptions,
    overrideTruncators,
  );

// --- Overflow Menu Element --- https://api.slack.com/reference/block-kit/block-elements#overflow
export const OverflowMenu = (
  options: Option[],
  action_id: string,
  menuBlock?: Partial<Overflow>,
  overrideTruncators: Record<string, TruncateFunction> = {},
): Overflow =>
  applyTruncationsWithOverrides<Overflow>(
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
    overrideTruncators,
  );

// --- Plain-text Input Element --- https://api.slack.com/reference/block-kit/block-elements#input
export const PlainTextInputElement = (
  action_id: PlainTextInput['action_id'],
  initial_value?: PlainTextInput['initial_value'],
  placeholder?: string,
  opts: Partial<PlainTextInput> = {},
  overrideTruncators: Record<string, TruncateFunction> = {},
): PlainTextInput =>
  applyTruncationsWithOverrides<PlainTextInput>(
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
    overrideTruncators,
  );

// --- Radio Button Group Element --- https://api.slack.com/reference/block-kit/block-elements#radio
export const RadioInputElement = (
  action_id: RadioButtons['action_id'],
  options: RadioButtons['options'],
  initial_option?: RadioButtons['initial_option'],
  opts: Partial<RadioButtons> = {},
  overrideTruncators: Record<string, TruncateFunction> = {},
): RadioButtons =>
  applyTruncationsWithOverrides<RadioButtons>(
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
    overrideTruncators,
  );

// --- Select Menu Element --- https://api.slack.com/reference/block-kit/block-elements#select

const selectTruncateOptions: TruncateOptions = {
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
  overrideTruncators: Record<string, TruncateFunction> = {},
): StaticSelect =>
  applyTruncationsWithOverrides<StaticSelect>(
    InputElement<StaticSelect>('static_select')(action_id, {
      placeholder: PlainText(placeholder),
      options,
      initial_option,
      ...opts,
    }),
    selectTruncateOptions,
    overrideTruncators,
  );

// https://api.slack.com/reference/block-kit/block-elements#channel_select
export const ChannelsSelectInputElement = (
  action_id: ChannelsSelect['action_id'],
  placeholder: string,
  initial_channel?: ChannelsSelect['initial_channel'],
  opts: Partial<ChannelsSelect> = {},
  overrideTruncators: Record<string, TruncateFunction> = {},
): ChannelsSelect =>
  applyTruncationsWithOverrides<ChannelsSelect>(
    InputElement<ChannelsSelect>('channels_select')(action_id, {
      placeholder: PlainText(placeholder),
      initial_channel,
      ...opts,
    }),
    selectTruncateOptions,
    overrideTruncators,
  );

// https://api.slack.com/reference/block-kit/block-elements#conversation_select
export const ConversationsSelectInputElement = (
  action_id: ConversationsSelect['action_id'],
  placeholder: string,
  initial_conversation?: ConversationsSelect['initial_conversation'],
  opts: Partial<ConversationsSelect> = {},
  overrideTruncators: Record<string, TruncateFunction> = {},
): ConversationsSelect =>
  applyTruncationsWithOverrides<ConversationsSelect>(
    InputElement<ConversationsSelect>('conversations_select')(action_id, {
      placeholder: PlainText(placeholder),
      initial_conversation,
      ...opts,
    }),
    selectTruncateOptions,
    overrideTruncators,
  );

// https://api.slack.com/reference/block-kit/block-elements#users_select
export const UsersSelectInputElement = (
  action_id: UsersSelect['action_id'],
  placeholder: string,
  initial_user?: UsersSelect['initial_user'],
  opts: Partial<UsersSelect> = {},
  overrideTruncators: Record<string, TruncateFunction> = {},
): UsersSelect =>
  applyTruncationsWithOverrides<UsersSelect>(
    InputElement<UsersSelect>('users_select')(action_id, {
      placeholder: PlainText(placeholder),
      initial_user,
      ...opts,
    }),
    selectTruncateOptions,
    overrideTruncators,
  );
