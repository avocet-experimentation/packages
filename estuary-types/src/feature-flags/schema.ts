import { z } from "zod";
import { flagNameSchema } from "../helpers/names.js";
import { nonEmptyStringSchema, trueSchema } from "../helpers/bounded-primitives.js";
import { experimentReferenceSchema } from "../experiments/schema.js";
import { forcedValueSchema } from "../override-rules/forced-value.schema.js";
import { flagValueDefSchema } from "./flag-value.js";

export const overrideRuleUnionSchema = z.union([
  experimentReferenceSchema,
  forcedValueSchema,
]);

export type OverrideRuleUnion = z.infer<typeof overrideRuleUnionSchema>;

export const featureFlagDraftSchema = z.object({
  name: nonEmptyStringSchema,
  description: z.string().nullable(),
  value: flagValueDefSchema,
  environmentNames: z.record(z.string(), z.literal(true)),
  overrideRules: z.array(overrideRuleUnionSchema),
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

