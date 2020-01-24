import { cosmiconfig, defaultLoaders } from 'cosmiconfig';
import yaml from 'yaml';
import merge from 'deepmerge';

import ConfigValidator, { Config } from './config';

const configSearch = async (moduleName: string, searchFrom: string) => {
  const explorer = cosmiconfig(moduleName, {
    searchPlaces: [
      `${moduleName}.config.yaml`,
      `${moduleName}.config.yml`,
      `${moduleName}.config.js`,
      `${moduleName}.config.json`,
    ],
    loaders: {
      ...defaultLoaders,
      '.yaml': function loadYaml(filepath, content) {
        try {
          return yaml.parse(content);
        } catch (error) {
          error.message = `YAML Error in ${filepath}:\n${error.message}`;
          throw error;
        }
      },
    },
  });

  const result = await explorer.search(searchFrom);

  return result ? result.config : null;
};

const loadConfig = async (searchFrom: string): Promise<Config> => {
  const [baseConfig, localConfig] = await Promise.all([
    configSearch('slack', searchFrom),
    configSearch('slack.local', searchFrom),
  ]);

  if (!baseConfig) {
    throw new Error(`Couldn't locate a slack.config file in ${searchFrom}`);
  }

  if (baseConfig.sessionToken) {
    throw new Error(
      "Your base config can't contain a `token`, put it in a `.local` one or set via environment variable",
    );
  }

  const config = merge.all([baseConfig, localConfig || {}]) as Config;
  config.sessionToken = process.env.SLACK_SESSION_TOKEN || config.sessionToken;
  ConfigValidator.check(config);

  return config;
};

export default loadConfig;
