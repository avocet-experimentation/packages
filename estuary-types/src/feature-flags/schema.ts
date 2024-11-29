import { z } from "zod";
import { flagNameSchema } from "../helpers/names.js";
import { nonEmptyStringSchema } from "../helpers/bounded-primitives.js";
import { experimentReferenceSchema } from "../experiments/schema.js";
import { forcedValueSchema } from "../override-rules/forced-value.schema.js";
import { flagValueDefSchema } from "./flag-value.js";

export const overrideRuleSchemaList = [
  experimentReferenceSchema,
  forcedValueSchema,
] as const;

export const overrideRuleUnionSchema = z.union(overrideRuleSchemaList);

export type OverrideRuleUnion = z.infer<typeof overrideRuleUnionSchema>;

type overrideRuleSchemaFromType<T extends OverrideRuleUnion['type']> = 
T extends 'ForcedValue' ? typeof forcedValueSchema :
T extends 'Experiment' ? typeof experimentReferenceSchema :
never;

export type overrideRuleSchemaMapping = {
  [T in OverrideRuleUnion['type']]: overrideRuleSchemaFromType<T>
}

export const overrideRuleSchemaMap: overrideRuleSchemaMapping = {
  ForcedValue: forcedValueSchema,
  Experiment: experimentReferenceSchema,
}

export const getOverrideRuleSchemaFromType = <T extends OverrideRuleUnion>(
  type: T['type'],
): typeof overrideRuleSchemaList[number] => {
  switch(type) {
    case 'ForcedValue': return forcedValueSchema;
    case 'Experiment': return experimentReferenceSchema;
    default: throw new TypeError(`Type ${type} must match OverrideRuleUnion['type']!`);
  }
}

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

