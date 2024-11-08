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


export const flagEnvironmentMappingSchema = z.record(environmentNameSchema, flagEnvironmentSchema);
/**
 * Mapping of environment names to `FlagEnvironment`
 */
export type FlagEnvironmentMapping = Record<EnvironmentName, FlagEnvironment>;

export const flagValueTypeSchema = z.enum([
  "boolean",
  "string",
  "number",
]);
/**
 * A string of the data type of a flag's value
 */
export type FlagValueType = z.infer<typeof flagValueTypeSchema>;

export const featureFlagSchema = z.object({
  id: z.string(),
  name: z.string(),
  description: z.string().optional(),
  createdAt: nonnegativeIntegerSchema.optional(),
  updatedAt: nonnegativeIntegerSchema.optional(),
  environments: flagEnvironmentMappingSchema,
  valueType: flagValueTypeSchema,
  defaultValue: z.string(),
});
/**
 * Flag objects available in the backend
 */
export type FeatureFlag = z.infer<typeof featureFlagSchema>;

export const featureFlagStubSchema = featureFlagSchema
  .omit({ environments: true })
  .extend({
    environments: z.record(environmentNameSchema, flagEnvironmentSchema.pick({ enabled: true })),
  });

export const featureFlagMappingSchema = z.record(flagNameSchema, featureFlagSchema);
/**
 * Mapping of flag names to their server-side data
 */
export type FeatureFlagMapping = z.infer<typeof featureFlagMappingSchema>;

export const featureFlagClientDataSchema = featureFlagSchema
  .pick({ name: true, valueType: true, defaultValue: true })
  .and(
    z.object({
      currentValue: z.string(),
    }),
  );
/**
 * Feature flag data available to the client SDK
 */
export type FeatureFlagClientData = z.infer<typeof featureFlagClientDataSchema>;  

export const clientFlagMappingSchema = z.record(z.string(), featureFlagClientDataSchema);
/**
 * Mapping of flag names to their client-side data
 */
export type ClientFlagMapping = z.infer<typeof clientFlagMappingSchema>;
