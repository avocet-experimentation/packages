import { z } from "zod";
import { eventTelemetrySchema } from "./telemetry.js";
import { overrideRuleSchema } from "./overrideRules.js";
import { estuaryBaseSchema, flagCurrentValueSchema, flagNameSchema, nonNegativeIntegerSchema, objectIdHexStringSchema, proportionSchema } from "./util.js";
import { metricSchema } from "./metrics.js";

export const interventionSchema = z.array(z.object({ 
  id: objectIdHexStringSchema,
  value: flagCurrentValueSchema
}));
/**
 * A combination of flags and specific values, that defines the intervention applied during a block
 */
export interface Intervention extends z.infer<typeof interventionSchema> {};

const experimentBlockIdSchema = z.string();

export const experimentBlockSchema = z.object({
  id: experimentBlockIdSchema,
  duration: nonNegativeIntegerSchema,
  intervention: interventionSchema,
});
/**
 * A period of time in which a specific intervention is applied to subjects
 */
export interface ExperimentBlock extends z.infer<typeof experimentBlockSchema> {};

export const blockSequenceIdSchema = z.string();
export const blockSequenceSchema = z.object({
  id: blockSequenceIdSchema,
  name: z.string(),
  blockIds: z.array(experimentBlockIdSchema),
});
/**
 * A sequence of blocks executed back-to-back, e.g., "A, B"
 */
export interface BlockSequence extends z.infer<typeof blockSequenceSchema> {};

export const experimentGroupSchema = z.object({
  id: z.string(),
  proportion: proportionSchema,
  sequences: z.array(z.object({
    id: blockSequenceIdSchema,
    count: nonNegativeIntegerSchema, // the number of times to repeat a given sequence
  })),
});
/**
 * a grouping of users to be subjected to sequences of experiment blocks
 */
export interface ExperimentGroup extends z.infer<typeof experimentGroupSchema>{};

export const experimentSchema = estuaryBaseSchema.merge(overrideRuleSchema).extend({
  hypothesis: z.string(),
  type: z.literal("Experiment"),
  groups: z.array(experimentGroupSchema),
  dependents: z.array(metricSchema),
  definedBlocks: z.array(experimentBlockSchema),
  definedSequences: z.array(blockSequenceSchema),
});

export interface Experiment extends z.infer<typeof experimentSchema> {};
