import S from '@slack/types';

import { Markdown, PlainText } from './elements';
import {
  applyLimitersWithOverrides,
  disallow,
  ellipsis,
  Limiter,
  LimiterFuncs,
  truncate,
} from './limitHelpers';

// This file provides abstractions for layout blocks, sub-block objects, and related common patterns
// https://api.slack.com/reference/block-kit/blocks
// Unless otherwise noted, these blocks support Modals, Messages, and Home tabs as surfaces

/**
 * Actions block - A block that is used to hold interactive [elements](https://api.slack.com/reference/messaging/block-elements).
 *
 * https://api.slack.com/reference/block-kit/blocks#actions
 */
export const ActionsBlock = (
  elements: S.ActionsBlock['elements'],
  limiterOverrides?: LimiterFuncs,
): S.ActionsBlock =>
  applyLimitersWithOverrides<S.ActionsBlock>(
    {
      type: 'actions',
      elements,
    },
    {
      elements: [5, truncate],
      block_id: [255, disallow],
    },
    limiterOverrides,
  );

export const Actions = ActionsBlock;

/**
 * Context block - Displays message context, which can include both images and text.
 *
 * https://api.slack.com/reference/block-kit/blocks#context
 */
export const ContextBlock = (
  elements: S.ContextBlock['elements'],
  limiterOverrides?: LimiterFuncs,
): S.ContextBlock =>
  applyLimitersWithOverrides<S.ContextBlock>(
    {
      type: 'context',
      elements,
    },
    {
      elements: [10, truncate],
      block_id: [255, disallow],
    },
    limiterOverrides,
  );

export const Context = ContextBlock;

/**
 * Divider block - A content divider, like an `<hr>`, to split up different blocks inside of a message.
 *
 * https://api.slack.com/reference/block-kit/blocks#divider
 */
export const DividerBlock = (
  block_id?: string,
  limiterOverrides?: LimiterFuncs,
): S.DividerBlock =>
  applyLimitersWithOverrides<S.DividerBlock>(
    {
      type: 'divider',
      block_id,
    },
    { block_id: [255, disallow] },
    limiterOverrides,
  );

export const Divider = DividerBlock;

/**
 * Displays a [remote file](https://api.slack.com/messaging/files/remote).
 *
 * Note: only supported in Messages surface (not in modals or home tabs)
 *
 * https://api.slack.com/reference/block-kit/blocks#file
 */
export const FileBlock = (
  external_id: string,
  block_id?: string,
  limiterOverrides?: LimiterFuncs,
): S.FileBlock =>
  applyLimitersWithOverrides<S.FileBlock>(
    {
      type: 'file',
      source: 'remote',
      external_id,
      block_id,
    },
    { block_id: [255, disallow] },
    limiterOverrides,
  );

export const File = FileBlock;

/**
 * Image: A simple image block, designed to make those cat photos really pop.
 *
 * https://api.slack.com/reference/block-kit/blocks#image
 */
export const ImageBlock = (
  image_url: string,
  alt_text: string,
  title = '',
  block_id?: string,
  limiterOverrides?: LimiterFuncs,
): S.ImageBlock =>
  applyLimitersWithOverrides<S.ImageBlock>(
    {
      type: 'image',
      image_url,
      alt_text,
      title: title.length > 0 ? PlainText(title) : undefined,
      block_id,
    },
    {
      image_url: [3000, truncate],
      alt_text: [2000, ellipsis],
      title: [2000, ellipsis],
      block_id: [255, disallow],
    },
    limiterOverrides,
  );

export const Image = ImageBlock;

/**
 * Input block - A block that collects information from users - it can hold a plain-text input element, a select menu element, a multi-select menu element, or a datepicker.
 *
 * Note: only supported in Modals surface (not in messages or home tabs)
 *
 * https://api.slack.com/reference/block-kit/blocks#input
 */
export const InputBlock = (
  label: string,
  element: S.InputBlock['element'],
  block_id?: S.InputBlock['block_id'],
  hint?: S.InputBlock['hint'],
  optional?: S.InputBlock['optional'],
  limiterOverrides?: LimiterFuncs,
): S.InputBlock =>
  applyLimitersWithOverrides<S.InputBlock>(
    {
      type: 'input',
      label: PlainText(label),
      element,
      block_id,
      hint,
      optional,
    },
    {
      label: [2000, ellipsis],
      block_id: [255, disallow],
      hint: [2000, truncate],
    },
    limiterOverrides,
  );

export const Input = InputBlock;

/**
 * Section Block - A section is one of the most flexible blocks available - it can be used as a simple text block, in combination with text fields, or side-by-side with any of the available block elements.
 *
 * https://api.slack.com/reference/block-kit/blocks#section
 */
export const SectionBlock = (
  sectionBlock: Partial<S.SectionBlock>,
  limiterOverrides?: LimiterFuncs,
): S.SectionBlock =>
  applyLimitersWithOverrides<S.SectionBlock>(
    {
      ...sectionBlock,
      type: 'section',
    },
    {
      text: [3000, ellipsis],
      block_id: [255, disallow],
      fields: [
        10,
        truncate,
        {
          text: [2000, ellipsis],
        },
      ],
    },
    limiterOverrides,
  );

export const Section = SectionBlock;

export const MdSection = (
  text: string,
  sectionBlock?: Partial<S.SectionBlock>,
  limiterOverrides?: LimiterFuncs,
): S.SectionBlock =>
  SectionBlock(
    {
      ...sectionBlock,
      text: Markdown(text),
    },
    limiterOverrides,
  );

/**
 * Takes array of markdown strings "fields" to create a section block
 * https://api.slack.com/reference/block-kit/blocks#fields
 */
export const FieldsSection = (
  fields: string[],
  sectionBlock?: Partial<S.SectionBlock>,
  limiterOverrides?: LimiterFuncs,
): S.SectionBlock =>
  SectionBlock(
    {
      ...sectionBlock,
      fields: fields.map(Markdown),
    },
    limiterOverrides,
  );

/**
 * Top-level blocks helper. filters out any null blocks, and if provided a `type` limits based on `limitFn`
 *
 * Current limits: You can include up to 50 blocks in each message, and 100 blocks in modals or home tabs.
 */
export const Blocks = (
  blocks: (S.KnownBlock | null)[],
  type?: 'message' | 'modal' | 'home',
  limitFn: Limiter = truncate,
): S.KnownBlock[] => {
  const filteredBlocks = blocks.filter(block => block) as S.KnownBlock[];

  if (type) {
    return limitFn(type === 'message' ? 50 : 100, filteredBlocks);
  }

  return filteredBlocks;
};

/**
 * Top-level blocks helper for building a message. defaults to truncating at 50 blocks after filtering out null
 */
export const MessageBlocks = (
  blocks: (S.KnownBlock | null)[],
  limitFn?: Limiter,
): S.KnownBlock[] => Blocks(blocks, 'message', limitFn);

/**
 * Top-level blocks helper for building a home tab. defaults to truncating at 100 blocks after filtering out null
 */
export const HomeBlocks = (
  blocks: (S.KnownBlock | null)[],
  limitFn?: Limiter,
): S.KnownBlock[] => Blocks(blocks, 'home', limitFn);

/**
 * Top-level blocks helper for building a modal view. defaults to truncating at 100 blocks after filtering out null
 */
export const ModalBlocks = (
  blocks: (S.KnownBlock | null)[],
  limitFn?: Limiter,
): S.KnownBlock[] => Blocks(blocks, 'modal', limitFn);
