import { z } from "zod";
import { enrollmentSchema, overrideRuleSchema, ruleStatusSchema } from "./overrideRules.js";
import { bsonObjectIdHexStringSchema, nonEmptyStringSchema, nonNegativeIntegerSchema, positiveIntegerSchema, proportionSchema } from "./util.js";
import { metricSchema } from "./metrics.js";
import { flagCurrentValueSchema } from "./flags/flagValues.js";
import { environmentNameSchema } from "./environments.js";

export const flagStateSchema = z.object({ 
  id: bsonObjectIdHexStringSchema, // flag id
  value: flagCurrentValueSchema,
});

export interface FlagState extends z.infer<typeof flagStateSchema> {};

const treatmentIdSchema = z.string();

export const treatmentSchema = z.object({
  id: treatmentIdSchema,
  name: z.string(),
  duration: nonNegativeIntegerSchema,
  flagStates: z.array(flagStateSchema),
});
/**
 * A time interval in which a specific combination of flag states is to be applied to subjects
 */
export interface Treatment extends z.infer<typeof treatmentSchema> {};

const treatmentSequenceIdSchema = z.string();
export const treatmentSequenceSchema = z.object({
  id: treatmentSequenceIdSchema,
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
  sequenceId: treatmentSequenceIdSchema.optional(),
  cycles: positiveIntegerSchema,
});
/**
 * a grouping of users who will receive the same sequences of experiment treatments
 */
export interface ExperimentGroup
  extends z.infer<typeof experimentGroupSchema> {};

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
  extends z.infer<typeof experimentDraftSchema> {};

export const experimentReferenceSchema = z.object({
  id: bsonObjectIdHexStringSchema, // object id of the full experiment document
  type: z.literal('ExperimentReference'),
  status: ruleStatusSchema,
  name: nonEmptyStringSchema,
  environmentName: environmentNameSchema,
  startTimestamp: nonNegativeIntegerSchema.optional(),
  endTimestamp: nonNegativeIntegerSchema.optional(),
  enrollment: enrollmentSchema,
});
/**
 * Stored on flags instead of experiments themselves
 */
export interface ExperimentReference extends z.infer<typeof experimentReferenceSchema> {};
