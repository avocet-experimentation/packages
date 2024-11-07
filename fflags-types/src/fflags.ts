import { z } from "zod";
import { overrideRuleSchema } from "./overrideRules.js";
import { environmentNameSchema } from "./environments.js";
import { nonnegativeIntegerSchema } from "./general.js";

/**
 * Placeholder
 */
export const flagNameSchema = z.string();

/**
 * Environment-specific data for a `FeatureFlag`
 */
export const flagEnvironmentSchema = z.object({
  name: z.string(),
  enabled: z.boolean(),
  overrideRules: z.array(overrideRuleSchema),
});
/**
 * Mapping of environment names to objects
 */
export const flagEnvironmentMappingSchema = z.record(environmentNameSchema, flagEnvironmentSchema);

export const flagValueTypeSchema = z.enum([
  "boolean",
  "string",
  "number",
]);

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

export const featureFlagMappingSchema = z.record(flagNameSchema, featureFlagSchema);

export const featureFlagClientDataSchema = featureFlagSchema
  .pick({ name: true, valueType: true, defaultValue: true })
  .and(
    z.object({
      currentValue: z.string(),
    }),
  );


export const clientFlagMappingSchema = z.record(z.string(), featureFlagClientDataSchema);

export type FlagName = string;

export type FlagEnvironmentName = z.infer<typeof environmentNameSchema>;

export type FlagEnvironment = z.infer<typeof flagEnvironmentSchema>;

export type FlagEnvironmentMapping = Record<FlagEnvironmentName, FlagEnvironment>;
/**
 * A string of the data type of a flag's value
 */
export type FlagValueType = z.infer<typeof flagValueTypeSchema>;

/**
 * Flag objects available in the backend
 */
export type FeatureFlag = z.infer<typeof featureFlagSchema>;
/**
 * Feature flag data available to the client SDK
 */
export interface FeatureFlagClientData extends Pick<FeatureFlag, 'name' | 'valueType' | 'defaultValue'> {
  currentValue: string;
}

export type ClientFlagMapping = z.infer<typeof clientFlagMappingSchema>;

/**
 * A map of flag names to properties
 */
export type FeatureFlags = Record<FlagName, FeatureFlag>;
