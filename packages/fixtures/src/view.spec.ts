import { view } from './index';

describe('Views fixtures', () => {
  const user_id = 'UPINKIE';
  const options = {
    user: {
      id: user_id,
      name: 'Pinkie',
    },
  };

  Object.entries({
    submit: view.viewSubmitAction,
  }).forEach(([name, viewAction]) => {
    it(`generates view ${name} action with overrideable view`, () => {
      expect.assertions(1);
      const id = name;
      const event = viewAction({ id });

      // Not including more in depth tests as typing should serve that purpose
      expect(event.view.id).toEqual(id);
    });

    it(`can override view ${name} action fields`, () => {
      expect.assertions(1);

      expect(viewAction({}, options)).toEqual(expect.objectContaining(options));
    });
  });
});
