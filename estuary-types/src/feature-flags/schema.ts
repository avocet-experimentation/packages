import { z } from "zod";
import { environmentNameSchema, flagNameSchema } from "../helpers/names.js";
import { nonEmptyStringSchema } from "../helpers/bounded-primitives.js";
import { experimentReferenceSchema } from "../experiments/schema.js";
import { forcedValueSchema } from "../override-rules/forced-value.schema.js";
import { flagValueDefSchema } from "../helpers/flag-value.js";

export const overrideRuleUnionSchema = z.union([
  experimentReferenceSchema,
  forcedValueSchema,
]);

export type OverrideRuleUnion = z.infer<typeof overrideRuleUnionSchema>;

export const flagEnvironmentPropsSchema = z.object({
  name: environmentNameSchema,
  enabled: z.boolean(),
  overrideRules: z.array(overrideRuleUnionSchema),
});

export const flagEnvironmentMappingSchema = z.record(
  z.string(),
  flagEnvironmentPropsSchema
);

export const featureFlagDraftSchema = z.object({
  name: nonEmptyStringSchema,
  description: z.string().nullable(),
  value: flagValueDefSchema,
  environments: flagEnvironmentMappingSchema,
});


export const featureFlagMappingSchema = z.record(
  flagNameSchema,
  featureFlagDraftSchema
);
/**
 * Mapping of flag names to their server-side data
 */
export interface FeatureFlagMapping 
  extends z.infer<typeof featureFlagMappingSchema> {};

