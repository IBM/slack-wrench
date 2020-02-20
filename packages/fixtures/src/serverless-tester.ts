import {
  APIGatewayProxyEvent,
  APIGatewayProxyResult,
  Context,
} from 'aws-lambda';
import crypto from 'crypto';
import serverless, { Application, Handler } from 'serverless-http';

export default class ServerlessTester {
  private handler: Handler;

  private readonly signingSecret: string;

  constructor(app: Application, signingSecret: string) {
    this.handler = serverless(app);
    this.signingSecret = signingSecret;
  }

  private createSlackRequest(
    data: any,
    path = '/slack/events',
  ): Partial<APIGatewayProxyEvent> {
    const body = JSON.stringify(data);
    const version = 'v0';
    const timestamp = Math.floor(Date.now() / 1000);
    const signature = crypto
      .createHmac('sha256', this.signingSecret)
      .update(`${version}:${timestamp}:${body}`)
      .digest('hex');

    return {
      body,
      path,
      headers: {
        'content-type': 'application/json',
        'x-slack-request-timestamp': timestamp.toString(),
        'x-slack-signature': `${version}=${signature}`,
      },
      httpMethod: 'POST',
    };
  }

  public sendHttp(
    event: Partial<APIGatewayProxyEvent>,
  ): Promise<APIGatewayProxyResult> {
    return this.handler(event as APIGatewayProxyEvent, {} as Context);
  }

  public sendSlackEvent(
    event: Record<string, any>,
    path?: string,
  ): Promise<APIGatewayProxyResult> {
    return this.sendHttp(this.createSlackRequest(event, path));
  }
}
