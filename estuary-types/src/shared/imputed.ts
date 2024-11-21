
import { z } from "zod";
import { featureFlagDraftSchema } from "../feature-flags/schema.js";
import { clientConnectionDraftSchema } from "../flag-clients/client-connections.schema.js";
import { environmentDraftSchema, environmentNameSchema } from "../environments/schema.js";
import { bsonObjectIdHexStringSchema, bsonDateSchema } from "../helpers/bounded-primitives.js";
import { experimentDraftSchema } from "../experiments/schema.js";
import { userDraftSchema } from "../users/schema.js";
import { clientPropDefDraftSchema } from "../flag-clients/client-props.schema.js";

/* SCHEMA FOR TYPES WITH PROPERTIES IMPUTED BY CATTAILS */

export const imputedBaseSchema = z.object({
  id: bsonObjectIdHexStringSchema,
  createdAt: bsonDateSchema,
  updatedAt: bsonDateSchema,
});
/**
 * Parent type for application documents after being fetched from MongoDB.
 * For the union of document types, see `EstuaryMongoTypes`
 */
export interface ImputedBase extends z.infer<typeof imputedBaseSchema> { }


export const featureFlagSchema = featureFlagDraftSchema.merge(imputedBaseSchema);
export interface FeatureFlag extends z.infer<typeof featureFlagSchema> {};


export const experimentSchema = experimentDraftSchema.merge(imputedBaseSchema);
export interface Experiment extends z.infer<typeof experimentSchema> {};


export interface ExperimentSummary extends Pick<Experiment,
  'id' | 
  'type' | 
  'name' | 
  'groups' | 
  'status' | 
  'enrollment' | 
  'createdAt' |
  'updatedAt'
> {};


export const environmentSchema = environmentDraftSchema.merge(imputedBaseSchema);
/**
 * Environment options as defined through the dashboard
 */
export interface Environment extends z.infer<typeof environmentSchema> {};


export const clientPropDefSchema = clientPropDefDraftSchema.merge(imputedBaseSchema);
/**
 * Definition of a client property visible server-side
 */
export interface ClientPropDef extends z.infer<typeof clientPropDefSchema> {};


export const clientConnectionSchema = clientConnectionDraftSchema.merge(imputedBaseSchema);
/**
 * For client app connections to the cattails feature flagging service
 */
export interface ClientConnection extends z.infer<typeof clientConnectionSchema> { };

export const userSchema = userDraftSchema.merge(imputedBaseSchema);
/**
 * (Not yet implemented) Dashboard user account objects tracking permissions.
 */
export interface User extends z.infer<typeof userSchema> {};