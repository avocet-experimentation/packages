import { z } from "zod";
import { EnvironmentName, environmentNameSchema } from "../environments.js";
import { experimentReferenceSchema } from "../experiments.js";
import { forcedValueSchema } from "../forcedValue.js";

export const overrideRuleUnionSchema = z.union([experimentReferenceSchema, forcedValueSchema]);

export type OverrideRuleUnion = z.infer<typeof overrideRuleUnionSchema>;

export const flagEnvironmentPropsSchema = z.object({
  name: environmentNameSchema,
  enabled: z.boolean(),
  overrideRules: z.array(overrideRuleUnionSchema),
});
/**
 * Environment-specific data for a `FeatureFlag`
 */
export interface FlagEnvironmentProps extends z.infer<typeof flagEnvironmentPropsSchema> {};

export const flagEnvironmentMappingSchema = z.record(
  environmentNameSchema,
  flagEnvironmentPropsSchema
);
/**
 * Mapping of environment names to `FlagEnvironmentProps`. All properties are optional.
 */

export interface FlagEnvironmentMapping extends z.infer<typeof flagEnvironmentMappingSchema> {};
