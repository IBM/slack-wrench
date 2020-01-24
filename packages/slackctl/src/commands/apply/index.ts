import { WebClient } from '@slack/web-api';

import loadConfig from '../../load-config';
import ngrok from '../../ngrok';
import events from './events';

// This URL will fetch the whole app config
// https://slack.com/api/developer.apps.info
export default async (argv: any) => {
  const config = await loadConfig();

  const sessionToken = process.env.SLACK_SESSION_TOKEN || config.sessionToken;

  if (!sessionToken) {
    console.error(
      "Couldn't find a session token. See the docs for instructions",
    );
    process.exit(1);
  }

  const slack = new WebClient(config.sessionToken);

  if (argv.ngrok) {
    config.baseUrl = await ngrok(argv.ngrok, argv.timeout);
  }

  await events(config, slack);

  console.log('Incoming event inspector: http://localhost:4040/');
};
