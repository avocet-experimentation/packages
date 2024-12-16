import { z } from 'zod';
import { flagNameSchema } from '../helpers/names.js';
import { flagCurrentValueSchema } from '../feature-flags/flag-value.js';
import { featureFlagSchema } from '../shared/imputed.js';

/* CLIENT SDK */

export const clientSDKFlagValueSchema = z.object({
  value: flagCurrentValueSchema.nullable(),
  metadata: z.string().nullable(),
});
/**
 * Data sent to the client when checking the value of a flag
 */
export interface ClientSDKFlagValue
  extends z.infer<typeof clientSDKFlagValueSchema> {}

export const clientSDKFlagMappingSchema = z.record(
  flagNameSchema,
  clientSDKFlagValueSchema,
);
/**
 * Mapping of flag names to their client-side data
 */
export interface ClientSDKFlagMapping
  extends z.infer<typeof clientSDKFlagMappingSchema> {}

/* SERVER SDK */

export const serverSDKFlagValueSchema = z.object({
  value: flagCurrentValueSchema.nullable(),
  metadata: z.string().nullable(),
});
/**
 * (WIP) Data sent to the server SDK when checking the value of a flag
 */
export interface ServerSDKFlagValue
  extends z.infer<typeof serverSDKFlagValueSchema> {}

export const serverSDKFlagMappingSchema = z.record(
  flagNameSchema,
  featureFlagSchema,
);
/**
 * (WIP) Mapping of flag names to their server-side data
 */
export interface ServerSDKFlagMapping
  extends z.infer<typeof serverSDKFlagMappingSchema> {}
