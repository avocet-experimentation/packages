import { z } from 'zod';
import { ClientConnection, clientConnectionSchema, ClientPropDef, clientPropDefSchema } from './flagClients.js';
import { Environment, environmentSchema } from './environments.js';
import { Experiment, experimentSchema } from './experiments.js';
import { FeatureFlag, featureFlagSchema } from './featureFlags.js';

/**
 * Generic type representing all Zod schema
 */
export type EstuarySchema = z.ZodTypeAny;

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
 * Version that is complete but not yet assigned an ObjectId by MongoDB
 */
export type BeforeId<T extends EstuaryMongoTypes> = Omit<T, 'id' | '_id'>;
/**
 * A partial object with only the minimum fields required to save it as a draft. Might replace this with per-type
 * draft definitions.
 */
export type DraftRecord<T extends EstuaryMongoTypes> = Partial<T> & Required<Pick<T, 'name'>>;
/**
 * Partial object used to update only the provided fields. ID is required.
 */
export type PartialUpdate<T extends EstuaryMongoTypes> = Partial<T> & Required<Pick<T, 'id'>>;