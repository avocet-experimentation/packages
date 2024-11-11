import { z } from "zod";
import { overrideRuleSchema } from "./overrideRules.js";
import { EnvironmentName, environmentNameSchema } from "./environments.js";
import { flagValueTypeSchema, nonnegativeIntegerSchema } from "./general.js";

export const flagNameSchema = z.string();
/**
 * Placeholder
 */
export type FlagName = string;

export const flagEnvironmentSchema = z.object({
  name: z.string(),
  enabled: z.boolean(),
  overrideRules: z.array(overrideRuleSchema),
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

const flagValueSchema = z.union([
  flagBooleanValueSchema,
  flagNumberValueSchema,
  flagStringValueSchema,
]);

export const featureFlagSchema = z.object({
  id: z.string(),
  name: z.string(),
  description: z.string().optional(),
  createdAt: nonnegativeIntegerSchema.optional(),
  updatedAt: nonnegativeIntegerSchema.optional(),
  environments: flagEnvironmentMappingSchema,
  value: flagValueSchema,
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

export const featureFlagClientDataSchema = featureFlagSchema
  .pick({ name: true, value: true })
  .and(
    z.object({
      currentValue: z.string(),
    })
  );

/**
 * Feature flag data available to the client SDK
 */
export type FeatureFlagClientData = z.infer<typeof featureFlagClientDataSchema>;

export const clientFlagMappingSchema = z.record(
  z.string(),
  featureFlagClientDataSchema
);
/**
 * Mapping of flag names to their client-side data
 */
export type ClientFlagMapping = z.infer<typeof clientFlagMappingSchema>;
