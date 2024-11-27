import { GeneralRecord } from "./utility-types.js";

export const idMap = <T extends { id: string; }>(
  records: T[]
): Record<string, T> => records.reduce((acc, el) => {
  return Object.assign(acc, { [el.id]: el });
}, {} as Record<string, T>);


export function isKeyOf<T extends Record<any, any>>(
  possibleKey: string | number | symbol,
  obj: T,
): possibleKey is keyof T {
  return (possibleKey in obj 
    && (
      typeof possibleKey !== 'symbol' && obj[possibleKey] !== undefined
      || obj.possibleKey !== undefined
    )
  );
}

function isObject(arg: unknown): arg is GeneralRecord {
  const passedChecks = typeof arg === "object"
    && arg !== null
    && !Array.isArray(arg);
  return passedChecks;
}

export function assertObject(arg: unknown): asserts arg is GeneralRecord {
  if (!isObject(arg)) {
    throw new TypeError(`Argument ${JSON.stringify(arg)} is not an object!`);
  }
}

export function isObjectWithProps(arg: unknown): arg is GeneralRecord {
  const passedChecks = isObject(arg) && Object.keys(arg)
    .filter(((key) => typeof key !== 'symbol')).length >= 1;
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
  }

  return rec(input);
}