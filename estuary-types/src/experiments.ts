import { z } from "zod";
import { eventTelemetrySchema } from "./telemetry.js";
import { overrideRuleSchema } from "./overrideRules.js";
import { nonEmptyStringSchema, nonNegativeIntegerSchema } from "./util.js";
import { flagCurrentValueSchema } from "./flags/flagValues.js";

export const experimentBlockSchema = z.object({
  id: z.string(),
  startTimestamp: nonNegativeIntegerSchema.optional(),
  endTimestamp: nonNegativeIntegerSchema.optional(),
  flagValue: flagCurrentValueSchema,
});
/**
 * a block is a period of time in which a specific intervention is applied to subjects
 */
export interface ExperimentBlock
  extends z.infer<typeof experimentBlockSchema> {}

export const experimentGroupSchema = z.object({
  id: z.string(),
  name: nonEmptyStringSchema,
  description: z.string().optional(), // omit?
  proportion: z.number(),
  blocks: z.array(experimentBlockSchema),
});
/**
 * a grouping of users to be subjected to a sequence of experiment blocks
 */
export interface ExperimentGroup
  extends z.infer<typeof experimentGroupSchema> {}

export const experimentDraftSchema = overrideRuleSchema.extend({
  name: nonEmptyStringSchema,
  hypothesis: z.string().optional(),
  type: z.literal("Experiment"),
  groups: z.array(experimentGroupSchema),
  flagId: z.string(),
  dependents: z.array(eventTelemetrySchema),
});

export interface ExperimentDraft
  extends z.infer<typeof experimentDraftSchema> {}
