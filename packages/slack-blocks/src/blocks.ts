import {
  ActionsBlock,
  Button as TButton,
  ContextBlock,
  DividerBlock,
  MrkdwnElement,
  PlainTextElement,
  SectionBlock,
} from '@slack/types';

export const Divider = (): DividerBlock => ({
  type: 'divider',
});

export const Markdown = (text: string): MrkdwnElement => ({
  type: 'mrkdwn',
  text,
});

export const PlainText = (text: string, emoji = true): PlainTextElement => ({
  type: 'plain_text',
  text,
  emoji,
});

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

export const Context = (elements: ContextBlock['elements']): ContextBlock => ({
  type: 'context',
  elements,
});

export const Actions = (elements: ActionsBlock['elements']): ActionsBlock => ({
  type: 'actions',
  elements,
});

export const Button = (
  text: string,
  value: string,
  buttonBlock?: Partial<TButton>,
): TButton => ({
  type: 'button',
  text: PlainText(text),
  value,
  ...buttonBlock,
});

export const DateString = (
  timestamp: number,
  format: string,
  fallback: string,
): string => `<!date^${timestamp}^${format}|${fallback}>`;
