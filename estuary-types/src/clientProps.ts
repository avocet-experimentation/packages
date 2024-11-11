import { z } from "zod";

// export const clientAttributeDataSchema = z.enum([
//   "string",
//   "number",
//   "boolean",
// ]);

// export const clientPropSchema = z.object({
//   name: z.string(), // might remove this
//   dataType: clientAttributeDataSchema,
//   value: z.string(),
// });

export const clientPropNameSchema = z.string();

export const clientPropValueSchema = z.union([z.boolean(), z.string(), z.number()]);
/**
 * Mapping of attribute names to their values
 */
export const clientPropMappingSchema = z.record(z.string(), clientPropValueSchema);

// export type ClientAttributeData = z.infer<typeof clientAttributeDataSchema>;

/**
 * Keys of the attributes passed into the client SDK when initialized and used for experiment/flag assignment
 * dataType is used to type-coerce attribute values
 */
// export type clientProp = z.infer<typeof clientPropSchema>;

export type ClientPropMapping = z.infer<typeof clientPropMappingSchema>;