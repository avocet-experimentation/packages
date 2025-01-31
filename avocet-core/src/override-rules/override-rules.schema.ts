import { z } from 'zod';
import {
  nonNegativeIntegerSchema,
  proportionSchema,
} from '../helpers/bounded-primitives.js';
import { clientPropNameSchema } from '../flag-sdk/client-props.schema.js';
import { environmentNameSchema } from '../helpers/names.js';

export const ruleTypeSchema = z.enum(['Experiment', 'ForcedValue']);
export type RuleType = z.infer<typeof ruleTypeSchema>;

export const ruleStatusSchema = z.enum([
  'draft',
  'active',
  'paused',
  'completed',
]);
export type RuleStatus = z.infer<typeof ruleStatusSchema>;

export const enrollmentSchema = z.object({
  attributes: z.array(clientPropNameSchema),
  proportion: proportionSchema,
});

export const overrideRuleSchema = z.object({
  type: ruleTypeSchema,
  description: z.string().nullable(),
  environmentName: environmentNameSchema,
  startTimestamp: nonNegativeIntegerSchema.nullable(),
  endTimestamp: nonNegativeIntegerSchema.nullable(),
  enrollment: enrollmentSchema,
});

/**
 * Any rule that causes a flag value to differ from its default, including
 *  experiments and values forced per environment
 */
export interface OverrideRule extends z.infer<typeof overrideRuleSchema> {}
