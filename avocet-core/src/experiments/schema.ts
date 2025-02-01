import { z } from 'zod';
import {
  overrideRuleSchema,
  ruleStatusSchema,
} from '../override-rules/override-rules.schema.js';
import {
  bsonObjectIdHexStringSchema,
  nonEmptyStringSchema,
  nonNegativeIntegerSchema,
  positiveIntegerSchema,
  primitiveTypeLabelSchema,
  primitiveTypeSchema,
} from '../helpers/bounded-primitives.js';
import { flagCurrentValueSchema } from '../feature-flags/flag-value.js';

/**
 * Dependent variables embedded into Experiments
 */
export const metricSchema = z.object({
  fieldName: z.string(),
  type: primitiveTypeLabelSchema,
});

export const flagStateSchema = z.object({
  id: bsonObjectIdHexStringSchema,
  value: flagCurrentValueSchema,
});
/**
 * A flag ID and the value it is to be set to during a treatment
 */
export interface FlagState extends z.infer<typeof flagStateSchema> {}

const treatmentIdSchema = z.string();

export const treatmentSchema = z.object({
  id: treatmentIdSchema,
  name: z.string(),
  duration: nonNegativeIntegerSchema,
  flagStates: z.array(flagStateSchema),
});

export const experimentGroupSchema = z.object({
  id: z.string(),
  name: nonEmptyStringSchema,
  description: z.string().nullable(),
  proportion: z.number(),
  sequence: z.array(treatmentIdSchema),
  cycles: positiveIntegerSchema,
});

export const conditionReferenceSchema = z
  .tuple([experimentGroupSchema.shape.id, treatmentIdSchema])
  .readonly();
/**
 * A pair of IDs of the elements of a condition, stored on hypotheses
 */
export interface ConditionReference
  extends z.infer<typeof conditionReferenceSchema> {}

export const conditionSchema = z.tuple([
  experimentGroupSchema,
  treatmentSchema,
]);
/**
 * A combination of a group and treatment
 */
export interface Condition extends z.infer<typeof conditionSchema> {}

export const hypothesisSchema = z.object({
  id: z.string(),
  dependentName: z.string(),
  analysis: z.string(), // reference to an analysis technique; todo: correct this as needed
  compareValue: primitiveTypeSchema,
  compareOperator: z.string(),
  baseConditionRef: conditionReferenceSchema,
  testConditionRef: conditionReferenceSchema,
});

export const experimentDraftSchema = overrideRuleSchema.extend({
  name: nonEmptyStringSchema,
  type: z.literal('Experiment'),
  status: ruleStatusSchema,
  groups: z.array(experimentGroupSchema).transform((groups) => {
    const proportionSum = groups.reduce(
      (sum, group) => sum + group.proportion,
      0,
    );
    return groups.map((group) => ({
      ...group,
      proportion: group.proportion / proportionSum,
    }));
  }),
  flagIds: z.array(z.string()),
  definedTreatments: z.record(treatmentIdSchema, treatmentSchema),
  dependents: z.array(metricSchema),
  hypotheses: z.array(hypothesisSchema),
});

export const experimentReferenceSchema = overrideRuleSchema.extend({
  id: bsonObjectIdHexStringSchema,
  type: z.literal('Experiment'),
  status: ruleStatusSchema,
  name: nonEmptyStringSchema,
});
