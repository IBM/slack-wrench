import { events } from './index';

describe('Events fixtures', () => {
  const user_id = 'UPINKIE';
  const text = 'Rainbow is 20% cooler';

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

    expect(events.memberJoinedChannel()).toMatchSnapshot();
  });

  it('can override memberJoinedChannel fields', () => {
    expect.assertions(1);

    const options = {
      user: 'UNEW_USER',
      channel: 'CNEW_CHANNEL',
      team: 'TNEW_TEAM',
      channel_type: 'G',
    };
    expect(events.memberJoinedChannel(options).event).toEqual(
      expect.objectContaining(options),
    );
  });

  it('channel type is inferred in memberJoinedChannel event', () => {
    expect.assertions(1);

    const options = { channel: 'GNEW_CHANNEL' };
    const result = { channel_type: 'G' };
    expect(events.memberJoinedChannel(options).event).toEqual(
      expect.objectContaining(result),
    );
  });
});
