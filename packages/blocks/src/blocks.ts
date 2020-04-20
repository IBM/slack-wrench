import {
  ActionsBlock,
  ContextBlock,
  DividerBlock,
  InputBlock,
  KnownBlock,
  SectionBlock,
} from '@slack/types';

import { Markdown, PlainText } from './elements';

// This file provides abstractions for layout blocks, sub-block objects, and related common patterns
// https://api.slack.com/reference/block-kit/blocks

// --- Actions --- https://api.slack.com/reference/block-kit/blocks#actions
export const Actions = (elements: ActionsBlock['elements']): ActionsBlock => ({
  type: 'actions',
  elements,
});

// --- Context --- https://api.slack.com/reference/block-kit/blocks#context
export const Context = (elements: ContextBlock['elements']): ContextBlock => ({
  type: 'context',
  elements,
});

// --- Divider --- https://api.slack.com/reference/block-kit/blocks#divider
export const Divider = (): DividerBlock => ({
  type: 'divider',
});

// --- File --- https://api.slack.com/reference/block-kit/blocks#file

// --- Image --- https://api.slack.com/reference/block-kit/blocks#image

// --- Input --- https://api.slack.com/reference/block-kit/blocks#input
export const Input = (
  label: string,
  element: InputBlock['element'],
  block_id?: InputBlock['block_id'],
  hint?: InputBlock['hint'],
  optional?: InputBlock['optional'],
): InputBlock => ({
  type: 'input',
  label: PlainText(label),
  element,
  block_id,
  hint,
  optional,
});

// --- Section --- https://api.slack.com/reference/block-kit/blocks#section
export const Section = (sectionBlock: Partial<SectionBlock>): SectionBlock => ({
  ...sectionBlock,
  type: 'section',
});

export const MdSection = (
  text: string,
  sectionBlock?: Partial<SectionBlock>,
): SectionBlock =>
  Section({
    ...sectionBlock,
    text: Markdown(text),
  });

/**
 * Takes array of markdown strings "fields" to create a section block
 * https://api.slack.com/reference/block-kit/blocks#fields
 */
export const FieldsSection = (
  fields: string[],
  sectionBlock?: Partial<SectionBlock>,
): SectionBlock =>
  Section({
    ...sectionBlock,
    fields: fields.map(Markdown),
  });

// Top-level blocks helper to filter out any null blocks
export const Blocks = (blocks: (KnownBlock | null)[]): KnownBlock[] =>
  blocks.filter(block => block) as KnownBlock[];
