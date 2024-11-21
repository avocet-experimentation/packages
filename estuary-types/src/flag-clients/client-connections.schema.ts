import { z } from "zod";
import { nonEmptyStringSchema } from "../helpers/bounded-primitives.js";
import { flagNameSchema } from "../helpers/names.js";
import { flagCurrentValueSchema } from "../helpers/flag-value.js";

/**
 * For client app connections to the cattails feature flagging service
 */
export const clientConnectionDraftSchema = z.object({
  name: nonEmptyStringSchema,
  description: z.string().optional(),
  environmentId: z.string(),
  // clientKeyHash: z.string(), // TBD
});

export interface ClientConnectionDraft extends z.infer<typeof clientConnectionDraftSchema> {};