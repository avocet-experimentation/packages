import { z } from 'zod';

/* UTILITY SCHEMA AND TYPES */

export const nonNegativeIntegerSchema = z.number().int().gte(0);
/**
 * Represents a portion of a whole between 0 and 1, inclusive
 */
export const proportionSchema = z.number().gte(0).lte(1);

/** .default might cause type inference problems */
export const defaultEmptyStringSchema = z.string().default('');

export const nonEmptyStringSchema = z.string().min(1);

export const bsonObjectIdHexStringSchema = z.string().length(24);

/**
 * Similar to Unix timestamp, but also accepts negative values indicating dates before 1970.
 * See https://www.mongodb.com/docs/manual/reference/bson-types/#std-label-document-bson-type-date
 */
export const bsonDateSchema = z.number().int();
/**
 * Unlike the native Omit, this raises a type error if `Keys` includes a key not on `T`
 */

export type SafeOmit<T, Keys extends keyof T> = {
  [P in keyof T as P extends Keys ? never : P]: T[P];
};
/**
 * Makes the passed properties required, and others optional. Example usage:
 * `type DraftFlag = RequireOnly<FeatureFlag, 'name' | 'environments'>;`
 */
export type RequireOnly<T, K extends keyof T> = Required<Pick<T, K>> & Partial<Omit<T, K>>;
/**
 * Makes the passed properties optional, and the rest required.
 */
export type RequireExcept<T, K extends keyof T> = Required<Omit<T, K>> & Partial<Pick<T, K>>;
/**
 * Given a Zod object schema, returns a corresponding schema with all properties made
 * optional. Throws an error if the argument is not a Zod object schema.
 * The generic type S is used for inference of the exact schema type at runtime;
 * see https://zod.dev/?id=writing-generic-functions
 */

export const getPartialSchema = <S extends z.ZodTypeAny, O extends z.AnyZodObject>(schema: S): S => {
  return (schema as unknown as O).deepPartial() as unknown as S;
};
/**
 * (WIP) Returns a schema with only the passed keys required
 * Loses type information
 */

export const schemaRequireOnly = <S extends z.ZodTypeAny, O extends z.AnyZodObject, K extends keyof S>(schema: O, keys: K[]): RequireOnly<S, K> => {
  const objectSchema = schema as unknown as O;
  const keyObj = keys.reduce((acc, key) => Object.assign(acc, { [key]: true }), {});
  const required = objectSchema.pick(keyObj).required();
  const optional = objectSchema.omit(keyObj).partial();

  return required.merge(optional) as unknown as RequireOnly<S, K>;
};
/**
 * WIP
 */
export const schemaOmit = <S extends z.ZodTypeAny>(schema: S, keys: string[]) => {
  const keyObj = keys.reduce((acc, key) => Object.assign(acc, { [key]: true }), {});
  return (schema as unknown as z.AnyZodObject).omit(keyObj) as unknown as S;
};
