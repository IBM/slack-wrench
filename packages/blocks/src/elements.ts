import {
  Button as TButton,
  ChannelsSelect,
  Checkboxes,
  ConversationsSelect,
  Datepicker,
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
  MultiStaticSelect,
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

/** Button Element - An interactive component that inserts a button. The button can be a trigger for anything from opening a simple link to starting a complex workflow.
 *
 * Works with block types: `Section`, `Actions`
 *
 * https://api.slack.com/reference/block-kit/block-elements#button
 */
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

/**
 * Checkbox Group - A checkbox group that allows a user to choose multiple items from a list of possible options.
 *
 * Works with block types: `Section`, `Actions`, `Input`. Only works in surfaces `Home tabs` and `Modals`.
 *
 * https://api.slack.com/reference/block-kit/block-elements#checkboxes
 */
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
export const DatePicker = (
  action_id: string,
  placeholder?: string,
  initial_date?: string,
  datePicker?: Partial<Datepicker>,
  limiterOverrides?: LimiterFuncs,
): Datepicker =>
  applyLimitersWithOverrides<Datepicker>(
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
export const MultiStaticSelectInputElement = (
  action_id: MultiStaticSelect['action_id'],
  placeholder: string,
  options: MultiStaticSelect['options'],
  initial_options?: MultiStaticSelect['initial_options'],
  opts: Partial<MultiStaticSelect> = {},
  limiterOverrides?: LimiterFuncs,
): MultiStaticSelect =>
  applyLimitersWithOverrides<MultiStaticSelect>(
    InputElement<MultiStaticSelect>('multi_static_select')(action_id, {
      placeholder: PlainText(placeholder),
      options,
      initial_options,
      ...opts,
    }),
    selectLimitOpts,
    limiterOverrides,
  );

/**
 * Multi-select menu with channels list - This multi-select menu will populate its options with a list of public channels visible to the current user in the active workspace.
 *
 * Works with block types: `Section`, `Input`.
 *
 * https://api.slack.com/reference/block-kit/block-elements#channel_multi_select
 */
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

/**
 * Multi-select menu with conversations list - This multi-select menu will populate its options with a list of public and private channels, DMs, and MPIMs visible to the current user in the active workspace.
 *
 * Works with block types: `Section`, `Input`.
 *
 * https://api.slack.com/reference/block-kit/block-elements#conversation_multi_select
 */
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

/**
 * Multi-select menu with user list - This multi-select menu will populate its options with a list of Slack users visible to the current user in the active workspace.
 *
 * Works with block types: `Section`, `Input`.
 *
 * https://api.slack.com/reference/block-kit/block-elements#users_multi_select
 */
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

/**
 * Overflow menu element - This is like a cross between a button and a select menu - when a user clicks on this overflow button, they will be presented with a list of options to choose from. Unlike the select menu, there is no typeahead field, and the button always appears with an ellipsis ("…") rather than customizable text.
 *
 * As such, it is usually used if you want a more compact layout than a select menu, or to supply a list of less visually important actions after a row of buttons. You can also specify simple URL links as overflow menu options, instead of actions.
 *
 * Works with block types: `Section`, `Actions`.
 *
 * https://api.slack.com/reference/block-kit/block-elements#overflow
 */
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

/**
 * Plain-text input element - A plain-text input, similar to the HTML `<input>` tag, creates a field where a user can enter freeform data. It can appear as a single-line field or a larger textarea using the `multiline` flag.
 *
 * Works with block types: `Section`, `Actions`, `Input`. Only works in `Modals` surface.
 *
 * https://api.slack.com/reference/block-kit/block-elements#input
 */
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

/**
 * Radio button group element - A radio button group that allows a user to choose one item from a list of possible options.
 *
 * Works with block types: `Section`, `Actions`, `Input`. Only works in surfaces `Home tabs` and `Modals`.
 *
 * https://api.slack.com/reference/block-kit/block-elements#radio
 */
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

/**
 * Select menu with channels list - This select menu will populate its options with a list of public channels visible to the current user in the active workspace.
 *
 * Works with block types: `Section`, `Actions`, `Input`.
 *
 * https://api.slack.com/reference/block-kit/block-elements#channel_select
 */
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

/**
 * Select menu with conversations list - This select menu will populate its options with a list of public and private channels, DMs, and MPIMs visible to the current user in the active workspace.
 *
 * Works with block types: `Section`, `Actions`, `Input`.
 *
 * https://api.slack.com/reference/block-kit/block-elements#conversation_select
 */
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

/**
 * Select menu with user list - This select menu will populate its options with a list of Slack users visible to the current user in the active workspace.
 *
 * Works with block types: `Section`, `Actions`, `Input`.
 *
 * https://api.slack.com/reference/block-kit/block-elements#users_select
 */
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
