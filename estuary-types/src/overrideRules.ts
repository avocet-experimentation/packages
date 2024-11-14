import { z } from "zod";
import { bsonObjectIdHexStringSchema, proportionSchema } from "./util.js";
import { clientPropNameSchema } from "./flagClients.js";

export const ruleTypeSchema = z.enum(["Experiment", "ForcedValue"]);
export type RuleType = z.infer<typeof ruleTypeSchema>;

export const ruleStatusSchema = z.enum([
  "draft",
  "active",
  "paused",
  "completed",
]);
export type RuleStatus = z.infer<typeof ruleStatusSchema>;

export const overrideRuleSchema = z.object({
  type: ruleTypeSchema,
  status: ruleStatusSchema,
  startTimestamp: z.number().int().gte(0).optional(),
  endTimestamp: z.number().int().gte(0).optional(),
  enrollment: z.object({
    attributes: z.array(clientPropNameSchema),
    proportion: proportionSchema,
  }),
});
/**
 * Any rule that causes a flag value to differ from its default, including
 *  experiments and values forced per environment
 */
export interface OverrideRule extends z.infer<typeof overrideRuleSchema> {};
