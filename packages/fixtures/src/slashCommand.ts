import { SlashCommand } from '@slack/bolt';

import fields from './fields';

export default (
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
