import { z } from "zod";
import { clientSessionAttributeSchema } from "./attributes.js";
import { flagValueTypeSchema } from "./fflags.js";
import { eventTelemetrySchema } from "./telemetry.js";

export const ruleTypeSchema = z.enum(['Experiment', 'ForcedValue']);

export const ruleStatusSchema = z.enum([
  "draft",
  "active",
  "in_test",
  "paused",
  "completed",
  "disabled",
  "archived",
]);

export const overrideRuleSchema = z.object({
  id: z.string(),
  type: ruleTypeSchema,
  description: z.string(),
  status: ruleStatusSchema,
  startTimestamp: z.number().int().gte(0).optional(),
  endTimestamp: z.number().int().gte(0).optional(),
  enrollment: z.object({
    attributes: z.array(clientSessionAttributeSchema),
    proportion: z.number(),
  }),
});

export const interventionSchema = z.record(z.string());

export const experimentBlockSchema = z.object({
  id: z.string(),
  name: z.string(),
  startTimestamp: z.number().int().gte(0).optional(),
  endTimestamp: z.number().int().gte(0).optional(),
  flagValue: flagValueTypeSchema,
});

export const experimentGroupSchema = z.object({
  id: z.string(),
  name: z.string(),
  proportion: z.number(),
  blocks: z.array(experimentBlockSchema),
  gap: z.number(),
});

export const experimentSchema = overrideRuleSchema.extend({
  name: z.string(),
  type: z.literal('Experiment'),
  groups: z.array(experimentGroupSchema),
  flagId: z.string(),
  dependents: z.array(eventTelemetrySchema),
});

export const forcedValueSchema = overrideRuleSchema.extend({
  type: z.literal('ForcedValue'),
  value: flagValueTypeSchema,
});

export type RuleType = z.infer<typeof ruleTypeSchema>;

export type RuleStatus = z.infer<typeof ruleStatusSchema>;

/**
 * Any rule that causes a flag value to differ from its default, including
 *  experiments and values forced per environment
 */
export type OverrideRule = z.infer<typeof overrideRuleSchema>;

// for supporting multivariate experiments later
export type Intervention = z.infer<typeof interventionSchema>;

/**
 * a block is a period of time in which a specific intervention is applied to subjects
 */
export type ExperimentBlock = z.infer<typeof experimentBlockSchema>;

/**
 * a grouping of users to be subjected to a sequence of experiment blocks
 */
export type ExperimentGroup = z.infer<typeof experimentGroupSchema>;

export type Experiment = z.infer<typeof experimentSchema>;
/**
 * A value forced for all users. Permits a simple override of a flag's default value on a per-environment basis.
 */
export type ForcedValue = z.infer<typeof forcedValueSchema>;