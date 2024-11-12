import { z } from 'zod';
import { ClientConnection, ClientPropDef } from './flagClients.js';
import { Environment } from './environments.js';
import { Experiment } from './experiments.js';
import { FeatureFlag } from './featureFlags.js';

/**
 * Generic type for all schema defined in this package
 * todo:
 * - replace with ZodType<>, narrowing it down so that object schema methods can be invoked on them
 */
export type EstuarySchema = z.ZodTypeAny;
// export type EstuarySchema = z.ZodType<any, any, any>;

export const inferSchema = <S extends EstuarySchema>(schema: S) => schema;

/**
 * Base types that stores a hex string representing an ObjectId on the `id` property
 */
export type EstuaryMongoTypes = FeatureFlag | Experiment | Environment | ClientPropDef | ClientConnection; // later: users and event types


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