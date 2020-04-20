import {
  Button as TButton,
  ImageElement,
  InputBlock,
  MrkdwnElement,
  Option,
  Overflow,
  PlainTextElement,
  PlainTextInput,
  StaticSelect,
} from '@slack/types';

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

// --- Option Object --- https://api.slack.com/reference/block-kit/composition-objects#option

export const OptionObject = (
  // only works with PlainText at the moment https://github.com/slackapi/node-slack-sdk/issues/973
  text: string,
  value: string,
  optionBlock?: Partial<Option>,
): Option => ({
  text: PlainText(text),
  value,
  ...optionBlock,
});

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

// --- Date Picker Element --- https://api.slack.com/reference/block-kit/block-elements#datepicker

// --- Image Element --- https://api.slack.com/reference/block-kit/block-elements#image
export const Image = (image_url: string, alt_text: string): ImageElement => ({
  type: 'image',
  image_url,
  alt_text,
});

// --- Multi-select Menu Element --- https://api.slack.com/reference/block-kit/block-elements#multi_select

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
