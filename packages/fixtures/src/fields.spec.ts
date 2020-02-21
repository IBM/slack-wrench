import { actions, fields } from './index';

describe('Defaults', () => {
  afterEach(() => {
    fields.reset();
  });

  it('has all the fields', () => {
    expect.assertions(1);
    expect(fields).toMatchSnapshot();
  });

  it('allows global overrides', () => {
    expect.assertions(2);
    const overrideToken = 'a-very-different-token';
    const originalToken = fields.token;

    expect(actions.blockButtonAction()).toEqual(
      expect.objectContaining({
        token: originalToken,
      }),
    );

    fields.token = overrideToken;

    expect(actions.blockButtonAction()).toEqual(
      expect.objectContaining({
        token: overrideToken,
      }),
    );
  });

  it('Allows resetting overrides', () => {
    expect.assertions(1);
    const originalTs = fields.ts;

    fields.ts = "this isn't a real ts";

    fields.reset();

    expect(fields.ts).toEqual(originalTs);
  });
});
