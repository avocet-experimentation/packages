import { z } from "zod";
import { environmentNameSchema } from "../environments.js";
import { experimentDraftSchema } from "../experiments.js";
import { forcedValueSchema } from "../forcedValue.js";

export const overrideRuleUnionSchema = z.union([experimentDraftSchema, forcedValueSchema]);

export const flagEnvironmentPropsSchema = z.object({
  name: z.string(),
  enabled: z.boolean(),
  overrideRules: z.array(overrideRuleUnionSchema),
});
/**
 * Environment-specific data for a `FeatureFlag`
 */
export interface FlagEnvironmentProps extends z.infer<typeof flagEnvironmentPropsSchema> { };

export const flagEnvironmentMappingSchema = z.record(
  environmentNameSchema,
  flagEnvironmentPropsSchema
);
/**
 * Mapping of environment names to `FlagEnvironment`
 */

export interface FlagEnvironmentMapping extends z.infer<typeof flagEnvironmentMappingSchema> { };
