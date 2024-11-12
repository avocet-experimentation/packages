import { z } from "zod";
import { flagCurrentValueSchema } from "./general.js";
import { overrideRuleSchema } from "./overrideRules.js";

export const forcedValueSchema = overrideRuleSchema.extend({
  type: z.literal('ForcedValue'),
  value: flagCurrentValueSchema,
});
/**
 * A value forced for all users. Permits a simple override of a flag's default value on a per-environment basis.
 */
export type ForcedValue = z.infer<typeof forcedValueSchema>;