import { slashCommand } from './index';

describe('Command fixture', () => {
  const user_id = 'UPINKIE';
  const command = '/command';

  it('slashCommand Events return an object', () => {
    expect.assertions(1);

    // Not including more in depth tests as typing should serve that purpose
    expect(slashCommand(command)).toEqual(expect.objectContaining({ command }));
  });

  it('can override slashCommand fields', () => {
    expect.assertions(1);

    const options = { user_id };

    expect(slashCommand(command, options)).toEqual(
      expect.objectContaining(options),
    );
  });
});
