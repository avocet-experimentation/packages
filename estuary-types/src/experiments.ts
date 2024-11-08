import { z } from "zod";
import { eventTelemetrySchema } from "./telemetry.js";
import { overrideRuleSchema } from "./overrideRules.js";
import { flagValueTypeSchema } from "./general.js";

export const experimentBlockSchema = z.object({
  id: z.string(),
  name: z.string(),
  startTimestamp: z.number().int().gte(0).optional(),
  endTimestamp: z.number().int().gte(0).optional(),
  flagValue: flagValueTypeSchema,
});
/**
 * a block is a period of time in which a specific intervention is applied to subjects
 */
export type ExperimentBlock = z.infer<typeof experimentBlockSchema>;


export const experimentGroupSchema = z.object({
  id: z.string(),
  name: z.string(),
  proportion: z.number(),
  blocks: z.array(experimentBlockSchema),
  gap: z.number(),
});
/**
 * a grouping of users to be subjected to a sequence of experiment blocks
 */
export type ExperimentGroup = z.infer<typeof experimentGroupSchema>;


export const experimentSchema = overrideRuleSchema.extend({
  name: z.string(),
  type: z.literal('Experiment'),
  groups: z.array(experimentGroupSchema),
  flagId: z.string(),
  dependents: z.array(eventTelemetrySchema),
});

export type Experiment = z.infer<typeof experimentSchema>;