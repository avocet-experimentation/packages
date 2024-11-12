import { z } from "zod";
import { EnvironmentName, environmentNameSchema } from "./environments.js";
import { flagCurrentValueSchema, nonNegativeIntegerSchema } from "./util.js";
import { experimentSchema } from "./experiments.js";
import { forcedValueSchema } from "./forcedValue.js";

export const overrideRuleUnionSchema = z.union([experimentSchema, forcedValueSchema]);

export const flagNameSchema = z.string();
/**
 * Placeholder
 */
export type FlagName = string;

export const flagEnvironmentSchema = z.object({
  name: z.string(),
  enabled: z.boolean(),
  overrideRules: z.array(overrideRuleUnionSchema),
});
/**
 * Environment-specific data for a `FeatureFlag`
 */
export type FlagEnvironment = z.infer<typeof flagEnvironmentSchema>;

export const flagEnvironmentMappingSchema = z.record(
  environmentNameSchema,
  flagEnvironmentSchema
);
/**
 * Mapping of environment names to `FlagEnvironment`
 */
export type FlagEnvironmentMapping = Record<EnvironmentName, FlagEnvironment>;

const flagBooleanValueSchema = z.object({
  type: z.literal("boolean"),
  default: z.boolean(),
});

const flagStringValueSchema = z.object({
  type: z.literal("string"),
  default: z.string(),
});

const flagNumberValueSchema = z.object({
  type: z.literal("number"),
  default: z.number(),
});

export const flagValueDefSchema = z.union([
  flagBooleanValueSchema,
  flagNumberValueSchema,
  flagStringValueSchema,
]);
/**
 * The definition of a feature flag's data type and default value
 */
export type FlagValueDef = z.infer<typeof flagValueDefSchema>;

export const featureFlagSchema = z.object({
  id: z.string(),
  name: z.string(),
  description: z.string().optional(),
  createdAt: nonNegativeIntegerSchema.optional(),
  updatedAt: nonNegativeIntegerSchema.optional(),
  environments: flagEnvironmentMappingSchema,
  value: flagValueDefSchema,
});
/**
 * Flag objects available in the backend
 */
export type FeatureFlag = z.infer<typeof featureFlagSchema>;

export const featureFlagStubSchema = featureFlagSchema
  .omit({ environments: true })
  .extend({
    environments: z.record(
      environmentNameSchema,
      flagEnvironmentSchema.pick({ enabled: true })
    ),
  });

export const featureFlagMappingSchema = z.record(
  flagNameSchema,
  featureFlagSchema
);
/**
 * Mapping of flag names to their server-side data
 */
export type FeatureFlagMapping = z.infer<typeof featureFlagMappingSchema>;
