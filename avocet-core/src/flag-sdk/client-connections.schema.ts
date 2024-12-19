import { z } from 'zod';
import { nonEmptyStringSchema } from '../helpers/bounded-primitives.js';

/**
 * For applications to connect to the feature flagging API
 */
export const sdkConnectionDraftSchema = z.object({
  name: nonEmptyStringSchema,
  description: z.string().nullable(),
  environmentId: z.string(),
  clientKeyHash: z.string(),
  allowedOrigins: z.array(z.string()),
});
