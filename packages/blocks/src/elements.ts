import S from '@slack/types';

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
const InputElement = <T extends S.InputBlock['element']>(type: T['type']) => (
  action_id: T['action_id'],
  opts: Partial<T>,
): T => ({ type, action_id, ...opts } as T);

/** Button Element - An interactive component that inserts a button. The button can be a trigger for anything from opening a simple link to starting a complex workflow.
 *
 * Works with block types: `Section`, `Actions`
 *
 * https://api.slack.com/reference/block-kit/block-elements#button
 */
export const Button = (
  text: string,
  action_id: string,
  buttonBlock?: Partial<S.Button>,
  limiterOverrides?: LimiterFuncs,
): S.Button =>
  applyLimitersWithOverrides<S.Button>(
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

/**
 * Checkbox Group - A checkbox group that allows a user to choose multiple items from a list of possible options.
 *
 * Works with block types: `Section`, `Actions`, `Input`. Only works in surfaces `Home tabs` and `Modals`.
 *
 * https://api.slack.com/reference/block-kit/block-elements#checkboxes
 */
export const Checkboxes = (
  action_id: S.Checkboxes['action_id'],
  options: S.Checkboxes['options'],
  initial_options?: S.Checkboxes['initial_options'],
  opts: Partial<S.Checkboxes> = {},
  limiterOverrides?: LimiterFuncs,
): S.Checkboxes =>
  applyLimitersWithOverrides<S.Checkboxes>(
    InputElement<S.Checkboxes>('checkboxes')(action_id, {
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

// Helpers for date picker
const YYYYMMDD = /\d{4}-\d{2}-\d{2}/;

/**
 * throws if `value` doesn't match 'YYYY-MM-DD', otherwise returns `value`
 */
const validateDate = <T>(limit: number, value: T): T => {
  if (typeof value !== 'string' || !YYYYMMDD.exec(value)) {
    throw Error(`Date should be string in format 'YYYY-MM-DD`);
  }

  return value;
};

/**
 * Date Picker Element - An element which lets users easily select a date from a calendar style UI.
 *
 * Works with block types: `Section`, `Actions`, `Input`.
 *
 * https://api.slack.com/reference/block-kit/block-elements#datepicker
 */
export const Datepicker = (
  action_id: string,
  placeholder?: string,
  initial_date?: string,
  datePicker?: Partial<S.Datepicker>,
  limiterOverrides?: LimiterFuncs,
): S.Datepicker =>
  applyLimitersWithOverrides<S.Datepicker>(
    {
      type: 'datepicker',
      action_id,
      placeholder: placeholder ? PlainText(placeholder) : undefined,
      initial_date,
      ...datePicker,
    },
    {
      action_id: [255, disallow],
      options: [5, truncate],
      placeholder: [150, ellipsis],
      initial_date: [0, validateDate],
    },
    limiterOverrides,
  );

/**
 * Image Element - An element to insert an image as part of a larger block of content. If you want a block with only an image in it, you're looking for `ImageBl` ([image block](https://api.slack.com/reference/block-kit/blocks#image)).
 *
 * Works with block types: `Section`, `Context`.
 *
 * https://api.slack.com/reference/block-kit/block-elements#image
 */
export const ImageElement = (
  image_url: string,
  alt_text: string,
  limiterOverrides?: LimiterFuncs,
): S.ImageElement =>
  applyLimitersWithOverrides<S.ImageElement>(
    {
      type: 'image',
      image_url,
      alt_text,
    },
    { image_url: [3000, truncate], alt_text: [2000, ellipsis] },
    limiterOverrides,
  );

/**
 * Limits consistent across all Multi-select Menu Element
 *
 * A multi-select menu allows a user to select multiple items from a list of options. Just like regular select menus, multi-select menus also include type-ahead functionality, where a user can type a part or all of an option string to filter the list.
 *
 * https://api.slack.com/reference/block-kit/block-elements#multi_select
 */
const multiSelectLimitOpts: LimitOpts = {
  action_id: [255, disallow],
  placeholder: [150, ellipsis],
  options: [100, truncate],
  option_groups: [100, truncate],
  initial_options: [100, truncate],
};

/**
 * Multi-select menu with static options - This is the simplest form of select menu, with a static list of options passed in when defining the element.
 *
 * Works with block types: `Section`, `Input`.
 *
 * https://api.slack.com/reference/block-kit/block-elements#static_multi_select
 */
export const MultiStaticSelect = (
  action_id: S.MultiStaticSelect['action_id'],
  placeholder: string,
  options: S.MultiStaticSelect['options'],
  initial_options?: S.MultiStaticSelect['initial_options'],
  opts: Partial<S.MultiStaticSelect> = {},
  limiterOverrides?: LimiterFuncs,
): S.MultiStaticSelect =>
  applyLimitersWithOverrides<S.MultiStaticSelect>(
    InputElement<S.MultiStaticSelect>('multi_static_select')(action_id, {
      placeholder: PlainText(placeholder),
      options,
      initial_options,
      ...opts,
    }),
    multiSelectLimitOpts,
    limiterOverrides,
  );

/**
 * Multi-select menu with channels list - This multi-select menu will populate its options with a list of public channels visible to the current user in the active workspace.
 *
 * Works with block types: `Section`, `Input`.
 *
 * https://api.slack.com/reference/block-kit/block-elements#channel_multi_select
 */
export const MultiChannelsSelect = (
  action_id: S.MultiChannelsSelect['action_id'],
  placeholder: string,
  initial_channels?: S.MultiChannelsSelect['initial_channels'],
  opts: Partial<S.MultiChannelsSelect> = {},
  limiterOverrides?: LimiterFuncs,
): S.MultiChannelsSelect =>
  applyLimitersWithOverrides<S.MultiChannelsSelect>(
    InputElement<S.MultiChannelsSelect>('multi_channels_select')(action_id, {
      placeholder: PlainText(placeholder),
      initial_channels,
      ...opts,
    }),
    multiSelectLimitOpts,
    limiterOverrides,
  );

/**
 * Multi-select menu with conversations list - This multi-select menu will populate its options with a list of public and private channels, DMs, and MPIMs visible to the current user in the active workspace.
 *
 * Works with block types: `Section`, `Input`.
 *
 * https://api.slack.com/reference/block-kit/block-elements#conversation_multi_select
 */
export const MultiConversationsSelect = (
  action_id: S.MultiConversationsSelect['action_id'],
  placeholder: string,
  initial_conversations?: S.MultiConversationsSelect['initial_conversations'],
  opts: Partial<S.MultiConversationsSelect> = {},
  limiterOverrides?: LimiterFuncs,
): S.MultiConversationsSelect =>
  applyLimitersWithOverrides<S.MultiConversationsSelect>(
    InputElement<S.MultiConversationsSelect>('multi_conversations_select')(
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

/**
 * Multi-select menu with user list - This multi-select menu will populate its options with a list of Slack users visible to the current user in the active workspace.
 *
 * Works with block types: `Section`, `Input`.
 *
 * https://api.slack.com/reference/block-kit/block-elements#users_multi_select
 */
export const MultiUsersSelect = (
  action_id: S.MultiUsersSelect['action_id'],
  placeholder: string,
  initial_users?: S.MultiUsersSelect['initial_users'],
  opts: Partial<S.MultiUsersSelect> = {},
  limiterOverrides?: LimiterFuncs,
): S.MultiUsersSelect =>
  applyLimitersWithOverrides<S.MultiUsersSelect>(
    InputElement<S.MultiUsersSelect>('multi_users_select')(action_id, {
      placeholder: PlainText(placeholder),
      initial_users,
      ...opts,
    }),
    multiSelectLimitOpts,
    limiterOverrides,
  );

/**
 * Overflow menu element - This is like a cross between a button and a select menu - when a user clicks on this overflow button, they will be presented with a list of options to choose from. Unlike the select menu, there is no typeahead field, and the button always appears with an ellipsis ("…") rather than customizable text.
 *
 * As such, it is usually used if you want a more compact layout than a select menu, or to supply a list of less visually important actions after a row of buttons. You can also specify simple URL links as overflow menu options, instead of actions.
 *
 * Works with block types: `Section`, `Actions`.
 *
 * https://api.slack.com/reference/block-kit/block-elements#overflow
 */
export const Overflow = (
  options: S.Option[],
  action_id: string,
  menuBlock?: Partial<S.Overflow>,
  limiterOverrides?: LimiterFuncs,
): S.Overflow =>
  applyLimitersWithOverrides<S.Overflow>(
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

/**
 * Plain-text input element - A plain-text input, similar to the HTML `<input>` tag, creates a field where a user can enter freeform data. It can appear as a single-line field or a larger textarea using the `multiline` flag.
 *
 * Works with block types: `Section`, `Actions`, `Input`. Only works in `Modals` surface.
 *
 * https://api.slack.com/reference/block-kit/block-elements#input
 */
export const PlainTextInput = (
  action_id: S.PlainTextInput['action_id'],
  initial_value?: S.PlainTextInput['initial_value'],
  placeholder?: string,
  opts: Partial<S.PlainTextInput> = {},
  limiterOverrides?: LimiterFuncs,
): S.PlainTextInput =>
  applyLimitersWithOverrides<S.PlainTextInput>(
    InputElement<S.PlainTextInput>('plain_text_input')(action_id, {
      initial_value,
      placeholder: placeholder ? PlainText(placeholder) : undefined,
      ...opts,
    }),
    {
      action_id: [255, disallow],
      placeholder: [150, ellipsis],
    },
    limiterOverrides,
  );

/**
 * Radio button group element - A radio button group that allows a user to choose one item from a list of possible options.
 *
 * Works with block types: `Section`, `Actions`, `Input`. Only works in surfaces `Home tabs` and `Modals`.
 *
 * https://api.slack.com/reference/block-kit/block-elements#radio
 */
export const RadioButtons = (
  action_id: S.RadioButtons['action_id'],
  options: S.RadioButtons['options'],
  initial_option?: S.RadioButtons['initial_option'],
  opts: Partial<S.RadioButtons> = {},
  limiterOverrides?: LimiterFuncs,
): S.RadioButtons =>
  applyLimitersWithOverrides<S.RadioButtons>(
    InputElement<S.RadioButtons>('radio_buttons')(action_id, {
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

/**
 * Limits consistent across all select menu elements
 *
 * A select menu element just as with a standard HTML `<select>` tag, creates a drop down menu with a list of options for a user to choose. The select menu also includes type-ahead functionality, where a user can type a part or all of an option string to filter the list.
 *
 * https://api.slack.com/reference/block-kit/block-elements#select
 */
const selectLimitOpts: LimitOpts = {
  placeholder: [150, ellipsis],
  action_id: [255, disallow],
  options: [100, truncate],
  option_groups: [100, truncate],
};

/**
 * Select menu with static options - This is the simplest form of select menu, with a static list of options passed in when defining the element.
 *
 * Works with block types: `Section`, `Actions`, `Input`.
 *
 * https://api.slack.com/reference/block-kit/block-elements#static_select
 */
export const StaticSelect = (
  action_id: S.StaticSelect['action_id'],
  placeholder: string,
  options: S.StaticSelect['options'],
  initial_option?: S.StaticSelect['initial_option'],
  opts: Partial<S.StaticSelect> = {},
  limiterOverrides?: LimiterFuncs,
): S.StaticSelect =>
  applyLimitersWithOverrides<S.StaticSelect>(
    InputElement<S.StaticSelect>('static_select')(action_id, {
      placeholder: PlainText(placeholder),
      options,
      initial_option,
      ...opts,
    }),
    selectLimitOpts,
    limiterOverrides,
  );

/**
 * Select menu with channels list - This select menu will populate its options with a list of public channels visible to the current user in the active workspace.
 *
 * Works with block types: `Section`, `Actions`, `Input`.
 *
 * https://api.slack.com/reference/block-kit/block-elements#channel_select
 */
export const ChannelsSelect = (
  action_id: S.ChannelsSelect['action_id'],
  placeholder: string,
  initial_channel?: S.ChannelsSelect['initial_channel'],
  opts: Partial<S.ChannelsSelect> = {},
  limiterOverrides?: LimiterFuncs,
): S.ChannelsSelect =>
  applyLimitersWithOverrides<S.ChannelsSelect>(
    InputElement<S.ChannelsSelect>('channels_select')(action_id, {
      placeholder: PlainText(placeholder),
      initial_channel,
      ...opts,
    }),
    selectLimitOpts,
    limiterOverrides,
  );

/**
 * Select menu with conversations list - This select menu will populate its options with a list of public and private channels, DMs, and MPIMs visible to the current user in the active workspace.
 *
 * Works with block types: `Section`, `Actions`, `Input`.
 *
 * https://api.slack.com/reference/block-kit/block-elements#conversation_select
 */
export const ConversationsSelect = (
  action_id: S.ConversationsSelect['action_id'],
  placeholder: string,
  initial_conversation?: S.ConversationsSelect['initial_conversation'],
  opts: Partial<S.ConversationsSelect> = {},
  limiterOverrides?: LimiterFuncs,
): S.ConversationsSelect =>
  applyLimitersWithOverrides<S.ConversationsSelect>(
    InputElement<S.ConversationsSelect>('conversations_select')(action_id, {
      placeholder: PlainText(placeholder),
      initial_conversation,
      ...opts,
    }),
    selectLimitOpts,
    limiterOverrides,
  );

/**
 * Select menu with user list - This select menu will populate its options with a list of Slack users visible to the current user in the active workspace.
 *
 * Works with block types: `Section`, `Actions`, `Input`.
 *
 * https://api.slack.com/reference/block-kit/block-elements#users_select
 */
export const UsersSelect = (
  action_id: S.UsersSelect['action_id'],
  placeholder: string,
  initial_user?: S.UsersSelect['initial_user'],
  opts: Partial<S.UsersSelect> = {},
  limiterOverrides?: LimiterFuncs,
): S.UsersSelect =>
  applyLimitersWithOverrides<S.UsersSelect>(
    InputElement<S.UsersSelect>('users_select')(action_id, {
      placeholder: PlainText(placeholder),
      initial_user,
      ...opts,
    }),
    selectLimitOpts,
    limiterOverrides,
  );
