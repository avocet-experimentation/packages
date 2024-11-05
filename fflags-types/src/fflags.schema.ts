import { z } from "zod";
import { overrideRuleSchema } from "./overrideRules.schema.js";

export const flagNameSchema = z.string();

export const flagEnvironmentNameSchema = z.union([
  z.literal("prod"),
  z.literal("dev"),
  z.literal("testing"),
]);


export const flagEnvironmentSchema = z.object({
  enabled: z.boolean(),
  overrideRules: z.array(overrideRuleSchema),
});

export const flagEnvironmentsSchema = z.record(
  flagEnvironmentNameSchema,
  flagEnvironmentSchema,
);

export const featureFlagSchema = z.object({
  id: z.string(),
  name: flagNameSchema,
  description: z.string(),
  createdAt: z.number(),
  updatedAt: z.number(),
  environments: flagEnvironmentsSchema,
  valueType: z.union([
    z.literal("boolean"),
    z.literal("string"),
    z.literal("number"),
  ]),
  defaultValue: z.string(),
});

export const featureFlagClientDataSchema = featureFlagSchema
  .pick({ name: true, valueType: true, defaultValue: true })
  .and(
    z.object({
      currentValue: z.string(),
    }),
  );

export const featureFlagsSchema = z.record(flagNameSchema, featureFlagSchema);
