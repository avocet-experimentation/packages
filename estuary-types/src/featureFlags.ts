import { z } from "zod";
import { flagNameSchema } from "./lib/names.js";
import { nonEmptyStringSchema } from "./util.js";
import { flagEnvironmentMappingSchema } from "./flags/flagEnvironments.js";
import { flagValueDefSchema } from "./flags/flagValues.js";

export const featureFlagDraftSchema = z.object({
  name: nonEmptyStringSchema,
  description: z.string().optional(),
  value: flagValueDefSchema,
  environments: flagEnvironmentMappingSchema,
});

export interface FeatureFlagDraft extends z.infer<typeof featureFlagDraftSchema> {};


export const featureFlagMappingSchema = z.record(
  flagNameSchema,
  featureFlagDraftSchema
);
/**
 * Mapping of flag names to their server-side data
 */
export interface FeatureFlagMapping extends z.infer<typeof featureFlagMappingSchema> {};