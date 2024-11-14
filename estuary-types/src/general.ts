import { z } from 'zod';
import { ClientPropDefDraft, clientPropDefDraftSchema } from './flagClients.js';
import { ClientConnectionDraft, clientConnectionDraftSchema } from "./flagClients.js";
import { EnvironmentDraft, environmentDraftSchema } from "./environments.js";
import { ExperimentDraft, experimentDraftSchema } from './experiments.js';
import { FeatureFlagDraft, featureFlagDraftSchema } from './featureFlags.js';
import { RequireOnly } from './util.js';
import {
  FeatureFlag,
  featureFlagSchema,
  Experiment,
  experimentSchema,
  Environment,
  environmentSchema,
  ClientPropDef,
  clientPropDefSchema,
  ClientConnection,
  clientConnectionSchema,
 } from './imputed.js';

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

export const estuaryDraftTypesSchema = z.union([
  featureFlagDraftSchema,
  experimentDraftSchema,
  environmentDraftSchema,
  clientPropDefDraftSchema,
  clientConnectionDraftSchema,
]);
/**
 * Union of draft types
 */
export type EstuaryDraftTypes = 
| FeatureFlagDraft
| ExperimentDraft
| EnvironmentDraft
| ClientPropDefDraft
| ClientConnectionDraft;

export const estuaryMongoTypesSchema = z.union([
  featureFlagSchema,
  experimentSchema,
  environmentSchema,
  clientPropDefSchema,
  clientConnectionSchema,
]);
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
 * Version that is complete but not yet assigned an ObjectId by MongoDB
 */
export type BeforeId<T extends EstuaryMongoTypes> = Omit<T, 'id' | '_id'>;
/**
 * Partial object used to update only the provided fields. Only the `id` field is required.
 */
export type PartialUpdate<T extends EstuaryMongoTypes> = RequireOnly<T, 'id'>;
/**
 * Mapping of 
 */
export type DraftRecord<T extends EstuaryMongoTypes> = 
T extends FeatureFlag ? FeatureFlagDraft :
T extends Experiment ? ExperimentDraft :
T extends Environment ? EnvironmentDraft :
T extends ClientPropDef ? ClientPropDefDraft :
T extends ClientConnection ? ClientConnectionDraft :
never;

