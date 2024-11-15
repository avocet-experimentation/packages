import { z } from "zod";
import { nonEmptyStringSchema } from "./util.js";
import { flagCurrentValueSchema } from './flags/flagValues.js';
import { flagNameSchema } from "./lib/names.js";

/**
 * For client app connections to the cattails feature flagging service
 */
export const clientConnectionDraftSchema = z.object({
  name: nonEmptyStringSchema,
  description: z.string().optional(),
  environmentId: z.string(),
  // clientKeyHash: z.string(), // TBD
});

export interface ClientConnectionDraft extends z.infer<typeof clientConnectionDraftSchema> {};
/**
 * Keys of the attributes passed into the client SDK when initialized and used for experiment/flag assignment
 */
export const clientPropNameSchema = z.string().min(1);

export const clientPropValueSchema = z.enum(['boolean', 'string', 'number']);
export type ClientPropValue = z.infer<typeof clientPropValueSchema>;
/**
 * Mapping of client property names to their values
 */
export const clientPropMappingSchema = z.record(clientPropNameSchema, clientPropValueSchema);
/**
 * prop name-value mapping sent by the client SDK when establishing a connection
 */
export interface ClientPropMapping extends z.infer<typeof clientPropMappingSchema> {};


export const clientPropDefDraftSchema = z.object({
  name: nonEmptyStringSchema,
  description: z.string().optional(),
  dataType: clientPropValueSchema,
  isIdentifier: z.boolean(),
});
/**
 * Definition of a client property visible server-side
 */
export interface ClientPropDefDraft extends z.infer<typeof clientPropDefDraftSchema> {};


export const flagClientValueSchema = z.object({
  value: flagCurrentValueSchema,
  hash: z.number(), // override rule hash
});
/**
 * The response sent to the client when checking the value of a flag
 */
export interface FlagClientValue extends z.infer<typeof flagClientValueSchema> {};


export const flagClientMappingSchema = z.record(
  flagNameSchema,
  flagClientValueSchema
);
/**
 * Mapping of flag names to their client-side data
 */
export interface FlagClientMapping extends z.infer<typeof flagClientMappingSchema> {};


export const flagAttributesSchema = z.object({
  'feature_flag.key': nonEmptyStringSchema,
  'feature_flag.provider_name': z.literal('estuary-exp'),
  'feature_flag.variant': z.string(),
  'feature_flag.hash': z.string(),
});
/**
 * For embedding in telemetry data. See https://opentelemetry.io/docs/specs/semconv/feature-flags/feature-flags-spans/
 * and https://opentelemetry.io/docs/specs/semconv/general/attribute-requirement-level/
 */
export interface FlagAttributes extends z.infer<typeof flagAttributesSchema> {};
