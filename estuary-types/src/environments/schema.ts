import { z } from "zod";
import { environmentNameSchema } from "../helpers/names.js";

// export const environmentNameSchema = z.enum(['prod', 'dev', 'testing', 'staging']);
// /**
//  * This is a placeholder while environment options are hard-coded
//  */
// export type EnvironmentName = z.infer<typeof environmentNameSchema>;


export const environmentDraftSchema = z.object({
  name: environmentNameSchema,
  defaultEnabled: z.boolean(),
});

export interface EnvironmentDraft extends z.infer<typeof environmentDraftSchema> {};
