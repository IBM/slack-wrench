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
});
