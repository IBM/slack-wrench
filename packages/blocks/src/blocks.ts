import {
  ActionsBlock,
  ContextBlock,
  DividerBlock,
  InputBlock,
  KnownBlock,
  SectionBlock,
} from '@slack/types';

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

// --- Actions --- https://api.slack.com/reference/block-kit/blocks#actions
export const Actions = (
  elements: ActionsBlock['elements'],
  limiterOverrides?: LimiterFuncs,
): ActionsBlock =>
  applyLimitersWithOverrides<ActionsBlock>(
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

// --- Context --- https://api.slack.com/reference/block-kit/blocks#context
export const Context = (
  elements: ContextBlock['elements'],
  limiterOverrides?: LimiterFuncs,
): ContextBlock =>
  applyLimitersWithOverrides<ContextBlock>(
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

// --- Divider --- https://api.slack.com/reference/block-kit/blocks#divider
export const Divider = (
  block_id?: string,
  limiterOverrides?: LimiterFuncs,
): DividerBlock =>
  applyLimitersWithOverrides<DividerBlock>(
    {
      type: 'divider',
      block_id,
    },
    { block_id: [255, disallow] },
    limiterOverrides,
  );

// --- File --- https://api.slack.com/reference/block-kit/blocks#file

// {
//   block_id: [255, disallow],
// }

// --- Image --- https://api.slack.com/reference/block-kit/blocks#image

// {
//   image_url: [3000, truncate],
//   alt_text: [2000, ellipsis],
//   title: [2000, ellipsis],
//   block_id: [255, disallow],
// }

// --- Input --- https://api.slack.com/reference/block-kit/blocks#input
export const Input = (
  label: string,
  element: InputBlock['element'],
  block_id?: InputBlock['block_id'],
  hint?: InputBlock['hint'],
  optional?: InputBlock['optional'],
  limiterOverrides?: LimiterFuncs,
): InputBlock =>
  applyLimitersWithOverrides<InputBlock>(
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

// --- Section --- https://api.slack.com/reference/block-kit/blocks#section
export const Section = (
  sectionBlock: Partial<SectionBlock>,
  limiterOverrides?: LimiterFuncs,
): SectionBlock =>
  applyLimitersWithOverrides<SectionBlock>(
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

export const MdSection = (
  text: string,
  sectionBlock?: Partial<SectionBlock>,
  limiterOverrides?: LimiterFuncs,
): SectionBlock =>
  Section(
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
  sectionBlock?: Partial<SectionBlock>,
  limiterOverrides?: LimiterFuncs,
): SectionBlock =>
  Section(
    {
      ...sectionBlock,
      fields: fields.map(Markdown),
    },
    limiterOverrides,
  );

/**
 * Top-level blocks helper. filters out any null blocks, and if provided a `type` limits based on `limitFn`
 */
export const Blocks = (
  blocks: (KnownBlock | null)[],
  type?: 'message' | 'modal' | 'home',
  limitFn: Limiter = truncate,
): KnownBlock[] => {
  const filteredBlocks = blocks.filter(block => block) as KnownBlock[];

  if (type) {
    return limitFn(type === 'message' ? 50 : 100, filteredBlocks);
  }

  return filteredBlocks;
};

/**
 * Top-level blocks helper for building a message. defaults to truncating at 50 blocks after filtering out null
 */
export const MessageBlocks = (
  blocks: (KnownBlock | null)[],
  limitFn?: Limiter,
): KnownBlock[] => Blocks(blocks, 'message', limitFn);

/**
 * Top-level blocks helper for building a home tab. defaults to truncating at 100 blocks after filtering out null
 */
export const HomeBlocks = (
  blocks: (KnownBlock | null)[],
  limitFn?: Limiter,
): KnownBlock[] => Blocks(blocks, 'home', limitFn);

/**
 * Top-level blocks helper for building a modal view. defaults to truncating at 100 blocks after filtering out null
 */
export const ModalBlocks = (
  blocks: (KnownBlock | null)[],
  limitFn?: Limiter,
): KnownBlock[] => Blocks(blocks, 'modal', limitFn);
