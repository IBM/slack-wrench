import {
  BasicElementAction,
  BlockAction,
  BlockButtonAction,
  BlockElementAction,
  ButtonAction,
  MessageEvent,
  SlashCommand,
} from '@slack/bolt';

import fields from './fields';

export const message = (
  text: string,
  options: Partial<MessageEvent> = {},
): MessageEvent => {
  const { user, channel, ts } = fields;

  return {
    type: 'message',
    text,
    ts,
    channel: channel.id,
    user: user.id,
    ...options,
  };
};

export const slashCommand = (
  command: string,
  options: Partial<SlashCommand> = {},
): SlashCommand => {
  const { token, response_url, trigger_id, team, user, channel } = fields;

  return {
    command,
    text: '',
    token,
    response_url,
    trigger_id,
    user_id: user.id,
    user_name: user.name,
    team_id: team.id,
    team_domain: team.domain,
    channel_id: channel.id,
    channel_name: channel.name,
    ...options,
  };
};

// Helper function to create more specific Block Actions
function blockAction<Action extends BasicElementAction = BlockElementAction>(
  action: Action,
  options: Partial<BlockAction<Action>> = {},
): BlockAction<Action> {
  const {
    token,
    response_url,
    trigger_id,
    api_app_id,
    team,
    user,
    channel,
  } = fields;

  return {
    type: 'block_actions',
    actions: [action],
    team,
    user,
    channel,
    token,
    response_url,
    trigger_id,
    api_app_id,
    container: {},
    ...options,
  };
}

export function blockButtonAction(
  action?: Partial<ButtonAction>,
  options?: Partial<BlockButtonAction>,
): BlockButtonAction {
  return blockAction<ButtonAction>(
    {
      type: 'button',
      action_ts: 'ACTION_TS',
      text: {
        type: 'plain_text',
        text: 'TEXT',
      },
      action_id: 'ACTION_ID',
      block_id: 'BLOCK_ID',
      value: 'VALUE',
      ...action,
    },
    options,
  );
}
