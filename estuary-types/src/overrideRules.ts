import { z } from "zod";
import { clientSessionAttributeSchema } from "./attributes.js";
import { flagValueTypeSchema, proportionSchema } from "./general.js";

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
    proportion: proportionSchema,
  }),
});

export const interventionSchema = z.record(z.string());

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
 * A value forced for all users. Permits a simple override of a flag's default value on a per-environment basis.
 */
export type ForcedValue = z.infer<typeof forcedValueSchema>;