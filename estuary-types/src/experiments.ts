import { z } from "zod";
import { overrideRuleSchema } from "./overrideRules.js";
import { bsonObjectIdHexStringSchema, nonEmptyStringSchema, nonNegativeIntegerSchema, proportionSchema } from "./util.js";
import { metricSchema } from "./metrics.js";
import { flagCurrentValueSchema } from "./flags/flagValues.js";

const flagStateSchema = z.object({ 
  id: bsonObjectIdHexStringSchema,
  value: flagCurrentValueSchema,
});

const treatmentIdSchema = z.string();

export const treatmentSchema = z.object({
  id: treatmentIdSchema,
  duration: nonNegativeIntegerSchema,
  flagStates: z.array(flagStateSchema),
});
/**
 * A time interval in which a specific combination of flag states is to be applied to subjects
 */
export interface Treatment extends z.infer<typeof treatmentSchema> {};

export const treatmentSequenceIdSchema = z.string();
export const treatmentSequenceSchema = z.object({
  id: treatmentSequenceIdSchema,
  name: z.string(),
  treatmentIds: z.array(treatmentIdSchema),
});
/**
 * A list of IDs of treatments to be executed in order, e.g., "A, B, C", or possibly just one treatment
 */
export interface TreatmentSequence extends z.infer<typeof treatmentSequenceSchema> {};

export const experimentGroupSchema = z.object({
  id: z.string(),
  name: nonEmptyStringSchema,
  description: z.string().optional(),
  proportion: z.number(),
  treatmentSchedule: z.array(treatmentSequenceIdSchema),
});
/**
 * a grouping of users who will receive the same sequences of experiment treatments
 */
export interface ExperimentGroup
  extends z.infer<typeof experimentGroupSchema> {}

export const experimentDraftSchema = overrideRuleSchema.extend({
  name: nonEmptyStringSchema,
  hypothesis: z.string().optional(),
  type: z.literal("Experiment"),
  groups: z.array(experimentGroupSchema),
  dependents: z.array(metricSchema),
  definedTreatments: z.array(treatmentSchema), // treatments created on an Experiment are stored here for reuse
  definedSequences: z.array(treatmentSequenceSchema), // sequences created on an Experiment are stored here for reuse
});

export interface ExperimentDraft
  extends z.infer<typeof experimentDraftSchema> {}
