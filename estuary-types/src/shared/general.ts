import { z } from 'zod';
import {
  ClientConnectionDraft,
  clientConnectionDraftSchema,
} from '../flag-clients/client-connections.schema.js';
import { environmentDraftSchema } from '../environments/schema.js';
import { experimentDraftSchema } from '../experiments/schema.js';
import { featureFlagDraftSchema } from '../feature-flags/schema.js';
import { RequireOnly } from '../helpers/utility-types.js';
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
  userSchema,
  User,
} from './imputed.js';
import { userDraftSchema } from '../users/schema.js';
import { FeatureFlagDraft } from '../feature-flags/classes.js';
import { ExperimentDraft } from '../experiments/classes.js';
import { clientPropDefDraftSchema } from '../flag-clients/client-props.schema.js';
import { ClientPropDefDraft } from '../flag-clients/classes.js';
import { UserDraft } from '../users/classes.js';
import { EnvironmentDraft } from '../environments/classes.js';

export const estuaryDraftSchema = z.union([
  featureFlagDraftSchema,
  experimentDraftSchema,
  environmentDraftSchema,
  clientPropDefDraftSchema,
  clientConnectionDraftSchema,
  userDraftSchema,
]);
/**
 * Union of draft types
 */
export type EstuaryDraft =
  | FeatureFlagDraft
  | ExperimentDraft
  | EnvironmentDraft
  | ClientPropDefDraft
  | ClientConnectionDraft
  | UserDraft;

export const estuaryMongoTypesSchema = z.union([
  featureFlagSchema,
  experimentSchema,
  environmentSchema,
  clientPropDefSchema,
  clientConnectionSchema,
  userSchema,
]);
/**
 * Union of types stored in MongoDB
 */
export type EstuaryMongoTypes =
  | FeatureFlag
  | Experiment
  | Environment
  | ClientPropDef
  | ClientConnection
  | User; // later: users and event types

// export type EstuaryMongoType<T extends EstuaryMongoTypes> = T;
/**
 * Mapping of MongoTypes to the types of their schema.
 * Useful for ensuring that the right schema is passed in
 * when passing in `T` as a generic type argument
 */
export type EstuarySchema<T extends EstuaryMongoTypes> = T extends FeatureFlag
  ? typeof featureFlagSchema
  : T extends Experiment
    ? typeof experimentSchema
    : T extends Environment
      ? typeof environmentSchema
      : T extends ClientPropDef
        ? typeof clientPropDefSchema
        : T extends ClientConnection
          ? typeof clientConnectionSchema
          : T extends User
            ? typeof userSchema
            : never;

/**
 * Mapping of records to drafts
 */
export type DraftRecord<T extends EstuaryMongoTypes> = T extends FeatureFlag
  ? FeatureFlagDraft
  : T extends Experiment
    ? ExperimentDraft
    : T extends Environment
      ? EnvironmentDraft
      : T extends ClientPropDef
        ? ClientPropDefDraft
        : T extends ClientConnection
          ? ClientConnectionDraft
          : T extends User
            ? UserDraft
            : never;

/**
 * Version that is complete but not yet assigned an ObjectId by MongoDB
 */
export type BeforeId<T extends EstuaryDraft> = Omit<T, 'id' | '_id'>;
/**
 * Partial object used to update only the provided fields. Only the `id` field is required.
 */
export type PartialUpdate<T extends EstuaryMongoTypes> = RequireOnly<T, 'id'>;
