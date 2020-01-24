import { cosmiconfig } from 'cosmiconfig';
import merge from 'deepmerge';

import ConfigValidator, { Config } from './config';

const configSearch = async (moduleName: string) => {
  const explorer = cosmiconfig(moduleName, {
    searchPlaces: [
      `${moduleName}.config.yaml`,
      `${moduleName}.config.yml`,
      `${moduleName}.config.js`,
      `${moduleName}.config.json`,
    ],
  });

  const result = await explorer.search();

  return result ? result.config : null;
};

const loadConfig = async (): Promise<Config> => {
  const [baseConfig, localConfig] = await Promise.all([
    configSearch('slack'),
    configSearch('slack.local'),
  ]);

  if (!baseConfig) {
    throw new Error("Couldn't locate a slack.config file.");
  }

  if (baseConfig.sessionToken) {
    throw new Error(
      'Your base config cant contain a `token`, put it in a local one or set via environment variable',
    );
  }

  const config = merge.all([baseConfig, localConfig || {}]) as Config;

  if (config.version !== 'v1.0') {
    throw new Error(
      'The only config version supported by this version of slackctl is v1.0',
    );
  }

  ConfigValidator.check(config);

  return config;
};

export default loadConfig;
