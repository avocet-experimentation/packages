import { z } from 'zod';
import { flagCurrentValueSchema } from '../feature-flags/flag-value.js';
import { overrideRuleSchema } from './override-rules.schema.js';

export const forcedValueSchema = overrideRuleSchema.extend({
  id: z.string(),
  type: z.literal('ForcedValue'),
  value: flagCurrentValueSchema,
});
