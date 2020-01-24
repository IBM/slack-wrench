import { App } from '@slack/bolt';
import { WebClient } from '@slack/web-api';
import { Server } from 'http';
import { AddressInfo } from 'net';
import ngrok from 'ngrok';

interface IntegrationArgs {
  client: WebClient;
  baseUrl: () => string;
  fetchApp: (url: string) => Promise<any>;
}

type IntegrationTests = (args: IntegrationArgs) => void;

export default function integration(tests: IntegrationTests) {
  if (process.env.SLACK_SESSION_TOKEN) {
    describe('with the real api', () => {
      const client = new WebClient(process.env.SLACK_SESSION_TOKEN);
      let app: App;
      let ngrokUrl: string;

      beforeAll(async () => {
        app = new App({
          signingSecret: process.env.SLACK_SIGNING_SECRET,
          token: process.env.SLACK_BOT_TOKEN,
        });

        const server = (await app.start(0)) as Server;
        const { port } = server.address() as AddressInfo;

        ngrokUrl = await ngrok.connect(port);
      });

      afterAll(async () => {
        await Promise.all([app.stop(), ngrok.kill()]);
      });

      const baseUrl = (): string => ngrokUrl;

      const fetchApp = async (app_id: string): Promise<any> => {
        const result = await client.apiCall('developer.apps.info', {
          app_id,
        });

        return result.app;
      };

      tests({ client, baseUrl, fetchApp });
    });
  }
}
