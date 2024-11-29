import { z } from "zod";
import { experimentReferenceSchema } from "../experiments/schema.js";
import { forcedValueSchema } from "./forced-value.schema.js";


export const overrideRuleSchemaList = [
  experimentReferenceSchema,
  forcedValueSchema,
] as const;

export const overrideRuleUnionSchema = z.union(overrideRuleSchemaList);

export type OverrideRuleUnion = z.infer<typeof overrideRuleUnionSchema>;
type overrideRuleSchemaFromType<T extends OverrideRuleUnion['type']> = T extends 'ForcedValue' ? typeof forcedValueSchema : T extends 'Experiment' ? typeof experimentReferenceSchema : never;

export type overrideRuleSchemaMapping = {
  [T in OverrideRuleUnion['type']]: overrideRuleSchemaFromType<T>;
};

export const overrideRuleSchemaMap: overrideRuleSchemaMapping = {
  ForcedValue: forcedValueSchema,
  Experiment: experimentReferenceSchema,
};

export const getOverrideRuleSchemaFromType = <T extends OverrideRuleUnion>(
  type: T['type']
): (typeof overrideRuleSchemaList)[number] => {
  switch (type) {
    case 'ForcedValue': return forcedValueSchema;
    case 'Experiment': return experimentReferenceSchema;
    default: throw new TypeError(`Type ${type} must match OverrideRuleUnion['type']!`);
  }
};
