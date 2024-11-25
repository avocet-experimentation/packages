import { z } from "zod";
import { overrideRuleSchema } from "../override-rules/override-rules.schema.js";
import { 
  bsonObjectIdHexStringSchema, 
  nonEmptyStringSchema, 
  nonNegativeIntegerSchema, 
  positiveIntegerSchema,
 } from "../helpers/bounded-primitives.js";
import { metricSchema } from "../metrics/schema.js";
import { flagCurrentValueSchema } from "../feature-flags/flag-value.js";

export const flagStateSchema = z.object({ 
  id: bsonObjectIdHexStringSchema,
  value: flagCurrentValueSchema,
});
/**
 * A flag ID and the value it is to be set to during a treatment
 */
export interface FlagState extends z.infer<typeof flagStateSchema> {};

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

export const experimentDraftSchema = overrideRuleSchema.extend({
  name: nonEmptyStringSchema,
  hypothesis: z.string().nullable(),
  type: z.literal("Experiment"),
  groups: z.array(experimentGroupSchema),
  flagIds: z.array(z.string()),
  dependents: z.array(metricSchema),
  definedTreatments: z.record(treatmentIdSchema, treatmentSchema), // treatments created on an Experiment are stored here for reuse
});

export const experimentReferenceSchema = overrideRuleSchema.extend({
  id: bsonObjectIdHexStringSchema, // object id of the full experiment document
  type: z.literal('ExperimentReference'),
  name: nonEmptyStringSchema,
});