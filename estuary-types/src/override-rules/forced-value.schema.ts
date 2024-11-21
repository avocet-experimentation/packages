import { z } from "zod";
import { flagCurrentValueSchema } from "../helpers/flag-value.js";
import { overrideRuleSchema } from "./override-rules.schema.js";

export const forcedValueSchema = overrideRuleSchema.extend({
  type: z.literal('ForcedValue'),
  value: flagCurrentValueSchema,
});
/**
 * A value forced for all users. Permits a simple override of a flag's default value
 * on a per-environment basis, optionally with a start or end time.
 */
export interface ForcedValue extends z.infer<typeof forcedValueSchema> {};