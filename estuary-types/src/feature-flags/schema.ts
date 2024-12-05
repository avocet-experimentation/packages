import { z } from 'zod';
import { flagNameSchema } from '../helpers/names.js';
import { nonEmptyStringSchema } from '../helpers/bounded-primitives.js';
import { flagValueDefSchema } from './flag-value.js';
import { overrideRuleUnionSchema } from '../override-rules/override-rule-union.schema.js';

export const featureFlagDraftSchema = z.object({
  name: nonEmptyStringSchema,
  description: z.string().nullable(),
  value: flagValueDefSchema,
  environmentNames: z.record(z.string(), z.literal(true)),
  overrideRules: z.array(overrideRuleUnionSchema),
});

export const featureFlagMappingSchema = z.record(
  flagNameSchema,
  featureFlagDraftSchema,
);
/**
 * Mapping of flag names to their server-side data
 */
export interface FeatureFlagMapping
  extends z.infer<typeof featureFlagMappingSchema> {}
