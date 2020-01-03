import { WebClient } from '@slack/web-api';

import { MockedWebClient, MockWebClient } from './index';

describe('Mocked @slack/web-api', () => {
  let client: WebClient;
  let mockedClient: MockWebClient;

  beforeEach(() => {
    // How typescript projects setup create tests
    MockedWebClient.mockClear();

    // How "project" could would use this.
    client = new WebClient();

    [mockedClient] = MockedWebClient.mock.instances;
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
});
