import { Channel, DateString, User } from './formatting';

describe('Slack formatting widgets', () => {
  it('creates a formatted channel', () => {
    expect.assertions(1);
    const channelId = 'CCHANNELID';
    expect(Channel(channelId)).toBe(`<#${channelId}>`);
  });

  it('creates a formatted date', () => {
    expect.assertions(1);
    const timestamp = 1567191506;
    const format = 'Posted {date_num}';
    const fallback = 'Posted 2019-09-30';
    expect(DateString(timestamp, format, fallback)).toBe(
      `<!date^${timestamp}^${format}|${fallback}>`,
    );
  });

  it('creates a formatted user', () => {
    expect.assertions(1);
    const userId = 'UUSERID';
    expect(User(userId)).toBe(`<@${userId}>`);
  });
});
