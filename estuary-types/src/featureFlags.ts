import { z } from "zod";
import { overrideRuleSchema } from "./overrideRules.js";
import { EnvironmentName, environmentNameSchema } from "./environments.js";
import { nonnegativeIntegerSchema } from "./general.js";

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

export const flagCurrentValueSchema = z.union([z.boolean(), z.string(), z.number()]);

export type FlagCurrentValue = z.infer<typeof flagCurrentValueSchema>;

export const flagClientValueSchema = z.object({
  value: flagCurrentValueSchema,
  hash: z.number(), // override rule hash
});
/**
 * The response sent to the client when checking the value of a flag
 */
export type FlagClientValue = z.infer<typeof flagClientValueSchema>;

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

export type FlagValue = z.infer<typeof flagValueDefSchema>;

export const featureFlagSchema = z.object({
  id: z.string(),
  name: z.string(),
  description: z.string().optional(),
  createdAt: nonnegativeIntegerSchema.optional(),
  updatedAt: nonnegativeIntegerSchema.optional(),
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

export const flagClientMappingSchema = z.record(
  z.string(),
  flagClientValueSchema
);
/**
 * Mapping of flag names to their client-side data
 */
export type FlagClientMapping = z.infer<typeof flagClientMappingSchema>;
