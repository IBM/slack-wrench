import {
  BasicElementAction,
  BlockAction,
  BlockButtonAction,
  BlockElementAction,
  ButtonAction,
  SlashCommand,
} from '@slack/bolt';

const token = 'TOKEN';
const response_url = 'https://fake.slack/response_url';
const trigger_id = 'TRIGGER_ID';
const api_app_id = 'API_APP_ID';
const user = {
  id: 'UUSERID',
  name: 'USER',
};
const channel = {
  id: 'CCHANNELID',
  name: 'channel',
};
const team = {
  id: 'TTEAMID',
  domain: 'team-domain',
};

export const slashCommand = (
  command: string,
  options: Partial<SlashCommand> = {},
): SlashCommand => ({
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
});

// Helper function to create more specific Block Actions
function blockAction<Action extends BasicElementAction = BlockElementAction>(
  action: Action,
  options: Partial<BlockAction<Action>> = {},
): BlockAction<Action> {
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
