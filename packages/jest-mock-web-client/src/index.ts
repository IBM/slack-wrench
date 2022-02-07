// Since the `@slack/web-api` is generally being mocked when this module is in
// use, we have to treat the types and original implementations separately.
// `Slack` represents the types, while we import the actual objects (which can
// no longer be used as types) are imported via `jest.requireActual`.
import type * as Slack from '@slack/web-api';

const { WebClient } = jest.requireActual<typeof Slack>('@slack/web-api');

/**
 * Creates a new type where functions in the original types are Jest mocks and
 * other values are kept as is, and which works recusively (so if a property
 * is an object with functions, it becomes and object with mocks).
 */
type ObjectWithMocks<Type> = {
  [Property in keyof Type]: Type[Property] extends CallableFunction
    ? jest.Mock<any>
    : Type[Property] extends Record<string, unknown>
    ? ObjectWithMocks<Type[Property]>
    : Type[Property];
};

/** A basic, pre-configured mock for Slack API methods. */
const mockApi = (): jest.Mock => jest.fn().mockResolvedValue({ ok: true });

const primitiveTypes = new Set(['string', 'boolean', 'number', 'undefined']);

/**
 * Make a concrete `ObjectWithMocks` from another object.
 */
function deepCopyWithMocks<T>(original: T): ObjectWithMocks<T> {
  const copy = {} as Record<string, any>;

  // In this situation, we want to include elements from the prototype chain,
  // so we can safely ignore ESLint here.
  // eslint-disable-next-line
  for (const key in original) {
    const value = original[key];
    if (typeof value === 'function') {
      copy[key] = mockApi();
    } else if (primitiveTypes.has(typeof value) || value == null) {
      copy[key] = value;
    } else {
      copy[key] = deepCopyWithMocks(value);
    }
  }

  return copy as ObjectWithMocks<T>;
}

/**
 * A constructor function that creates mock WebClient objects.
 *
 * This is a bit complicated! We need to construct a class (MockWebClient) with
 * a dynamic set of properties that depend on whatever version of Slack's
 * `WebClient` is in the current environment, but you can't use type mappings
 * directly on a class in TypeScript. Instead, we declare this function as a
 * constructor that returns objects of the appropriate mapped type (using
 * `ObjectWithMocks`), and then declare a class that inherits it. The class
 * winds up with the dynamic set of properties we want.
 */
const MockWebClientConstructor = (function mockWebClientConstructor(
  this: ObjectWithMocks<Slack.WebClient>,
) {
  const exampleClientInstance = new WebClient('MOCK_TOKEN');
  const instance = deepCopyWithMocks<Slack.WebClient>(exampleClientInstance);

  // Default for bolt apps
  // https://github.com/slackapi/bolt-js/blob/1655999346077e9521722a667414758da856ede2/src/App.ts#L579
  instance.auth.test.mockResolvedValue({
    ok: true,
    user_id: 'BOT_USER_ID',
    bot_id: 'BOT_ID',
  });

  Object.assign(this, instance);
} as unknown) as new (
  token?: string,
  options?: Slack.WebClientOptions,
) => ObjectWithMocks<Slack.WebClient>;

/**
 * This class mocks the `WebClient` class from `@slack/web-api` It constructs its
 * properties dynamically based on the type of Slack `WebClient` available in
 * its environment, and should result in something that matches the version you
 * have installed.
 *
 * See Slack's WebClient source for more on it:
 * https://github.com/slackapi/node-slack-sdk/blob/main/packages/web-api/src/WebClient.ts
 *
 * Disabling prefer-default-export as jest doesn't like modules, but typescript does
 */
export class MockWebClient extends MockWebClientConstructor {}

export const MockedWebClient: jest.MockedClass<typeof MockWebClient> = jest.fn(
  // @ts-expect-error: Typing seems to be wrong, this can take a class
  MockWebClient,
);

const mockWebApi = (jestModule: typeof jest): jest.Mock => {
  const mock =
    // genMockFromModule is deprecated, support more versions of jest by testing
    // prettier-ignore
    (
    // @ts-expect-error: Until jest is updated for this to exist
    // eslint-disable-next-line @typescript-eslint/no-unsafe-call
    /* istanbul ignore next */ jestModule.createMockFromModule ||
    jestModule.genMockFromModule
  )(
    '@slack/web-api',
  ) as jest.Mock;

  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore Based on previous ignore, unsure how to set this to the whole module
  mock.WebClient = MockedWebClient;

  return mock;
};

export default mockWebApi;
