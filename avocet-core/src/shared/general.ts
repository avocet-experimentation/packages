import { z } from 'zod';
import { sdkConnectionDraftSchema } from '../flag-sdk/client-connections.schema.js';
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
  SDKConnection,
  sdkConnectionSchema,
  userSchema,
  User,
} from './imputed.js';
import { userDraftSchema } from '../users/schema.js';
import { FeatureFlagDraft } from '../feature-flags/classes.js';
import { ExperimentDraft } from '../experiments/classes.js';
import { clientPropDefDraftSchema } from '../flag-sdk/client-props.schema.js';
import { SDKConnectionDraft, ClientPropDefDraft } from '../flag-sdk/classes.js';
import { UserDraft } from '../users/classes.js';
import { EnvironmentDraft } from '../environments/classes.js';

export const avocetDraftSchema = z.union([
  featureFlagDraftSchema,
  experimentDraftSchema,
  environmentDraftSchema,
  clientPropDefDraftSchema,
  sdkConnectionDraftSchema,
  userDraftSchema,
]);
/**
 * Union of draft types
 */
export type AvocetDraft =
  | FeatureFlagDraft
  | ExperimentDraft
  | EnvironmentDraft
  | ClientPropDefDraft
  | SDKConnectionDraft
  | UserDraft;

export const avocetMongoTypesSchema = z.union([
  featureFlagSchema,
  experimentSchema,
  environmentSchema,
  clientPropDefSchema,
  sdkConnectionSchema,
  userSchema,
]);
/**
 * Union of types stored in MongoDB
 */
export type AvocetMongoTypes =
  | FeatureFlag
  | Experiment
  | Environment
  | ClientPropDef
  | SDKConnection
  | User; // later: users and event types

/**
 * Mapping of MongoTypes to the types of their schema.
 * Useful for ensuring that the right schema is passed in
 * when passing in `T` as a generic type argument
 */
export type AvocetSchema<T extends AvocetMongoTypes> = T extends FeatureFlag
  ? typeof featureFlagSchema
  : T extends Experiment
    ? typeof experimentSchema
    : T extends Environment
      ? typeof environmentSchema
      : T extends ClientPropDef
        ? typeof clientPropDefSchema
        : T extends SDKConnection
          ? typeof sdkConnectionSchema
          : T extends User
            ? typeof userSchema
            : never;

/**
 * Mapping of records to drafts
 */
export type DraftRecord<T extends AvocetMongoTypes> = T extends FeatureFlag
  ? FeatureFlagDraft
  : T extends Experiment
    ? ExperimentDraft
    : T extends Environment
      ? EnvironmentDraft
      : T extends ClientPropDef
        ? ClientPropDefDraft
        : T extends SDKConnection
          ? SDKConnectionDraft
          : T extends User
            ? UserDraft
            : never;

/**
 * Version that is complete but not yet assigned an ObjectId by MongoDB
 */
export type BeforeId<T extends AvocetDraft> = Omit<T, 'id' | '_id'>;
/**
 * Partial object used to update only the provided fields. Only the `id` field is required.
 */
export type PartialUpdate<T extends AvocetMongoTypes> = RequireOnly<T, 'id'>;
