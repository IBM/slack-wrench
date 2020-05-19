import {
  ActionsBlock,
  Confirm,
  MrkdwnElement,
  Option,
  OptionGroup,
  PlainTextElement,
} from '@slack/types';
import R, {
  concat,
  curry,
  flip,
  has,
  ifElse,
  lensProp,
  lt,
  over,
  pipe,
  prop,
  take,
} from 'ramda';
import { F } from 'ts-toolbelt';

type TextElement = PlainTextElement | MrkdwnElement;

const dot3 = '...';

// truncate function

// identity function (doesn't truncate - may cause error when slack api called)

/**
 * given a truncate total limit and a string,
 * examples:
 * ellipsisText('Hello World!', 8) => 'Hello...'
 */
const ellipsisText = curry((limit: number) =>
  pipe<string, string, string>(take(limit - dot3.length), flip(concat)(dot3)),
);

/**
 * takes string or { text: '...', ...}, and truncates either the string itself or the text property on the object
 * resulting string will be a maximum of `limit` characters.
 * the last 3 characters of the string will be `...` if the string is longer than `limit`
 */
export const ellipsis = curry((limit: number) =>
  ifElse(
    has('text'),
    over(lensProp('text'), ellipsisText(limit)),
    ellipsisText(limit),
  ),
);

// TODO: typescript-level check

// error function - throws error immediately on function call if string is too long for block type
export const disallow = curry(
  (limit: number, item: string | Record<'text', string>) => {
    throw Error(
      `Invalid length for property, max ${limit}: ${item.text || item}`,
    );
  },
);

// const slackTruncate = (truncate = slackTruncate, text: string): string =>
//   truncate(text);

export const isTooLong = curry((limit: number): ((text: string) => boolean) =>
  pipe(prop('length'), lt(limit)),
);

// identity function which just swallows the number, and won't truncate
export const identity: TruncateInfo.truncateFunction = curry(
  (limit: number) => R.identity,
);
export const truncate: TruncateInfo.truncateFunction = take;

type ArrayTruncateFunction = <T>(items: T[]) => T;
type StringTruncateFunction = (text: string) => string;

// TODO: need to handle 3 types - string, object (e.g. plain_text), array
interface TruncateInfo {
  max_length: number;
  truncateFunction?: <T>(value: T) => T;
  // for arrays of objects; different elements have specific requirements; the below runs the provided function on each object in the array and truncates
  truncateEach?: TruncateOptions; // need to: loop through each on this field and run this functions on what's provided
}

const truncator = <T>(
  max_length: number,
  truncateFunction: F.Curry<(limit: number) => (value: T) => T>,
  truncateEach?: F.Curry<(limit: number) => (value: T) => T>,
): TruncateInfo => ({
  max_length,
  truncateFunction: truncateFunction(max_length),
  truncateEach,
});

export type TruncateOptions = Record<string, TruncateInfo>;

// composition objects - text, confirm, option, option group, filter
const confirmTruncateOptions: TruncateOptions = {
  title: truncator<PlainTextElement>(100, ellipsis),
  text: truncator<TextElement>(300, ellipsis),
  confirm: truncator<PlainTextElement>(30, ellipsis),
  deny: truncator<PlainTextElement>(30, ellipsis),
};

const optionTruncateOptions: TruncateOptions = {
  text: truncator<TextElement>(75, ellipsis), // plaintext in overflow, select, multi-select; radio and checkbox cn use mrkdwn
  value: truncator<string>(75, disallow), // assuming user needs this to be specific, fail if invalid
  description: truncator<PlainTextElement>(75, ellipsis),
  url: truncator<string>(3000, truncate),
};

const optionGroupTruncateOptions: TruncateOptions = {
  label: truncator<PlainTextElement>(75, ellipsis),
  options: truncator<Option[]>(100, truncate),
};

// end composition objects

// ToDo: error function if action_id or block_id is too long
// mapping of block type to any length limits
const defaultTruncateOptions = new Map<string, TruncateOptions>([
  // layout blocks
  [
    'section',
    {
      text: truncator<TextElement>(3000, ellipsis),
      block_id: truncator<string>(255, disallow),
      fields: truncator<TextElement[]>(
        10,
        truncate,
        truncator<TextElement>(2000, ellipsis),
      ),
    },
  ],
  ['divider', { block_id: truncator<string>(255, disallow) }],
  [
    'image',
    {
      // TODO: think about this some more - truncating url probably means it will break the image, but at least the block will still render?
      image_url: truncator<string>(3000, truncate),
      alt_text: truncator<string>(2000, ellipsis),
      title: truncator<PlainTextElement>(2000, ellipsis),
      block_id: truncator<string>(255, disallow),
    },
  ],
  [
    'actions',
    {
      elements: truncator<ActionsBlock.elements>(5, truncate),
      block_id: truncator<string>(255, disallow),
    },
  ],
  [
    'context',
    {
      elements: truncator<Record<string, string>>(10, truncate),
      block_id: truncator<string>(255, disallow),
    },
  ],
  [
    'input',
    {
      label: truncator<Record<string, string>>(2000, ellipsis),
      elements: truncator<Record<string, string>[]>(10, truncate),
      block_id: truncator<string>(255, disallow),
      hint: truncator<Record<string, string>>(2000, truncate),
    },
  ],
  [
    'file',
    {
      block_id: truncator<string>(255, disallow),
    },
  ],
  // block elements
  [
    'button',
    {
      text: truncator<PlainTextElement>(75, ellipsis),
      action_id: truncator<string>(255, disallow),
      // TODO: truncated_url - make sense?
      url: truncator<string>(3000, truncate),
      value: truncator<string>(2000, ellipsis),
      // not in docs, but tested and validated that this breaks after 10
      options: truncator<Option[]>(10, truncate),
      // what to do with the confirm?
      // confirm: confirmValidator(),
    },
  ],
  [
    'checkboxes',
    {
      action_id: truncator<string>(255, disallow),
      // not in docs, but tested and validated that this breaks after 10
      options: truncator<Option[]>(10, truncate),
      initial_options: truncator<Option[]>(10, truncate),
      // what to do with the confirm?
      // confirm: confirmValidator(),
    },
  ],
  [
    'datepicker',
    {
      action_id: truncator<string>(255, disallow),
      placeholder: truncator<string>(150, ellipsis),
      // not in docs, but tested and validated that this breaks after 10
      options: truncator<Option[]>(10, truncate),
      initial_options: truncator<Option[]>(10, truncate),
      // what to do with the confirm?
      // confirm: confirmValidator(),
    },
  ],

  [
    'image',
    {
      action_id: truncator<string>(255, disallow),
      // url and alt not in docs, assuming same as image block without testing yet
      image_url: truncator<string>(3000, truncate),
      alt_text: truncator<string>(2000, ellipsis),
      // what to do with the confirm?
      // confirm: confirmValidator(),
    },
  ],
  [
    'multi_static_select', // also multi_external_select, multi_users_select, multi_conversations_select, multi_channels_select
    {
      action_id: truncator<string>(255, disallow),
      placeholder: truncator<PlainTextElement>(150, ellipsis),
      options: truncator<Option[]>(100, truncate),
      option_groups: truncator<OptionGroup[]>(100, truncate),
      initial_options: truncator<Option[]>(100, truncate),

      // what to do with the confirm?
      // confirm: confirmValidator(),
    },
  ],
  [
    'overflow',
    {
      action_id: truncator<string>(255, disallow),
      // not in docs, but tested and validated that this breaks after 10
      options: truncator<Option[]>(5, truncate),
      // what to do with the confirm?
      // confirm: confirmValidator(),
    },
  ],
  [
    'plain_text_input',
    {
      action_id: truncator<string>(255, disallow),
      placeholder: truncator<PlainTextElement>(150, ellipsis),
      // note, initial_value not documented, but max 150 based on testing
      initial_value: truncator<string>(150, ellipsis),
      // what to do with the confirm?
      // confirm: confirmValidator(),
    },
  ],
  [
    'radio_buttons',
    {
      action_id: truncator<string>(255, disallow),
      // not in docs, but tested and validated that this breaks after 10
      options: truncator<Option[]>(10, truncate),
      // what to do with the confirm?
      // confirm: confirmValidator(),
    },
  ],
  [
    'static_select', // also external_select, users_select, conversations_select, channels_select
    {
      placeholder: truncator<PlainTextElement>(150, ellipsis),
      action_id: truncator<string>(255, disallow),
      options: truncator<Option[]>(100, truncate),
      option_groups: truncator<OptionGroup[]>(100, truncate),
      // what to do with the confirm?
      // confirm: confirmValidator(),
    },
  ],
]);

// const isTooLongForBlock = pipe<KnownBlock, number, boolean>(
//   prop('length'),
//   isTooLong,
// );

// const truncateIfTooLong = (
//   limit: number,
//   truncate = ellipsis,
//   text: string,
// ): string =>
//   when<string, string>(isTooLongForSlack, slackTruncate(truncate))(text);

// TODO: for the user, enable passing either
// 1. object mapping of fields to truncate functions - just do this for now?
// 2. a single truncate function that gets applied to all limited fields (only those that aren't arrays?)
// 3. provide string name of one of the default functions that does ^

// TODO: define modal/ blocks length and
