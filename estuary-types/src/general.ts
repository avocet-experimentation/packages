import { z } from 'zod';

export const nonnegativeIntegerSchema = z.number().int().gte(0);

export const proportionSchema = z.number().gte(0).lte(1);

/**
 * Top type for all schema defined in this package
 * todo: 
 */
export type EstuarySchema<StaticType> = z.ZodType<StaticType>;
// example usage
// const schema1: z.ZodType<FeatureFlag> = featureFlagSchema;

// export const flagValueTypeSchema = z.enum([
//   "boolean",
//   "string",
//   "number",
// ]);
// /**
//  * A string of the data type of a flag's value
//  */
// export type FlagValueType = z.infer<typeof flagValueTypeSchema>;
