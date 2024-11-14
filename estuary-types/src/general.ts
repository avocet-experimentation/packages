import { z } from 'zod';
import { ClientConnection, clientConnectionSchema, ClientPropDef, clientPropDefSchema } from './flagClients.js';
import { Environment, environmentSchema } from './environments.js';
import { Experiment, experimentSchema } from './experiments.js';
import { FeatureFlag, featureFlagSchema } from './featureFlags.js';

/**
 * Generic type representing all Zod schema.
 */
export type AnyZodSchema = z.ZodTypeAny;

export type EstuaryObjectSchema = z.AnyZodObject;

/**
 * Infer a type from a schema
 */
export type InferFromSchema<Z extends z.ZodTypeAny> = z.infer<Z>;
/**
 * Infer an object type from a schema - might be useless
 */
export type InferFromObjectSchema<S extends z.AnyZodObject> = InferFromSchema<S>;

export const estuaryMongoTypesSchema = z.union([
  featureFlagSchema,
  experimentSchema,
  environmentSchema,
  clientPropDefSchema,
  clientConnectionSchema,
]);

export const estuaryMongoCollectionNameSchema = z.enum([
  'FeatureFlag',
  'Experiment',
  'Environment',
  'ClientPropDef',
  'ClientConnection',
  'User',
]);

export type EstuaryMongoCollectionName = z.infer<typeof estuaryMongoCollectionNameSchema>;

/**
 * Union of types stored in MongoDB
 */
export type EstuaryMongoTypes = 
  | FeatureFlag
  | Experiment
  | Environment
  | ClientPropDef
  | ClientConnection; // later: users and event types

// export type EstuaryMongoType<T extends EstuaryMongoTypes> = T;
/**
 * Infers the type of a schema. Useful for ensuring that the right schema is passed in
 * when passing in `T` as a generic type argument
 */
export type EstuarySchema<T extends EstuaryMongoTypes> =
T extends FeatureFlag ? typeof featureFlagSchema :
T extends Experiment ? typeof experimentSchema :
T extends Environment ? typeof environmentSchema :
T extends ClientPropDef ? typeof clientPropDefSchema :
T extends ClientConnection ? typeof clientConnectionSchema :
never;

/**
 * Given a Zod object schema, returns a corresponding schema with all properties made
 * optional. Throws an error if the argument is not a Zod object schema.
 * The generic type S is used for inference of the exact schema type at runtime;
 * see https://zod.dev/?id=writing-generic-functions
 */
export const getPartialSchema = <S extends z.ZodTypeAny, O extends z.AnyZodObject>(schema: S): S => {
  return (schema as unknown as O).partial() as unknown as S;
}

/**
 * (WIP) Returns a schema with only the passed keys required
 * Loses type information
 */
export const schemaRequireOnly = <S extends z.ZodTypeAny, O extends z.AnyZodObject>(schema: S, keys: string[]): S => {
  const keyObj = keys.reduce((acc, key) => Object.assign(acc, { [key]: true }), {});
  const required = (schema as unknown as O)
    .pick(keyObj);
  const optional = (schema as unknown as O)
    .omit(keyObj);

  return required.merge(optional) as unknown as S;
}
/**
 * WIP
 */
export const schemaOmit = <S extends z.ZodTypeAny>(schema: S, keys: string[]) => {
  const keyObj = keys.reduce((acc, key) => Object.assign(acc, { [key]: true }), {});
  return (schema as unknown as z.AnyZodObject).omit(keyObj) as unknown as S;
}
/**
 * Unlike the native Omit, this raises a type error if `Keys` includes a key not on `T`
 */
export type SafeOmit<T, Keys extends keyof T> = {
  [P in keyof T as P extends Keys ? never : P]: T[P]
}
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
 * Version that is complete but not yet assigned an ObjectId by MongoDB
 */
export type BeforeId<T extends EstuaryMongoTypes> = Omit<T, 'id' | '_id'>;

/**
 * Partial object used to update only the provided fields. Only the `id` field is required.
 */
export type PartialUpdate<T extends EstuaryMongoTypes> = RequireOnly<T, 'id'>;
/**
 * A partial object with only the minimum fields required to save it as a draft. Might replace this with per-type
 * draft definitions.
 */
export type DraftRecord<T extends EstuaryMongoTypes> = RequireOnly<T, 'name'>;
