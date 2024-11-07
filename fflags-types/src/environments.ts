import { z } from "zod";
/**
 * This is a placeholder while environment options are hard-coded
 */
export const environmentNameSchema = z.enum(['prod', 'dev', 'testing', 'staging']);
/**
 * 
 */
export const environmentSchema = z.object({
  id: z.string(),
  name: environmentNameSchema,
  description: z.string(),
  defaultEnabled: z.boolean(),
});

export type EnvironmentName = z.infer<typeof environmentNameSchema>;

export type Environment = z.infer<typeof environmentSchema>;
