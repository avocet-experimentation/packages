import { z } from "zod";
import { eventTelemetrySchema } from "./telemetry.js";
import { overrideRuleSchema } from "./overrideRules.js";
import { estuaryBaseSchema, flagCurrentValueSchema, nonNegativeIntegerSchema } from "./util.js";
import { flagNameSchema } from "./featureFlags.js";

export const interventionSchema = z.record(flagNameSchema, flagCurrentValueSchema);
/**
 * for supporting multivariate experiments later, replacing experimentBlockSchema.flagValue with .intervention
 */
export interface Intervention extends z.infer<typeof interventionSchema> {};

export const experimentBlockSchema = estuaryBaseSchema.extend({
  id: z.string(),
  startTimestamp: nonNegativeIntegerSchema.optional(),
  endTimestamp: nonNegativeIntegerSchema.optional(),
  flagValue: flagCurrentValueSchema,
});
/**
 * a block is a period of time in which a specific intervention is applied to subjects
 */
export interface ExperimentBlock extends z.infer<typeof experimentBlockSchema> {};

export const experimentGroupSchema = estuaryBaseSchema.extend({
  id: z.string(),
  proportion: z.number(),
  blocks: z.array(experimentBlockSchema),
  // gap: z.number(), // later: gap between interventions
});
/**
 * a grouping of users to be subjected to a sequence of experiment blocks
 */
export interface ExperimentGroup extends z.infer<typeof experimentGroupSchema>{};

export const experimentSchema = overrideRuleSchema.extend({
  name: z.string(),
  hypothesis: z.string(),
  type: z.literal("Experiment"),
  groups: z.array(experimentGroupSchema),
  flagId: z.string(),
  dependents: z.array(eventTelemetrySchema),
});

export interface Experiment extends z.infer<typeof experimentSchema> {};
