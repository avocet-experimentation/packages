import { AnyPrimitive } from './bounded-primitives.js';
import { GeneralRecord, NonEmptyArray, SafeOmit } from './utility-types.js';

/**
 * Convert an array of objects of type `T` to `Record<T[K], T>`,
 * where `K` is a key to a value that can be cast to a string
 */
export const mapToUniqueKey = <T, K extends keyof T>(
  objects: T[],
  key: K,
): Record<string, T> =>
    objects.reduce(
      (acc: Record<string, T>, el) =>
        Object.assign(acc, { [String(el[key])]: el }),
      {},
    );

const isNullish = (arg: unknown): arg is null | undefined =>
  arg === null || arg === undefined;
/**
 * Mutably sorts an array of objects by the string order of the value on the
 * specified key. The sort order of nullish values is not modified.
 * Otherwise assumes that values can be cast to strings.
 * @param key A top-level key on the objects passed
 * @returns
 */
export const sortByKey = <T, K extends keyof T>(objects: T[], key: K): T[] =>
  objects.sort((a, b) => {
    if (isNullish(a[key])) return -1;
    if (isNullish(b[key])) return 1;
    const valueA = String(a[key]);
    const valueB = String(b[key]);
    if (valueA === valueB) return 0;
    return valueA < valueB ? -1 : 1;
  });

export const idMap = <T extends { id: string }>(
  objects: T[],
): Record<string, T> =>
    objects.reduce(
      (acc: Record<string, T>, el) => Object.assign(acc, { [el.id]: el }),
      {},
    );

export function isKeyOf<T extends GeneralRecord>(
  possibleKey: string | number | symbol,
  obj: T,
): possibleKey is keyof T {
  return (
    possibleKey in obj
    && ((typeof possibleKey !== 'symbol' && obj[possibleKey] !== undefined)
      || obj.possibleKey !== undefined)
  );
}

export function addProp<T extends object, K extends PropertyKey, V>(
  obj: T,
  key: K,
  value: V,
): asserts obj is T & { [P in K]: V } {
  Object.assign(obj, { [key]: value });
}

function isObject(arg: unknown): arg is GeneralRecord {
  const passedChecks = typeof arg === 'object' && arg !== null && !Array.isArray(arg);
  return passedChecks;
}

export function assertObject(arg: unknown): asserts arg is GeneralRecord {
  if (!isObject(arg)) {
    throw new TypeError(`Argument ${JSON.stringify(arg)} is not an object!`);
  }
}

export function isObjectWithProps(arg: unknown): arg is GeneralRecord {
  const passedChecks = isObject(arg)
    && Object.keys(arg).filter((key) => typeof key !== 'symbol').length >= 1;
  return passedChecks;
}
/**
 * Returns a copy of the input object with any keys containing `undefined`
 *  removed. Throws if the input isn't an object.
 */
export function stripKeysWithUndefined(input: object) {
  assertObject(input);

  const rec = (obj: GeneralRecord) => {
    const result = { ...obj };

    Object.keys(result).forEach((key) => {
      const value = obj[key];
      if (result[key] === undefined) {
        delete result[key];
      } else if (isObjectWithProps(value)) {
        result[key] = rec(value);
      }
    });

    return result;
  };

  return rec(input);
}
/**
 * Returns a copy of the input object with any keys containing `undefined`
 *  removed. Throws if the input isn't an object.
 */
export function stripKeysWithValues(
  input: object,
  matchValues: AnyPrimitive[],
  options: {
    /** Maximum recursion depth. Defaults to 1 (no recursion) */
    maxDepth?: number;
  },
) {
  assertObject(input);

  const defaultOptions = {
    maxDepth: 1,
  };

  const mergedOptions = { ...defaultOptions, ...options };
  let currentDepth = 1;

  const rec = (obj: GeneralRecord) => {
    const result = { ...obj };

    const compareSet = new Set<unknown>(matchValues);

    Object.keys(result).forEach((key) => {
      const value = result[key];
      if (compareSet.has(result[key])) {
        delete result[key];
      } else if (isObjectWithProps(value)) {
        if (currentDepth === mergedOptions.maxDepth) return;
        currentDepth += 1;
        result[key] = rec(value);
      }
    });

    return result;
  };

  return rec(input);
}

export function pickKeys<T extends object, K extends keyof T>(
  keys: readonly K[],
  obj: T,
): SafeOmit<T, (typeof keys)[number]> {
  const output = keys.reduce(
    (acc, key) => Object.assign(acc, key in obj ? { [key]: obj[key] } : {}),
    {} as SafeOmit<T, (typeof keys)[number]>,
  );

  return output;
}

export function assertNonEmptyArray<T>(
  arr: T[],
  errorMessage?: string,
): asserts arr is NonEmptyArray<T> {
  if (arr.length === 0) throw new TypeError(errorMessage ?? 'Array is empty');
}
