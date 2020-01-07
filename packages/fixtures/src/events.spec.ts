import { events } from './index';

describe('Events fixtures', () => {
  const user_id = 'UPINKIE';
  const command = '/command';

  it('slashCommand Events return an object', () => {
    expect.assertions(1);

    // Not including more in depth tests as typing should serve that purpose
    expect(events.slashCommand(command)).toEqual(
      expect.objectContaining({ command }),
    );
  });

  it('can override slashCommand fields', () => {
    expect.assertions(1);

    const options = { user_id };

    expect(events.slashCommand(command, options)).toEqual(
      expect.objectContaining(options),
    );
  });

  it('generates block button action Events', () => {
    expect.assertions(1);
    const action_id = 'button';
    const event = events.blockButtonAction({ action_id });

    // Not including more in depth tests as typing should serve that purpose
    expect(event.actions[0].action_id).toEqual(action_id);
  });

  it('can override block action fields', () => {
    expect.assertions(1);
    const options = {
      user: {
        id: user_id,
        name: 'Pinkie',
      },
    };

    expect(events.blockButtonAction({}, options)).toEqual(
      expect.objectContaining(options),
    );
  });
});
