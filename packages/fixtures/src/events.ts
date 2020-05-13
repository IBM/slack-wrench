/**
 * For all events that arrive via event's api subscription
 */
import {
  AppMentionEvent,
  BasicSlackEvent,
  MemberJoinedChannelEvent,
  MessageEvent,
} from '@slack/bolt';

import fields from './fields';

/**
 * A Slack Events API event wrapped in the standard envelope.
 *
 * This describes the entire JSON-encoded body of a request from Slack's Events API.
 *
 * Non-exported type from bolt:
 * https://github.com/slackapi/bolt/blob/master/src/types/events/index.ts#L22
 */
interface EnvelopedEvent<Event = BasicSlackEvent> extends Record<string, any> {
  token: string;
  team_id: string;
  enterprise_id?: string;
  api_app_id: string;
  event: Event;
  type: 'event_callback';
  event_id: string;
  event_time: number;
  authed_users?: string[];
}

export function apiEvent<Event = BasicSlackEvent>(
  event: Event,
): EnvelopedEvent<Event> {
  const {
    token,
    api_app_id,
    team,
    event_id,
    event_time,
    authed_users,
  } = fields;

  return {
    type: 'event_callback',
    team_id: team.id,
    event,
    token,
    api_app_id,
    event_id,
    event_time,
    authed_users,
  };
}

export const message = (
  text: string,
  options: Partial<MessageEvent> = {},
): EnvelopedEvent<MessageEvent> => {
  const { user, channel, ts } = fields;

  return apiEvent<MessageEvent>({
    type: 'message',
    text,
    ts,
    channel: channel.id,
    user: user.id,
    ...options,
  });
};

export const appMention = (
  text: string,
  options: Partial<AppMentionEvent> = {},
): EnvelopedEvent<AppMentionEvent> => {
  const { user, channel, ts } = fields;

  return apiEvent<AppMentionEvent>({
    type: 'app_mention',
    text,
    ts,
    event_ts: ts,
    channel: channel.id,
    user: user.id,
    ...options,
  });
};

export const memberJoinedChannel = (
  user: string,
  channel: string,
  channel_type: string,
  team: string,
  options: Partial<MemberJoinedChannelEvent> = {},
): EnvelopedEvent<MemberJoinedChannelEvent> => {
  const { inviter } = fields;

  return apiEvent<MemberJoinedChannelEvent>({
    type: 'member_joined_channel',
    user,
    channel,
    channel_type,
    team,
    inviter: inviter.id,
    ...options,
  });
};
