import { z } from 'zod';
/* UTILITY TYPES FOR OTHER DEFINITIONS IN THIS PACKAGE */

export const nonNegativeIntegerSchema = z.number().int().gte(0);
/**
 * Represents a portion of a whole; between 0 and 1, inclusive
 */
export const proportionSchema = z.number().gte(0).lte(1);

/**
 * todo:
 * - make other schema extend this schema
 * - create id schema with stricter checks on `id` consistent with ObjectId constraints
 */
export const estuaryBaseSchema = z.object({
  id: z.string(),
  name: z.string(),
  description: z.string().default(''),
});
/**
 * Top type for application documents after being fetched from MongoDB
 */
export type EstuaryBase = z.infer<typeof estuaryBaseSchema>;

export const flagCurrentValueSchema = z.union([z.boolean(), z.string(), z.number()]);

export type FlagCurrentValue = z.infer<typeof flagCurrentValueSchema>;
