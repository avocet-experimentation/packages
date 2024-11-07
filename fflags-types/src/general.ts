import { z } from 'zod';

export const nonnegativeIntegerSchema = z.number().int().gte(0);

/**
 * Top type for all schema defined in this package
 * todo: 
 */
export type EstuarySchema<StaticType> = z.ZodType<StaticType>;
// example usage
// const schema1: z.ZodType<FeatureFlag> = featureFlagSchema;
