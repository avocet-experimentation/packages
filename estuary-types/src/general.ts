import { z } from 'zod';

export const nonnegativeIntegerSchema = z.number().int().gte(0);

export const proportionSchema = z.number().gte(0).lte(1);

/**
 * 
 * todo:
 * - make other schema extend this schema
 * - add stricter checks on `id` consistent with ObjectId constraints
 */
export const estuaryBaseSchema = z.object({
  id: z.string(),
  name: z.string(),
  description: z.string().optional(),
});

/**
 * Top type for application documents stored in MongoDB
 */
export type EstuaryBase = z.infer<typeof estuaryBaseSchema>;

/**
 * Generic type for all schema defined in this package
 */
export type EstuarySchema<S extends EstuaryBase> = z.ZodType<S>;

export const flagCurrentValueSchema = z.union([z.boolean(), z.string(), z.number()]);

export type FlagCurrentValue = z.infer<typeof flagCurrentValueSchema>;

const textPrimitiveSchema = z.union([z.string(), z.number(), z.boolean()]);

const stringOrNullishSchema = z.union([z.string(), z.null(), z.undefined()]);
const numberOrNullishSchema = z.union([z.number(), z.null(), z.undefined()]);
const booleanOrNullishSchema = z.union([z.boolean(), z.null(), z.undefined()]);

const primitiveArraySchema = z.union([
  z.array(stringOrNullishSchema),
  z.array(numberOrNullishSchema),
  z.array(booleanOrNullishSchema),
]);

export const flatRecordSchema = z.record(z.string(), z.union([
  textPrimitiveSchema,
  primitiveArraySchema,
]));

export type FlatRecord = z.infer<typeof flatRecordSchema>;