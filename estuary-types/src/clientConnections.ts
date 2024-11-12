import { z } from "zod";

/* FOR DEFINING CLIENT APP CONNECTIONS TO FEATURE FLAGGING SERVICE */

const clientConnectionSchema = z.object({
  id: z.string(),
  name: z.string(),
  environmentId: z.string(),
  // clientKeyHash: z.string(), // TBD
});

export type ClientConnection = z.infer<typeof clientConnectionSchema>;