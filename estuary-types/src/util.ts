import { z } from 'zod';

/* UTILITY TYPES FOR OTHER SCHEMA AND TYPES IN THIS PACKAGE */

export const nonNegativeIntegerSchema = z.number().int().gte(0);
/**
 * Represents a portion of a whole between 0 and 1, inclusive
 */
export const proportionSchema = z.number().gte(0).lte(1);

export const nonEmptyStringSchema = z.string().min(1);

export const objectIdHexStringSchema = z.string().length(24);

export const defaultEmptyStringSchema = z.string().default('');
/**
 * See https://www.mongodb.com/docs/manual/reference/bson-types/#std-label-document-bson-type-date
 */
export const optionalBsonDateSchema = z.number().int().optional();

export const estuaryBaseSchema = z.object({
  id: objectIdHexStringSchema,
  name: nonEmptyStringSchema,
  description: z.string().optional(),
  createdAt: optionalBsonDateSchema,
  updatedAt: optionalBsonDateSchema,
});
/**
 * Parent type for application documents after being fetched from MongoDB.
 * For the union of document types, see `EstuaryMongoTypes`
 */
export interface EstuaryBase extends z.infer<typeof estuaryBaseSchema> {};

export const flagCurrentValueSchema = z.union([z.boolean(), z.string(), z.number()]);
/**
 * All supported flag value types
 */
export type FlagCurrentValue = z.infer<typeof flagCurrentValueSchema>;

export const flagAttributesSchema = z.object({
  'feature_flag.key': z.string(),
  'feature_flag.provider_name': z.literal('estuary-exp'),
  'feature_flag.variant': flagCurrentValueSchema,
  'feature_flag.hash': z.union([z.number(), z.string()]), // todo: narrow down
})
/**
 * For embedding in telemetry data. See https://opentelemetry.io/docs/specs/semconv/feature-flags/feature-flags-spans/
 * and https://opentelemetry.io/docs/specs/semconv/general/attribute-requirement-level/
 */
export interface FlagAttributes extends z.infer<typeof flagAttributesSchema> {};

export const flagNameSchema = z.string();