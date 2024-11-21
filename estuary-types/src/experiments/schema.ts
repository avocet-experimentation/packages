import { z } from "zod";
import {
  enrollmentSchema,
  overrideRuleSchema,
  ruleStatusSchema,
} from "../override-rules/override-rules.schema.js";
import { 
  bsonObjectIdHexStringSchema, 
  nonEmptyStringSchema, 
  nonNegativeIntegerSchema, 
  positiveIntegerSchema,
 } from "../helpers/bounded-primitives.js";
import { metricSchema } from "../metrics/schema.js";
import { flagCurrentValueSchema } from "../helpers/flag-value.js";
import { environmentNameSchema } from "../helpers/names.js";

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
  description: z.string().optional(),
  proportion: z.number(),
  sequence: z.array(treatmentIdSchema),
  cycles: positiveIntegerSchema,
});

export const experimentDraftSchema = overrideRuleSchema.extend({
  name: nonEmptyStringSchema,
  hypothesis: z.string().optional(),
  type: z.literal("Experiment"),
  groups: z.array(experimentGroupSchema),
  flagIds: z.array(z.string()),
  dependents: z.array(metricSchema),
  definedTreatments: z.record(treatmentIdSchema, treatmentSchema), // treatments created on an Experiment are stored here for reuse
});

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