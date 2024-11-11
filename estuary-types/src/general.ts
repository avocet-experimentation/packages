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

export const flagCurrentValueSchema = z.union([z.boolean(), z.string(), z.number()]);

export type FlagCurrentValue = z.infer<typeof flagCurrentValueSchema>;
