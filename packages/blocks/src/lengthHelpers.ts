import R, {
  concat,
  curry,
  flip,
  has,
  ifElse,
  lensIndex,
  lensProp,
  lt,
  mapObjIndexed,
  over,
  pipe,
  prop,
  take,
  view,
} from 'ramda';

const dot3 = '...';

/**
 * given a truncate total limit and a string, returns a string with at most `limit` characters with '...' appended to the end
 * example:
 * ellipsisText('Hello World!', 8) => 'Hello...'
 */
const ellipsisText = curry((limit: number, value: string): string =>
  pipe<string, string, string>(
    take(limit - dot3.length),
    flip(concat)(dot3),
  )(value),
);

/**
 * takes string or { text: '...', ...}, and truncates either the string itself or the text property on the object
 * resulting string will be a maximum of `limit` characters.
 * the last 3 characters of the string will be `...` if the string is longer than `limit`
 */
export const ellipsis = <T>(limit: number, value: T): T =>
  ifElse(
    has('text'),
    over(lensProp('text'), ellipsisText(limit)),
    ellipsisText(limit),
  )(value);

/**
 * error function - throws error immediately on function call
 */
export const disallow = (limit: number, value: any): never => {
  throw Error(
    `Invalid length for property, max ${limit}: ${value.text || value}`,
  );
};

/**
 *  identity function which just swallows the `limit`, and won't truncate
 */
export const identity = <T>(limit: number, value: T): T => R.identity(value);

/**
 * truncates by just taking the first `limit` elements of `value`
 * works for list or string
 */
// eslint-disable-next-line @typescript-eslint/ban-ts-ignore
// @ts-ignore
export const truncate = <T>(limit: number, value: T): T => take(limit)(value);

const longerThan = curry((limit: number, value: any): boolean =>
  pipe<any, number, boolean>(prop('length'), lt(limit))(value),
);

/**
 * returns true if the relevant length on `value` is greater than `limit`
 */
const isTooLongForBlock = curry((limit: number, value: any): boolean =>
  ifElse(
    has('text'),
    pipe(prop('text'), longerThan(limit)),
    longerThan(limit),
  )(value),
);

export type TruncateFunction = <T>(limit: number, value: T) => T;

/**
 * mapping of properties to limit number and truncate function
 */
export type TruncateOptions = Record<string, [number, TruncateFunction]>;

/**
 * mostly internal function for handling extracting limits from TruncateOptions
 */
export const truncLimits: (
  options: TruncateOptions,
) => Record<string, number> = mapObjIndexed(view(lensIndex(0)));

/**
 * mostly internal function for handling extracting functions from TruncateOptions
 */
export const truncators: (
  options: TruncateOptions,
) => Record<string, TruncateFunction> = mapObjIndexed(view(lensIndex(1)));

/**
 * mostly internal function for building blocks - takes the element `obj` and
 * applies the truncation `functions` to each limited field iff that field's length is greater than its
 * respective limit for that block
 * @param obj
 * @param functions
 * @param limits
 */
export const applyTruncations = <T extends Record<string, any>>(
  obj: T,
  functions: Record<string, TruncateFunction>,
  limits: Record<string, number>,
): T => {
  const truncateKeys = Object.keys(functions);

  // for each key in object, apply the function in functions associated with that key if exists
  // eslint-disable-next-line @typescript-eslint/ban-ts-ignore
  // @ts-ignore
  return mapObjIndexed(<J>(value: J, key: string): J => {
    if (truncateKeys.includes(key) && isTooLongForBlock(limits[key])(value)) {
      return functions[key](limits[key], value);
    }

    return value;
  }, obj);
};
