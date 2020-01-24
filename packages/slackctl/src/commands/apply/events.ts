import { WebClient } from '@slack/web-api';
import url from 'url';

import { Config } from '../../config';

export default async function apply(config: Config, slack: WebClient) {
  const { id: app, events, baseUrl } = config;

  if (!events) {
    return;
  }

  const eventsCallback = url.resolve(baseUrl, events.requestPath);

  try {
    await slack.apiCall('developer.apps.events.subscriptions.verifyURL', {
      app,
      url: eventsCallback,
    });
  } catch (error) {
    throw new Error(
      `Couldn't verify event url ${eventsCallback}. Do you have a server running?`,
    );
  }

  await slack.apiCall('developer.apps.events.subscriptions.updateSubs', {
    app,
    app_event_types: events.workspaceEvents || [],
    bot_event_types: events.botEvents || [],
    enable: true,
    filter_teams: [],
    unfurl_domains: events.unfurlDomains || [],
    url: eventsCallback,
  });

  console.log('Receiving Slack events at: ', eventsCallback);
}
