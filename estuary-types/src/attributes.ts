import { z } from 'zod';

export const textPrimitiveSchema = z.union([
  z.string(),
  z.number(),
  z.boolean(),
]);
export type TextPrimitive = z.infer<typeof textPrimitiveSchema>;

const stringOrNullishSchema = z.string().nullish();
const numberOrNullishSchema = z
  .number()
  .nullish()
  .refine((val) => !Number.isNaN(val));
const booleanOrNullishSchema = z.boolean().nullish();

export const nullishOrTextPrimitiveArraySchema = z.union([
  z.array(stringOrNullishSchema),
  z.array(numberOrNullishSchema),
  z.array(booleanOrNullishSchema),
]);

export type NullishOrTextPrimitiveArray = z.infer<
  typeof nullishOrTextPrimitiveArraySchema
>;

/**
 * See https://opentelemetry.io/docs/specs/otel/common/#attribute
 */
export const oTelAttributeNameSchema = z
  .string()
  .refine(
    (val) => val === val.toLowerCase() && !(/\s/.test(val) && val.length > 0),
    {
      message:
        'Attribute names must be lowercase, non-empty and contain no whitespace.',
    },
  );

export const oTelAttributeValueSchema = z.union([
  textPrimitiveSchema,
  nullishOrTextPrimitiveArraySchema,
]);
/**
 * See https://open-telemetry.github.io/opentelemetry-js/modules/_opentelemetry_api.html#AttributeValue
 */
export type OTelAttributeValue = z.infer<typeof oTelAttributeValueSchema>;

export const flatRecordSchema = z.record(z.string(), oTelAttributeValueSchema);

export type FlatRecord = z.infer<typeof flatRecordSchema>;
