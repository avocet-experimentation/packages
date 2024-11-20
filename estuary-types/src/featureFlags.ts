import { z } from "zod";
import { flagNameSchema } from "./lib/names.js";
import { nonEmptyStringSchema } from "./helpers/util.js";
import { flagValueDefSchema } from "./flags/flagValues.js";
import { environmentNameSchema } from "./environments.js";
import { experimentReferenceSchema } from "./experiments.js";
import { forcedValueSchema } from "./forcedValue.js";

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
  environmentNameSchema,
  flagEnvironmentPropsSchema
);
/**
 * Mapping of environment names to `FlagEnvironmentProps`. All properties are optional.
 */
export interface FlagEnvironmentMapping 
  extends z.infer<typeof flagEnvironmentMappingSchema> {};

export const featureFlagDraftSchema = z.object({
  name: nonEmptyStringSchema,
  description: z.string().optional(),
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

