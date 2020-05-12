import { events } from './index';

describe('Events fixtures', () => {
  const user_id = 'UPINKIE';
  const text = 'Rainbow is 20% cooler';
  const channel = 'CCHANNELID';
  const channel_type = 'C';
  const team = 'TTEAMID';

  it('generates a message block', () => {
    expect.assertions(1);

    // Not including more in depth tests as typing should serve that purpose
    expect(events.message(text).event).toEqual(
      expect.objectContaining({ text }),
    );
  });

  it('can override message fields', () => {
    expect.assertions(1);

    const options = { user: user_id };

    expect(events.message(text, options).event).toEqual(
      expect.objectContaining(options),
    );
  });

  it('generates a appMention block', () => {
    expect.assertions(1);

    // Not including more in depth tests as typing should serve that purpose
    expect(events.appMention(text).event).toEqual(
      expect.objectContaining({ text }),
    );
  });

  it('can override appMention fields', () => {
    expect.assertions(1);

    const options = { user: user_id };

    expect(events.appMention(text, options).event).toEqual(
      expect.objectContaining(options),
    );
  });

  it('generates a memberJoinedChannel block', () => {
    expect.assertions(1);

    // Not including more in depth tests as typing should serve that purpose
    expect(events.memberJoinedChannel(user_id, channel, channel_type, team).event).toEqual(
      expect.objectContaining({ type: 'member_joined_channel' }),
    );
  });

  it('can override memberJoinedChannel fields', () => {
    expect.assertions(1);

    const options = { user: 'NEW_USER' };

    expect(events.memberJoinedChannel(user_id, channel, channel_type, team, options).event).toEqual(
      expect.objectContaining(options),
    );
  });
});
