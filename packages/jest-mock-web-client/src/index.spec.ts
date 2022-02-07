import * as SlackWebApi from '@slack/web-api';
import { WebClient } from '@slack/web-api';

import { MockedWebClient, MockWebClient } from './index';

describe('Mocked @slack/web-api', () => {
  let client: WebClient;
  let mockedClient: MockWebClient;

  beforeEach(() => {
    // How typescript projects setup create tests
    MockedWebClient.mockClear();

    // How a upstream project would initialize a client in application code.
    client = new WebClient();

    [mockedClient] = MockedWebClient.mock.instances;
  });

  it('mocks all api families', () => {
    expect.assertions(1);
    const { WebClient: RealWebClient } = jest.requireActual<typeof SlackWebApi>(
      '@slack/web-api',
    );
    const realClient = new RealWebClient();
    // Keys defined in the client that aren't api families
    const notFamilyKeys = [
      'retryConfig',
      'requestQueue',
      'tlsConfig',
      'logger',
    ];

    const apiFamilies = (clientInstance: WebClient | MockWebClient) =>
      Object.keys(clientInstance)
        .filter(
          (key) =>
            typeof (clientInstance as Record<string, any>)[key] === 'object',
        )
        .filter((key) => !key.startsWith('_'))
        .filter((key) => !notFamilyKeys.includes(key));

    const expectedApiFamilies = apiFamilies(realClient);
    const actualApiFamilies = apiFamilies(client);

    expect(actualApiFamilies).toEqual(expectedApiFamilies);
  });

  it('mocks web client instance functions', () => {
    expect.assertions(1);
    expect(jest.isMockFunction(client.chat.postMessage)).toBeTruthy();
  });

  it('returns ok by default', async () => {
    expect.assertions(1);
    expect(await client.chat.postMessage()).toEqual({ ok: true });
  });

  it('return values can be overridden', async () => {
    expect.assertions(1);

    const newResult = {
      ok: true,
      message: {
        text: 'Hello World',
      },
    };

    mockedClient.chat.postMessage.mockResolvedValue(newResult);

    expect(await client.chat.postMessage()).toEqual(newResult);
  });

  it('allows jest expect functions', async () => {
    expect.assertions(1);

    await client.chat.postMessage();

    expect(client.chat.postMessage).toHaveBeenCalledTimes(1);
  });

  it('exposes instances "normally"', () => {
    expect.assertions(2);

    expect(MockedWebClient.mock.instances.length).toEqual(1);
    expect(MockedWebClient.mock.instances[0]).toBe(client);
  });

  it('allows MockedWebClient to be constructable', () => {
    expect.assertions(1);
    const instance = new MockedWebClient();
    expect(jest.isMockFunction(instance.chat.postMessage)).toBeTruthy();
  });
});
