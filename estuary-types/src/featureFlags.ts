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

const baseFeatureFlagSchema = z.object({
  id: z.string(),
  name: z.string(),
  description: z.string().optional(),
  createdAt: nonnegativeIntegerSchema.optional(),
  updatedAt: nonnegativeIntegerSchema.optional(),
  environments: flagEnvironmentMappingSchema,
  valueType: flagValueTypeSchema,
  defaultValue: z.union([z.boolean(), z.string(), z.number()]),
});

export const featureFlagSchema = baseFeatureFlagSchema.superRefine(
  (data, ctx) => {
    if (
      data.valueType === "boolean" &&
      typeof data.defaultValue !== "boolean"
    ) {
      ctx.addIssue({
        code: "custom",
        path: ["defaultValue"],
        message: "defaultValue must be a boolean when valueType is 'boolean'.",
      });
    } else if (
      data.valueType === "string" &&
      typeof data.defaultValue !== "string"
    ) {
      ctx.addIssue({
        code: "custom",
        path: ["defaultValue"],
        message: "defaultValue must be a string when valueType is 'string'.",
      });
    } else if (
      data.valueType === "number" &&
      typeof data.defaultValue !== "number"
    ) {
      ctx.addIssue({
        code: "custom",
        path: ["defaultValue"],
        message: "defaultValue must be a number when valueType is 'number'.",
      });
    }
  }
);

/**
 * Flag objects available in the backend
 */
export type FeatureFlag = z.infer<typeof featureFlagSchema>;

export const featureFlagStubSchema = baseFeatureFlagSchema
  .omit({ environments: true })
  .extend({
    environments: z.record(
      environmentNameSchema,
      flagEnvironmentSchema.pick({ enabled: true })
    ),
  })
  .superRefine((data, ctx) => {
    // Add the same refinement here if needed
    if (
      data.valueType === "boolean" &&
      typeof data.defaultValue !== "boolean"
    ) {
      ctx.addIssue({
        code: "custom",
        path: ["defaultValue"],
        message: "defaultValue must be a boolean when valueType is 'boolean'.",
      });
    } else if (
      data.valueType === "string" &&
      typeof data.defaultValue !== "string"
    ) {
      ctx.addIssue({
        code: "custom",
        path: ["defaultValue"],
        message: "defaultValue must be a string when valueType is 'string'.",
      });
    } else if (
      data.valueType === "number" &&
      typeof data.defaultValue !== "number"
    ) {
      ctx.addIssue({
        code: "custom",
        path: ["defaultValue"],
        message: "defaultValue must be a number when valueType is 'number'.",
      });
    }
  });

export const featureFlagMappingSchema = z.record(
  flagNameSchema,
  featureFlagSchema
);

/**
 * Mapping of flag names to their server-side data
 */
export type FeatureFlagMapping = z.infer<typeof featureFlagMappingSchema>;

export const featureFlagClientDataSchema = baseFeatureFlagSchema
  .pick({ name: true, valueType: true, defaultValue: true })
  .and(
    z.object({
      currentValue: z.string(),
    })
  )
  .superRefine((data, ctx) => {
    // Add the same refinement here if needed
    if (
      data.valueType === "boolean" &&
      typeof data.defaultValue !== "boolean"
    ) {
      ctx.addIssue({
        code: "custom",
        path: ["defaultValue"],
        message: "defaultValue must be a boolean when valueType is 'boolean'.",
      });
    } else if (
      data.valueType === "string" &&
      typeof data.defaultValue !== "string"
    ) {
      ctx.addIssue({
        code: "custom",
        path: ["defaultValue"],
        message: "defaultValue must be a string when valueType is 'string'.",
      });
    } else if (
      data.valueType === "number" &&
      typeof data.defaultValue !== "number"
    ) {
      ctx.addIssue({
        code: "custom",
        path: ["defaultValue"],
        message: "defaultValue must be a number when valueType is 'number'.",
      });
    }
  });
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
