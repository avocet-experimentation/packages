import { z } from "zod";

export const flagCurrentValueSchema = z.union([z.boolean(), z.string(), z.number()]);
/**
 * All supported flag value types
 */
export type FlagCurrentValue = z.infer<typeof flagCurrentValueSchema>;

export const flagBooleanValueSchema = z.object({
  type: z.literal("boolean"),
  default: z.boolean(),
});
export const flagStringValueSchema = z.object({
  type: z.literal("string"),
  default: z.string(),
});
export const flagNumberValueSchema = z.object({
  type: z.literal("number"),
  default: z.number(),
});

export const flagValueDefSchema = z.union([
  flagBooleanValueSchema,
  flagNumberValueSchema,
  flagStringValueSchema,
]);
/**
 * The definition of a feature flag's data type and default value
 */
export type FlagValueDef = z.infer<typeof flagValueDefSchema>;


