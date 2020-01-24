import path from 'path';
import yargs from 'yargs';

import apply from './index';

describe('The apply command', () => {
  const parser = yargs.command(apply).help();

  const run = (cmd: string) =>
    new Promise(resolve => {
      parser.parse(cmd, (err: Error, argv: any, output: string) => {
        resolve(output);
      });
    });

  it('should output help', async () => {
    expect.assertions(1);
    const output = await run('apply --help');

    expect(output).toMatchSnapshot();
  });

  it('should load a correct config', async () => {
    expect.assertions(1);
    const config = await apply.handler({
      config: path.resolve(__dirname, '../../test/fixtures/correct'),
      timeout: 0,
    });

    expect(config).toMatchSnapshot();
  });
});
