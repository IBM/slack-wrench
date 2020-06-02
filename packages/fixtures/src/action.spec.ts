import { actions } from './index';

describe('Actions fixtures', () => {
  const user_id = 'UPINKIE';
  const options = {
    user: {
      id: user_id,
      name: 'Pinkie',
    },
  };

  Object.entries({
    button: actions.blockButtonAction,
    static_select: actions.blockStaticSelectAction,
    overflow: actions.blockOverflowAction,
  }).forEach(([name, action]) => {
    it(`generates block ${name} actions`, () => {
      expect.assertions(1);
      const action_id = name;
      const event = action({ action_id });

      // Not including more in depth tests as typing should serve that purpose
      expect(event.actions[0].action_id).toEqual(action_id);
    });

    it(`can override block ${name} action fields`, () => {
      expect.assertions(1);

      expect(action({}, options)).toEqual(expect.objectContaining(options));
    });
  });
});
