import path from 'path';
import { CommandBuilder, Argv } from 'yargs';

import { Config } from '../../config';
import loadConfig from '../../load-config';

interface ApplyArgs {
  config: string;
  timeout: number;
  ngrok?: number;
}

const handler = (argv: ApplyArgs): Promise<Config> => {
  const searchFrom = path.resolve(process.cwd(), argv.config);
  return loadConfig(searchFrom);
};

const builder = (command: any): any =>
  command
    .option('n', {
      alias: 'ngrok',
      type: 'number',
    })
    .option('t', {
      alias: 'timeout',
      type: 'number',
      default: 0,
    })
    .option('c', {
      alias: 'config',
      type: 'string',
      default: process.cwd(),
    }) as CommandBuilder<any, ApplyArgs>;

const command = {
  command: 'apply',
  describe: 'apply a Slack app configuration',
  builder,
  handler,
};

export default command;
