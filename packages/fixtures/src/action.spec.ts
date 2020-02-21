import { actions } from './index';

describe('Actions fixtures', () => {
  const user_id = 'UPINKIE';

  it('generates block button actions', () => {
    expect.assertions(1);
    const action_id = 'button';
    const event = actions.blockButtonAction({ action_id });

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

    expect(actions.blockButtonAction({}, options)).toEqual(
      expect.objectContaining(options),
    );
  });
});
