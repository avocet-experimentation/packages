import { z } from "zod";
import { featureFlagSchema } from "./fflags.schema.js";

export const clientAttributeDataSchema = z.union([
  z.literal("string"),
  z.literal("number"),
  z.literal("boolean"),
]);


export const clientSessionAttributeSchema = z.object({
  name: z.string(),
  dataType: clientAttributeDataSchema,
});

export const ruleStatusSchema = z.union([
  z.literal("draft"),
  z.literal("active"),
  z.literal("in_test"),
  z.literal("paused"),
  z.literal("completed"),
  z.literal("disabled"),
  z.literal("archived"),
]);

export const overrideRuleSchema = z.object({
  id: z.string(),
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


const eventTelemetrySchema = z.any();

export const experimentBlockSchema = z.object({
  id: z.string(),
  name: z.string(),
  startTimestamp: z.number().optional(),
  endTimestamp: z.number().optional(),
  flagValue: featureFlagSchema.shape.valueType,
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
  groups: z.array(experimentGroupSchema),
  flagId: z.string(),
  dependents: z.array(eventTelemetrySchema),
});
