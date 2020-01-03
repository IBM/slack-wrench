import { events } from './index';

// Not including snapshot tests as typing should serve that purpose
describe('Events fixtures', () => {
  const user_id = 'UPINKIE';

  it('generates slashCommand Events', () => {
    expect.assertions(1);
    expect(() => events.slashCommand('/command')).not.toThrow();
  });

  it('can override slashCommand fields', () => {
    expect.assertions(1);

    expect(events.slashCommand('/command', { user_id })).toEqual(
      expect.objectContaining({ user_id }),
    );
  });

  it('generates block button action Events', () => {
    expect.assertions(1);
    const action_id = 'button';
    const event = events.blockButtonAction({ action_id });

    expect(event.actions[0].action_id).toEqual(action_id);
  });

  it('can override block action fields', () => {
    expect.assertions(1);
    const user = {
      id: user_id,
      name: 'Pinkie',
    };

    expect(events.blockButtonAction({}, { user })).toEqual(
      expect.objectContaining({ user }),
    );
  });
});
