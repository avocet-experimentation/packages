import { z } from "zod";
import { eventTelemetrySchema } from "./telemetry.schema.js";
import { featureFlagSchema } from "./fflags.schema.js";
import { overrideRuleSchema } from "./overrideRules.schema.js";

export const interventionSchema = z.record(z.string());

export const experimentBlockSchema = z.object({
  id: z.string(),
  name: z.string(),
  startTimestamp: z.number().int().gte(0).optional(),
  endTimestamp: z.number().int().gte(0).optional(),
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
