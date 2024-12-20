import { z } from 'zod';

/* UTILITY SCHEMA AND TYPES */

export const nonNegativeIntegerSchema = z.number().int().gte(0);
export const positiveIntegerSchema = z.number().int().gte(1);

export const unsigned32BitIntSchema = z
  .number()
  .int()
  .gte(0)
  .lte(2 ** 32);
/**
 * Represents a portion of a whole between 0 and 1, inclusive
 */
export const proportionSchema = z.number().gte(0).lte(1);

export const nonEmptyStringSchema = z.string().min(1);

export const bsonObjectIdHexStringSchema = z.string().length(24);

/**
 * Similar to Unix timestamp, but also accepts negative values indicating dates before 1970.
 * See https://www.mongodb.com/docs/manual/reference/bson-types/#std-label-document-bson-type-date
 */
export const bsonDateSchema = z.number().int();

export const trueSchema = z.boolean().refine((data) => data === true);

export const primitiveTypeLabels = ['string', 'number', 'boolean'] as const;
export const primitiveTypeLabelSchema = z.enum(primitiveTypeLabels);
export type PrimitiveTypeLabel = (typeof primitiveTypeLabels)[number];

export type AnyPrimitive =
  | string
  | number
  | bigint
  | symbol
  | boolean
  | null
  | undefined;
