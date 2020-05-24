import R, {
  concat,
  curry,
  flip,
  has,
  ifElse,
  lensIndex,
  lensProp,
  lt,
  map,
  mapObjIndexed,
  mergeLeft,
  of,
  over,
  pick,
  pipe,
  prop,
  take,
  values,
  view,
} from 'ramda';

// space + smart ellipsis
const ellipsisChars = ' …';

/**
 * given a limit and a string, returns a string with at most `limit` characters with ' …' appended to the end
 * example:
 * ellipsisText('Hello World!', 9) => 'Hello W …'
 */
const ellipsisText = curry((limit: number, value: string): string =>
  pipe<string, string, string>(
    take(limit - ellipsisChars.length),
    flip(concat)(ellipsisChars),
  )(value),
);

/**
 * takes string or { text: '...', ...}, and limits either the string itself or the text property on the object
 * resulting string will be a maximum of `limit` characters.
 * the last 2 characters of the string will be ` …` if the string is longer than `limit`
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
 *  identity function which just swallows the `limit`, and won't limit
 */
export const identity = <T>(limit: number, value: T): T => R.identity(value);

/**
 * truncate by just taking the first `limit` elements of `value`
 * works for list string, or object with text property
 */
// eslint-disable-next-line @typescript-eslint/ban-ts-ignore
// @ts-ignore
export const truncate = <T>(limit: number, value: T): T =>
  ifElse(has('text'), over(lensProp('text'), take(limit)), take(limit))(value);

export type Limiter = <T>(limit: number, value: T) => T;
export type LimitTuple = [number, Limiter, LimitOpts?];

/**
 * mapping of properties to limit number and function
 * maps properties of an object to 1. number limit for the field, 2. the Limiter to call on that field, and 3. the `LimitOpts` to apply nested LimiterFuncs to fields for list values
 */
export type LimitOpts = Record<string, LimitTuple>;
export type LimiterFuncs = Record<string, Limiter | [Limiter, LimiterFuncs]>;
export type Limits = Record<string, number | [number, Limits]>;

/**
 * [number, fn, { string: [number, fn, {...}], ...}]
 *  => [number | fn, {string: [number | fn, {...}], ...}]
 *
 * helper for extracting the right index from `LimitTuple` and apply `fn` recursively with the nested info
 */
const mapPropToRecursiveIndexCall = <T>(
  index: number,
  extractFunction: (options: LimitOpts) => T,
  options: LimitOpts,
): T =>
  map(
    ifElse(
      has('2'),
      pipe(
        pick([String(index), '2']),
        over(lensProp('2'), extractFunction),
        values,
      ),
      view(lensIndex(index)),
    ),
    options,
  );

/**
 * extract `Limits` from `LimitOpts` recursively (mostly internal)
 */
export const limits = (options: LimitOpts): Limits =>
  mapPropToRecursiveIndexCall<Limits>(0, limits, options);

/**
 * extract `LimiterFuncs` from LimitOpts recursively (mostly internal)
 */
export const limiters = (options: LimitOpts): LimiterFuncs =>
  mapPropToRecursiveIndexCall<LimiterFuncs>(1, limiters, options);

/**
 * wraps in array for use in function if not already a tuple (internal helper function)
 */
const selfOrArrayOf: <T, J>(el: T | [T, J?]) => [T, J?] = ifElse(
  Array.isArray,
  R.identity,
  of,
);

/**
 * applies `limitFn` with `limit` to the value for each key in `obj` element
 */
export const applyLimiters = <T extends Record<string, any>>(
  obj: T,
  limitFns: LimiterFuncs,
  limitMap: Limits,
): T =>
  // typing isn't quite right on mapObjIndexed, and this is called recursively
  // eslint-disable-next-line @typescript-eslint/ban-ts-ignore
  // @ts-ignore
  // eslint-disable-next-line @typescript-eslint/no-use-before-define
  mapObjIndexed(applyLimitInfo(limitFns, limitMap), obj);

/**
 * given a key from `LimitOpts`, this is all relevant limit information
 */
export interface LimitInfo {
  valLimiter: Limiter;
  eachLimiters: LimiterFuncs | undefined;
  valLimit: number;
  eachLimits: Limits | undefined;
  shouldLimit: boolean;
}

/**
 * extracts `key`-specific `limitFns` and `limits` from as LimitInfo
 */
const getKeyLimitInfo = (
  limitFns: LimiterFuncs,
  limitMap: Limits,
  key: string,
): LimitInfo => {
  const [valLimiter, eachLimiters] = selfOrArrayOf(limitFns[key]);
  const [valLimit, eachLimits] = selfOrArrayOf(limitMap[key]);
  const shouldLimit = Object.keys(limitFns).includes(key);

  return { valLimiter, eachLimiters, valLimit, eachLimits, shouldLimit };
};

/**
 * true if value's length is greater than limit, false otherwise
 */
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

/**
 * apply the given limit information to nested values if relevant,
 * and to current `value` if it's too long based on the LimitInfo
 */
const applyLimitInfoToValue = <T>(
  { valLimiter, eachLimiters, valLimit, eachLimits, shouldLimit }: LimitInfo,
  value: T,
): T => {
  let limitedVal = value;

  if (eachLimiters && eachLimits) {
    limitedVal = map(
      <I>(val: I): I => applyLimiters(val, eachLimiters, eachLimits),
      value,
    );
  }

  if (shouldLimit && isTooLongForBlock(valLimit)(value)) {
    return valLimiter(valLimit, limitedVal);
  }

  return limitedVal;
};

/**
 * given `limitFns` and `limits`
 * returns a function that getsLimitInfo for the specific `key` and applies to `value`
 */
const applyLimitInfo = (limitFns: LimiterFuncs, limitMap: Limits) => <T>(
  value: T,
  key: string,
): T => applyLimitInfoToValue(getKeyLimitInfo(limitFns, limitMap, key), value);

/**
 * takes the element `obj` and any user provided `overrideFns` and applies
 * those merged with the default LimitOpts to each limited field if and
 * only if that field's length is greater than the slack limits
 */
export const applyLimitersWithOverrides = <T extends Record<string, any>>(
  obj: T,
  defaultLimitOpts: LimitOpts,
  overrideFns: LimiterFuncs = {},
): T =>
  applyLimiters(
    obj,
    mergeLeft(overrideFns, limiters(defaultLimitOpts)),
    limits(defaultLimitOpts),
  );
