import { z } from 'zod';

/* UTILITY SCHEMA AND TYPES */

export const nonNegativeIntegerSchema = z.number().int().gte(0);
export const positiveIntegerSchema = z.number().int().gte(1);
/**
 * Represents a portion of a whole between 0 and 1, inclusive
 */
export const proportionSchema = z.number().gte(0).lte(1);

/** .default might cause type inference problems */
export const defaultEmptyStringSchema = z.string().default('');

export const nonEmptyStringSchema = z.string().min(1);

export const bsonObjectIdHexStringSchema = z.string().length(24);

/**
 * Similar to Unix timestamp, but also accepts negative values indicating dates before 1970.
 * See https://www.mongodb.com/docs/manual/reference/bson-types/#std-label-document-bson-type-date
 */
export const bsonDateSchema = z.number().int();
