import { z } from "zod";
import { estuaryBaseSchema } from "./util.js";

export const environmentNameSchema = z.enum(['prod', 'dev', 'testing', 'staging']);
/**
 * This is a placeholder while environment options are hard-coded
 */
export type EnvironmentName = z.infer<typeof environmentNameSchema>;

/**
 * Environments defined in the dashboard
 */
export const environmentSchema = estuaryBaseSchema.extend({
  name: environmentNameSchema,
  defaultEnabled: z.boolean(),
});

export type Environment = z.infer<typeof environmentSchema>;
