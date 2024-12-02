import { z } from "zod";
import { nonEmptyStringSchema } from "../helpers/bounded-primitives.js";
import { flagNameSchema } from "../helpers/names.js";
import { flagCurrentValueSchema } from "../feature-flags/flag-value.js";

export const flagClientValueSchema = z.object({
  value: flagCurrentValueSchema.nullable(),
  hash: z.string().nullable(),
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
