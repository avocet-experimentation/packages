import { z } from "zod";
import { bsonObjectIdHexStringSchema, nonNegativeIntegerSchema, proportionSchema } from "./util.js";
import { clientPropNameSchema } from "./flagClients.js";
import { environmentNameSchema } from "./environments.js";

export const ruleTypeSchema = z.enum(["Experiment", "ForcedValue"]);
export type RuleType = z.infer<typeof ruleTypeSchema>;

export const ruleStatusSchema = z.enum([
  "draft",
  "active",
  "paused",
  "completed",
]);
export type RuleStatus = z.infer<typeof ruleStatusSchema>;

export const enrollmentSchema = z.object({
  attributes: z.array(clientPropNameSchema),
  proportion: proportionSchema,
});

export interface Enrollment extends z.infer<typeof enrollmentSchema> {};

export const overrideRuleSchema = z.object({
  type: ruleTypeSchema,
  status: ruleStatusSchema,
  description: z.string().optional(),
  environment: environmentNameSchema,
  startTimestamp: nonNegativeIntegerSchema.optional(),
  endTimestamp: nonNegativeIntegerSchema.optional(),
  enrollment: enrollmentSchema,
});
/**
 * Any rule that causes a flag value to differ from its default, including
 *  experiments and values forced per environment
 */
export interface OverrideRule extends z.infer<typeof overrideRuleSchema> {};
